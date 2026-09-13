import os
import cv2
import json
import numpy as np
import tensorflow as tf

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = r"C:\Users\ADMIN\Desktop\DeepShield1\models\deepshield_final.keras"

INPUT_SIZE = (260, 260)

# Current validated model threshold
THRESHOLD = 0.07

# Number of frames sampled from each video
MAX_SAMPLED_FRAMES = 12


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 60)
print("Loading DeepShield model...")
print("=" * 60)

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")
print("Input shape:", model.input_shape)


# ============================================================
# VIDEO FRAME SAMPLING
# ============================================================

def sample_video_frames(video_path, max_frames=12):

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("Could not open:", video_path)
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames <= 0:
        cap.release()
        return []

    frame_indices = np.linspace(
        0,
        total_frames - 1,
        min(max_frames, total_frames),
        dtype=int
    )

    frames = []

    for index in frame_indices:

        cap.set(cv2.CAP_PROP_POS_FRAMES, int(index))

        success, frame = cap.read()

        if success:
            frames.append(frame)

    cap.release()

    return frames


# ============================================================
# FACE DETECTION
# ============================================================

def detect_face(frame):

    h, w = frame.shape[:2]

    # Create YuNet detector
    detector = cv2.FaceDetectorYN.create(
        r"C:\Users\ADMIN\Desktop\DeepShield1\models\face_detection_yunet_2023mar.onnx",
        "",
        (w, h),
        0.55,
        0.3,
        5000
    )

    detector.setInputSize((w, h))

    _, faces = detector.detect(frame)

    if faces is None or len(faces) == 0:
        return None

    # Select largest face
    best_face = max(
        faces,
        key=lambda f: f[2] * f[3]
    )

    x, y, fw, fh = best_face[:4]

    x = int(x)
    y = int(y)
    fw = int(fw)
    fh = int(fh)

    # 20% margin
    margin_x = int(fw * 0.20)
    margin_y = int(fh * 0.20)

    x1 = max(0, x - margin_x)
    y1 = max(0, y - margin_y)

    x2 = min(w, x + fw + margin_x)
    y2 = min(h, y + fh + margin_y)

    crop = frame[y1:y2, x1:x2]

    if crop.size == 0:
        return None

    return crop


# ============================================================
# PREDICT ONE VIDEO
# ============================================================

def predict_video(video_path):

    frames = sample_video_frames(
        video_path,
        MAX_SAMPLED_FRAMES
    )

    if len(frames) == 0:
        return None

    face_crops = []

    for frame in frames:

        face = detect_face(frame)

        if face is None:
            continue

        face = cv2.resize(
            face,
            INPUT_SIZE
        )

        face = cv2.cvtColor(
            face,
            cv2.COLOR_BGR2RGB
        )

        face = face.astype(np.float32) / 255.0

        face_crops.append(face)

    if len(face_crops) == 0:
        return None

    batch = np.array(face_crops)

    predictions = model.predict(
        batch,
        verbose=0
    ).reshape(-1)

    # Current system: average frame probabilities
    video_probability = float(
        np.mean(predictions)
    )

    prediction = (
        1
        if video_probability >= THRESHOLD
        else 0
    )

    return {
        "fake_probability": video_probability,
        "prediction": prediction,
        "frame_probabilities": predictions.tolist(),
        "frames_analyzed": len(predictions)
    }


# ============================================================
# DATASET EVALUATION
# ============================================================

def evaluate_dataset(dataset_root):

    y_true = []
    y_probability = []
    y_prediction = []

    class_directories = {
        "REAL": 0,
        "FAKE": 1
    }

    for class_name, label in class_directories.items():

        class_path = os.path.join(
            dataset_root,
            class_name
        )

        if not os.path.exists(class_path):
            print("Missing folder:", class_path)
            continue

        for filename in os.listdir(class_path):

            if not filename.lower().endswith(
                (".mp4", ".avi", ".mov", ".mkv")
            ):
                continue

            video_path = os.path.join(
                class_path,
                filename
            )

            print(
                f"Analyzing: {class_name}/{filename}"
            )

            result = predict_video(
                video_path
            )

            if result is None:
                print("Skipped.")
                continue

            y_true.append(label)

            y_probability.append(
                result["fake_probability"]
            )

            y_prediction.append(
                result["prediction"]
            )

    if len(y_true) == 0:

        print()
        print("No valid videos were evaluated.")

        return

    # ========================================================
    # METRICS
    # ========================================================

    accuracy = accuracy_score(
        y_true,
        y_prediction
    )

    precision = precision_score(
        y_true,
        y_prediction,
        zero_division=0
    )

    recall = recall_score(
        y_true,
        y_prediction,
        zero_division=0
    )

    f1 = f1_score(
        y_true,
        y_prediction,
        zero_division=0
    )

    try:
        auc = roc_auc_score(
            y_true,
            y_probability
        )
    except ValueError:
        auc = None

    cm = confusion_matrix(
        y_true,
        y_prediction
    )

    # ========================================================
    # RESULTS
    # ========================================================

    print()
    print("=" * 60)
    print("DEEPSHIELD VIDEO-LEVEL EVALUATION")
    print("=" * 60)

    print(
        f"Videos evaluated : {len(y_true)}"
    )

    print(
        f"Accuracy         : {accuracy:.4f}"
    )

    print(
        f"Precision        : {precision:.4f}"
    )

    print(
        f"Recall           : {recall:.4f}"
    )

    print(
        f"F1 Score         : {f1:.4f}"
    )

    if auc is not None:

        print(
            f"ROC-AUC          : {auc:.4f}"
        )

    print()
    print("Confusion Matrix:")
    print(cm)

    print()
    print("Threshold:", THRESHOLD)

    print()
    print("=" * 60)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print()
    print("DeepShield Video Evaluation")
    print()

    dataset_root = input(
        "Enter dataset folder containing REAL and FAKE folders: "
    ).strip()

    evaluate_dataset(
        dataset_root
    )