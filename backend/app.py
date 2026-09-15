from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import gc
import base64
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
import tensorflow as tf
import numpy as np
import cv2

# -------------------------------------------------
# TENSORFLOW CONFIGURATION (CPU‑ONLY)
# -------------------------------------------------
# Disable GPU visibility to avoid unnecessary GPU memory allocation on Render
# (Render free tier does not provide GPU resources).
try:
    tf.config.set_visible_devices([], 'GPU')
except Exception as e:
    # If no GPU is present this will raise; we can safely ignore.
    pass


# ------------------------------------------------------------------
# Grad‑CAM utilities are optional; import them lazily.
# They are needed only for the `/predict_gradcam` endpoint.
try:
    from gradcam import generate_gradcam, get_explanation
except ModuleNotFoundError:
    def _missing_gradcam(*_args, **_kwargs):
        raise ModuleNotFoundError(
            "Optional dependency `gradcam` is not installed. "
            "The `/predict_gradcam` endpoint cannot be used."
        )
    generate_gradcam = _missing_gradcam
    get_explanation = _missing_gradcam
# ------------------------------------------------------------------


# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)
CORS(app)


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "deepshield_final.keras"
)

YUNET_PATH = os.path.join(
    BASE_DIR,
    "models",
    "face_detection_yunet_2023mar.onnx"
)


# =========================================================
# SETTINGS
# =========================================================

INPUT_SIZE = (260, 260)

FINAL_THRESHOLD = 0.65  # calibrated starting threshold

YUNET_CONFIDENCE = 0.55

YUNET_NMS_THRESHOLD = 0.3

YUNET_TOP_K = 5000

FACE_MARGIN = 0.20


# =========================================================
# LOAD MODEL
# =========================================================

print("Loading DeepShield model...")

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

print("DeepShield model loaded successfully.")

# Load TensorFlow Lite model for low‑memory inference
TFLITE_PATH = os.path.join(BASE_DIR, "models", "deepshield_final.tflite")
print(f"Loading TFLite model from {TFLITE_PATH}")
_tflite_interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
_tflite_interpreter.allocate_tensors()
_tflite_input_details = _tflite_interpreter.get_input_details()
_tflite_output_details = _tflite_interpreter.get_output_details()
_tflite_input_index = _tflite_input_details[0]["index"]
_tflite_output_index = _tflite_output_details[0]["index"]
print("TFLite model loaded successfully.")


# =========================================================
# LOAD YUNET
# =========================================================

print("Loading YuNet face detector...")

yunet = cv2.FaceDetectorYN.create(
    YUNET_PATH,
    "",
    (320, 320),
    YUNET_CONFIDENCE,
    YUNET_NMS_THRESHOLD,
    YUNET_TOP_K
)

print("YuNet loaded successfully.")


# =========================================================
# CONVERT IMAGE TO BASE64
# =========================================================

def image_to_base64(image):

    success, encoded_image = cv2.imencode(
        ".jpg",
        image
    )

    if not success:
        return None

    image_bytes = encoded_image.tobytes()

    base64_string = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    return base64_string


# =========================================================
# CREATE GRAD-CAM OVERLAY
# =========================================================

def create_gradcam_overlay(
    face_crop,
    heatmap
):

    # Resize heatmap to 260x260
    heatmap_resized = cv2.resize(
        heatmap,
        INPUT_SIZE
    )

    # Convert 0-1 to 0-255
    heatmap_uint8 = np.uint8(
        heatmap_resized * 255
    )

    # Create color heatmap
    heatmap_color = cv2.applyColorMap(
        heatmap_uint8,
        cv2.COLORMAP_JET
    )

    # Make sure face crop is BGR
    face_bgr = cv2.cvtColor(
        face_crop,
        cv2.COLOR_RGB2BGR
    )

    # Combine original face and heatmap
    overlay = cv2.addWeighted(
        face_bgr,
        0.55,
        heatmap_color,
        0.45,
        0
    )

    return overlay


# =========================================================
# HOME
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({

        "project": "DeepShield",

        "status": "Backend running",

        "model": "EfficientNetB2",

        "input_size": "260x260",

        "threshold": FINAL_THRESHOLD,

        "features": [
            "Face Detection",
            "Deepfake Prediction",
            "Grad-CAM",
            "Why Fake Explanation"
        ]

    })


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "Backend running"
    })


# =========================================================
# PREDICT IMAGE
# =========================================================

