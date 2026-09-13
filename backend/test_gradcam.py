import tensorflow as tf
import cv2
import numpy as np

from gradcam import generate_gradcam, get_explanation


MODEL_PATH = "models/deepshield_final.keras"

IMAGE_PATH = input("Enter image path: ")

print("\nLoading model...")

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

print("Model loaded.")

# Read image
image = cv2.imread(IMAGE_PATH)

if image is None:
    print("ERROR: Could not read image.")
    exit()

# Resize to model input
image = cv2.resize(
    image,
    (260, 260)
)

# BGR -> RGB
image = cv2.cvtColor(
    image,
    cv2.COLOR_BGR2RGB
)

# Float32
image = image.astype(
    np.float32
)

# Batch dimension
image = np.expand_dims(
    image,
    axis=0
)

print("Generating Grad-CAM...")

heatmap, fake_probability = generate_gradcam(
    model,
    image
)

print("\nGrad-CAM generated successfully.")

print("Heatmap shape:", heatmap.shape)

print(
    "Fake probability:",
    round(fake_probability * 100, 2),
    "%"
)

explanation = get_explanation(
    heatmap,
    fake_probability,
    threshold=0.07
)

print("\n========== WHY FAKE? ==========")

for key, value in explanation.items():

    print(
        f"{key}: {value}"
    )