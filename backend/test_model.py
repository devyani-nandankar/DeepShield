import tensorflow as tf
import os

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "deepshield_final.keras"
)

print("=" * 60)
print("DEEPSHIELD MODEL TEST")
print("=" * 60)

print("TensorFlow version:", tf.__version__)

print("Model path:")
print(MODEL_PATH)

print("\nModel exists:", os.path.exists(MODEL_PATH))

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        "deepshield_final.keras was not found!"
    )

print("\nLoading model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("\n✅ MODEL LOADED SUCCESSFULLY")

print("Input shape :", model.input_shape)
print("Output shape:", model.output_shape)

print("=" * 60)