@app.route(
    "/predict",
    methods=["POST"]
)
def predict():

    try:

        # -------------------------------------------------
        # CHECK UPLOADED IMAGE
        # -------------------------------------------------

        if "image" not in request.files:

            return jsonify({
                "error": "No image uploaded"
            }), 400


        file = request.files["image"]

        image_bytes = file.read()


        # -------------------------------------------------
        # DECODE IMAGE
        # -------------------------------------------------

        image_array = np.frombuffer(
            image_bytes,
            np.uint8
        )
        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

        if image is None:
            image_bytes = None
            image_array = None
            gc.collect()
            return jsonify({
                "error": "Invalid image"
            }), 400

        # OPTIONAL: Downscale very large images to keep memory low (max dimension 1024px)
        MAX_DIM = 1024
        h_tmp, w_tmp = image.shape[:2]
        if max(h_tmp, w_tmp) > MAX_DIM:
            scale = MAX_DIM / max(h_tmp, w_tmp)
            new_w = int(w_tmp * scale)
            new_h = int(h_tmp * scale)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
            # update h, w for later steps
            h, w = image.shape[:2]

        # Release raw byte buffers early
        image_bytes = None
        image_array = None
        gc.collect()


        # -------------------------------------------------
        # IMAGE SIZE
        # -------------------------------------------------

        h, w = image.shape[:2]


        # -------------------------------------------------
        # YUNET FACE DETECTION
        # -------------------------------------------------

        yunet.setInputSize(
            (w, h)
        )

        _, faces = yunet.detect(
            image
        )


        if faces is None or len(faces) == 0:

            return jsonify({

                "error":
                "No face detected in the image"

            }), 400


        # -------------------------------------------------
        # SELECT LARGEST FACE
        # -------------------------------------------------

        largest_face = max(
            faces,
            key=lambda face:
            face[2] * face[3]
        )


        x, y, fw, fh = largest_face[:4]

        x = int(x)
        y = int(y)
        fw = int(fw)
        fh = int(fh)


        # -------------------------------------------------
        # ADD 20% FACE MARGIN
        # -------------------------------------------------

        margin_x = int(
            fw * FACE_MARGIN
        )

        margin_y = int(
            fh * FACE_MARGIN
        )


        x1 = max(
            0,
            x - margin_x
        )

        y1 = max(
            0,
            y - margin_y
        )

        x2 = min(
            w,
            x + fw + margin_x
        )

        y2 = min(
            h,
            y + fh + margin_y
        )


        # -------------------------------------------------
        # CROP FACE
        # -------------------------------------------------

        face_crop_bgr = image[
            y1:y2,
            x1:x2
        ]


        if face_crop_bgr.size == 0:

            return jsonify({

                "error":
                "Could not crop detected face"

            }), 400


        # -------------------------------------------------
        # RESIZE FACE
        # -------------------------------------------------

        face_crop_bgr = cv2.resize(
            face_crop_bgr,
            INPUT_SIZE
        )


        # -------------------------------------------------
        # BGR -> RGB
        # -------------------------------------------------

        face_crop_rgb = cv2.cvtColor(
            face_crop_bgr,
            cv2.COLOR_BGR2RGB
        )


        # -------------------------------------------------
        # PREPARE MODEL INPUT
        # -------------------------------------------------

        model_input = face_crop_rgb.astype(
            np.float32
        )

        model_input = np.expand_dims(
            model_input,
            axis=0
        )
        # Generate base64 face crop before releasing intermediate array
        face_base64 = image_to_base64(
            face_crop_bgr
        )

        # Release large intermediate arrays before TensorFlow inference
        del image
        del face_crop_bgr
        gc.collect()

        # -------------------------------------------------
        # PREDICTION
        # -------------------------------------------------

        # TensorFlow Lite inference
        _tflite_interpreter.set_tensor(_tflite_input_index, model_input)
        _tflite_interpreter.invoke()
        fake_probability = float(_tflite_interpreter.get_tensor(_tflite_output_index)[0][0])


        # -------------------------------------------------
        # PREDICTION LABEL
        # -------------------------------------------------

        if fake_probability >= FINAL_THRESHOLD:

            prediction = "FAKE"

        else:

            prediction = "REAL"


        # -------------------------------------------------
        # PREDICTION (no Grad-CAM)
        # -------------------------------------------------
        # gradcam generation removed to reduce memory usage


        # -------------------------------------------------
        # CONVERT IMAGES TO BASE64
        # -------------------------------------------------
        # (face_base64 was generated prior to releasing face_crop_bgr)


        # -------------------------------------------------
        # FINAL RESPONSE
        # -------------------------------------------------

        # Build response dictionary without Grad-CAM fields
        response = {
            "success": True,
            "prediction": prediction,
            "fake_probability": round(fake_probability * 100, 2),
            "threshold": FINAL_THRESHOLD,
            "face_detected": True,
            "face_box": {
                "x": x,
                "y": y,
                "width": fw,
                "height": fh
            },
            "face_image": face_base64
        }
        # -------------------------------------------------
        # MEMORY CLEANUP
        # -------------------------------------------------
        # Delete large temporary variables to free memory before returning
        try:
            del image, image_bytes, image_array, face_crop_bgr, face_crop_rgb, model_input, overlay, heatmap, explanation
        except NameError:
            pass

        gc.collect()
        return jsonify(response)


    except Exception as e:

        print(
            "ERROR:",
            str(e)
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


@app.route("/predict_gradcam", methods=["POST"])
def predict_gradcam():
    try:
        # -------------------------------------------------
        # CHECK UPLOADED IMAGE
        # -------------------------------------------------
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        image_bytes = file.read()

        # -------------------------------------------------
        # DECODE IMAGE
        # -------------------------------------------------
        image_array = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if image is None:
            return jsonify({"error": "Invalid image"}), 400

        # -------------------------------------------------
        # IMAGE SIZE & YUNET FACE DETECTION
        # -------------------------------------------------
        h, w = image.shape[:2]
        yunet.setInputSize((w, h))
        _, faces = yunet.detect(image)
        if faces is None or len(faces) == 0:
            return jsonify({"error": "No face detected in the image"}), 400

        # Select largest face
        largest_face = max(faces, key=lambda face: face[2] * face[3])
        x, y, fw, fh = map(int, largest_face[:4])

        # Add margin
        margin_x = int(fw * FACE_MARGIN)
        margin_y = int(fh * FACE_MARGIN)
        x1 = max(0, x - margin_x)
        y1 = max(0, y - margin_y)
        x2 = min(w, x + fw + margin_x)
        y2 = min(h, y + fh + margin_y)

        face_crop_bgr = image[y1:y2, x1:x2]
        if face_crop_bgr.size == 0:
            return jsonify({"error": "Could not crop detected face"}), 400
        face_crop_bgr = cv2.resize(face_crop_bgr, INPUT_SIZE)
        face_crop_rgb = cv2.cvtColor(face_crop_bgr, cv2.COLOR_BGR2RGB)

        model_input = np.expand_dims(face_crop_rgb.astype(np.float32), axis=0)

        # -------------------------------------------------
        # PREDICTION
        # -------------------------------------------------
        fake_probability = float(
            model.predict(model_input, verbose=0)[0][0]
        )
        prediction = "FAKE" if fake_probability >= FINAL_THRESHOLD else "REAL"

        # -------------------------------------------------
        # GRAD-CAM generation (full)
        # -------------------------------------------------
        heatmap, _ = generate_gradcam(model, model_input)
        explanation = get_explanation(
            heatmap,
            fake_probability,
            threshold=FINAL_THRESHOLD,
        )
        overlay = create_gradcam_overlay(face_crop_rgb, heatmap)

        # -------------------------------------------------
        # CONVERT IMAGES TO BASE64
        # -------------------------------------------------
        face_base64 = image_to_base64(face_crop_bgr)
        heatmap_base64 = image_to_base64(overlay)

        # -------------------------------------------------
        # FINAL RESPONSE
        # -------------------------------------------------
        response = {
            "success": True,
            "prediction": prediction,
            "fake_probability": round(fake_probability * 100, 2),
            "threshold": FINAL_THRESHOLD,
            "face_detected": True,
            "face_box": {"x": x, "y": y, "width": fw, "height": fh},
            "strongest_region": explanation["strongest_region"],
            "strong_activation_percentage": explanation["strong_activation_percentage"],
            "explanation": explanation["explanation"],
            "face_image": face_base64,
            "gradcam_image": heatmap_base64,
        }
        # Cleanup
        try:
            del image, image_bytes, image_array, face_crop_bgr, face_crop_rgb, model_input, overlay, heatmap, explanation
        except NameError:
            pass

        gc.collect()
        return jsonify(response)
    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/predict_video", methods=["POST"])
def predict_video():
    temp_video = None

    try:
        # -------------------------------------------------
        # CHECK VIDEO
        # -------------------------------------------------
        if "video" not in request.files:
            return jsonify({"error": "No video uploaded"}), 400

        file = request.files["video"]

        if not file or not file.filename:
            return jsonify({"error": "Invalid video file"}), 400

        # -------------------------------------------------
        # SAVE TEMPORARY VIDEO
        # -------------------------------------------------
        import tempfile

        suffix = os.path.splitext(file.filename)[1].lower() or ".mp4"
        fd, temp_video = tempfile.mkstemp(
            prefix="deepshield_",
            suffix=suffix,
            dir=os.path.join(BASE_DIR, "backend")
        )
        os.close(fd)
        file.save(temp_video)

        # -------------------------------------------------
        # OPEN VIDEO
        # -------------------------------------------------
        cap = cv2.VideoCapture(temp_video)

        if not cap.isOpened():
            return jsonify({"error": "Could not open video"}), 400

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0)

        if total_frames <= 0:
            cap.release()
            return jsonify({"error": "Video contains no readable frames"}), 400

        duration = total_frames / fps if fps > 0 else 0.0

        # Keep the current baseline at 12 frames.
        # We will increase/adapt this in the next accuracy-improvement step.
        max_samples = 12

        if total_frames <= max_samples:
            frame_indices = list(range(total_frames))
        else:
            frame_indices = np.linspace(
                0,
                total_frames - 1,
                max_samples,
                dtype=int
            ).tolist()

        probabilities = []
        analyzed_frames = 0
        face_detected_frames = 0
        frame_data = []

        # -------------------------------------------------
        # PROCESS SAMPLED FRAMES
        # -------------------------------------------------
        for frame_index in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(frame_index))
            success, frame = cap.read()

            if not success or frame is None:
                continue

            analyzed_frames += 1

            h, w = frame.shape[:2]

            # YuNet requires the current frame dimensions.
            yunet.setInputSize((w, h))
            _, faces = yunet.detect(frame)

            if faces is None or len(faces) == 0:
                continue

            # Select the largest detected face, matching the image pipeline.
            largest_face = max(
                faces,
                key=lambda face: float(face[2]) * float(face[3])
            )

            x, y, fw, fh = largest_face[:4]
            x, y, fw, fh = map(int, (x, y, fw, fh))

            if fw <= 0 or fh <= 0:
                continue

            face_detected_frames += 1

            # 20% margin, matching the image pipeline.
            margin_x = int(fw * FACE_MARGIN)
            margin_y = int(fh * FACE_MARGIN)

            x1 = max(0, x - margin_x)
            y1 = max(0, y - margin_y)
            x2 = min(w, x + fw + margin_x)
            y2 = min(h, y + fh + margin_y)

            face_crop_bgr = frame[y1:y2, x1:x2]

            if face_crop_bgr.size == 0:
                continue

            face_crop_bgr = cv2.resize(
                face_crop_bgr,
                INPUT_SIZE,
                interpolation=cv2.INTER_AREA
            )

            face_crop_rgb = cv2.cvtColor(
                face_crop_bgr,
                cv2.COLOR_BGR2RGB
            )

            # IMPORTANT: keep preprocessing identical to the working image
            # pipeline. Do not divide by 255 because the trained model expects
            # the same input representation used during final inference.
            model_input = np.expand_dims(
                face_crop_rgb.astype(np.float32),
                axis=0
            )

            probability = float(
                model.predict(
                    model_input,
                    verbose=0
                )[0][0]
            )

            # Protect against unexpected numerical output.
            probability = float(np.clip(probability, 0.0, 1.0))

            probabilities.append(probability)
            frame_data.append({
                "frame_index": int(frame_index),
                "probability": probability,
                "face_rgb": face_crop_rgb.copy()
            })

        cap.release()

        # -------------------------------------------------
        # NO FACE / NO VALID FRAME
        # -------------------------------------------------
        if not probabilities:
            return jsonify({
                "success": False,
                "error": "No human face detected in the analyzed video frames"
            }), 400

        prob_array = np.asarray(probabilities, dtype=np.float32)

        # -------------------------------------------------
        # CURRENT VIDEO BASELINE
        # -------------------------------------------------
        # Keep mean aggregation for a clean baseline comparison.
        # The next step will test improved temporal aggregation methods.
        if len(prob_array) >= 5:
            sorted_probs = np.sort(prob_array)
            trim = max(1, int(len(sorted_probs) * 0.20))
            video_probability = float(np.mean(sorted_probs[trim:-trim]))
        else:
            video_probability = float(np.mean(prob_array))

        prediction = (
            "FAKE"
            if video_probability >= FINAL_THRESHOLD
            else "REAL"
        )

        # -------------------------------------------------
        # TEMPORAL ANALYSIS METRICS
        # -------------------------------------------------
        mean_probability = float(np.mean(prob_array))
        median_probability = float(np.median(prob_array))
        max_probability = float(np.max(prob_array))
        std_probability = float(np.std(prob_array))

        suspicious_mask = prob_array >= FINAL_THRESHOLD
        suspicious_count = int(np.sum(suspicious_mask))
        suspicious_percentage = (
            (suspicious_count / len(prob_array)) * 100.0
            if len(prob_array) > 0
            else 0.0
        )

        # A descriptive 0-100 analytical score. It is NOT model confidence.
        temporal_suspicion_score = float(
            np.clip(
                (
                    0.50 * mean_probability
                    + 0.30 * median_probability
                    + 0.20 * max_probability
                ) * 100.0,
                0.0,
                100.0
            )
        )

        # -------------------------------------------------
        # REPRESENTATIVE FRAME
        # -------------------------------------------------
        representative_target = median_probability
        representative_index = int(
            np.argmin(
                np.abs(prob_array - representative_target)
            )
        )

        representative_face = frame_data[
            representative_index
        ]["face_rgb"]

        representative_probability = frame_data[
            representative_index
        ]["probability"]

        # Generate Grad-CAM for the SAME representative frame.
        representative_input = np.expand_dims(
            representative_face.astype(np.float32),
            axis=0
        )

        representative_heatmap, _ = generate_gradcam(
            model,
            representative_input
        )

        # -------------------------------------------------
        # EXPLANATION
        # -------------------------------------------------
        explanation = get_explanation(
            representative_heatmap,
            video_probability,
            threshold=FINAL_THRESHOLD
        )

        # create_gradcam_overlay expects RGB face input.
        overlay = create_gradcam_overlay(
            representative_face,
            representative_heatmap
        )

        face_base64 = image_to_base64(
            cv2.cvtColor(
                representative_face,
                cv2.COLOR_RGB2BGR
            )
        )

        heatmap_base64 = image_to_base64(
            overlay
        )

        # -------------------------------------------------
        # FRAME-LEVEL DATA FOR FRONTEND
        # -------------------------------------------------
        frame_probabilities = [
            round(float(p) * 100.0, 2)
            for p in probabilities
        ]

        frame_details = [
            {
                "frame": int(item["frame_index"]) + 1,
                "fake_probability": round(
                    float(item["probability"]) * 100.0,
                    2
                ),
                "suspicious": bool(
                    item["probability"] >= FINAL_THRESHOLD
                )
            }
            for item in frame_data
        ]

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------
        return jsonify({
            "success": True,
            "type": "video",
            "prediction": prediction,
            "fake_probability": round(
                video_probability * 100.0,
                2
            ),
            "threshold": FINAL_THRESHOLD,
            "total_frames": total_frames,
            "fps": round(fps, 2),
            "duration_seconds": round(duration, 2),
            "sampled_frames": len(frame_indices),
            "analyzed_frames": analyzed_frames,
            "face_detected_frames": face_detected_frames,
            "frame_probabilities": frame_probabilities,
            "frame_details": frame_details,
            "mean_frame_probability": round(
                mean_probability * 100.0,
                2
            ),
            "median_frame_probability": round(
                median_probability * 100.0,
                2
            ),
            "max_frame_probability": round(
                max_probability * 100.0,
                2
            ),
            "temporal_std": round(
                std_probability * 100.0,
                2
            ),
            "suspicious_frame_count": suspicious_count,
            "suspicious_frame_percentage": round(
                suspicious_percentage,
                2
            ),
            "temporal_suspicion_score": round(
                temporal_suspicion_score,
                2
            ),
            "representative_frame_probability": round(
                representative_probability * 100.0,
                2
            ),
            "strongest_region": explanation[
                "strongest_region"
            ],
            "strong_activation_percentage": explanation[
                "strong_activation_percentage"
            ],
            "explanation": explanation[
                "explanation"
            ],
            "face_image": face_base64,
            "gradcam_image": heatmap_base64
        })

    except Exception as e:
        print("VIDEO ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        if temp_video and os.path.exists(temp_video):
            try:
                os.remove(temp_video)
            except Exception:
                pass


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    print("")
    print(
        "======================================"
    )

    print(
        "       DeepShield Backend"
    )

    print(
        "======================================"
    )

    print(
        "Server: http://127.0.0.1:5000"
    )

    print("")

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )
