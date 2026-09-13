import tensorflow as tf
import numpy as np


def find_backbone(model):
    """
    Find the EfficientNet backbone inside the DeepShield model.
    """

    for layer in model.layers:

        if isinstance(layer, tf.keras.Model):

            if "efficientnet" in layer.name.lower():

                return layer

    raise ValueError("EfficientNet backbone not found")


def find_target_layer(backbone):
    """
    Find the last 4D convolutional feature layer.
    """

    for layer in reversed(backbone.layers):

        try:
            shape = layer.output.shape

            if len(shape) == 4:
                return layer

        except Exception:
            continue

    raise ValueError("Suitable Grad-CAM layer not found")


def generate_gradcam(model, image):

    """
    Generate Grad-CAM heatmap.

    image:
        numpy array with shape (1, 260, 260, 3)

    Returns:
        heatmap
        fake_probability
    """

    # ----------------------------------------------------
    # Find EfficientNet backbone
    # ----------------------------------------------------

    backbone = find_backbone(model)

    # ----------------------------------------------------
    # Find target convolutional layer
    # ----------------------------------------------------

    target_layer = find_target_layer(backbone)

    print("Grad-CAM backbone:", backbone.name)
    print("Grad-CAM target layer:", target_layer.name)

    # ----------------------------------------------------
    # Model that returns feature maps
    # and backbone output
    # ----------------------------------------------------

    feature_model = tf.keras.Model(
        inputs=backbone.input,
        outputs=[
            target_layer.output,
            backbone.output
        ]
    )

    # ----------------------------------------------------
    # Find layers after EfficientNet
    # ----------------------------------------------------

    backbone_index = model.layers.index(backbone)

    head_layers = model.layers[
        backbone_index + 1:
    ]

    # ----------------------------------------------------
    # Gradient calculation
    # ----------------------------------------------------

    with tf.GradientTape() as tape:

        feature_maps, backbone_output = feature_model(
            image,
            training=False
        )

        x = backbone_output

        # Pass through classification head
        for layer in head_layers:

            x = layer(
                x,
                training=False
            )

        fake_probability = x[:, 0]

    # ----------------------------------------------------
    # Gradient of fake probability
    # with respect to feature maps
    # ----------------------------------------------------

    gradients = tape.gradient(
        fake_probability,
        feature_maps
    )

    if gradients is None:

        raise ValueError(
            "Could not calculate Grad-CAM gradients"
        )

    # ----------------------------------------------------
    # Global average pooling of gradients
    # ----------------------------------------------------

    weights = tf.reduce_mean(
        gradients,
        axis=(1, 2)
    )

    # ----------------------------------------------------
    # Weighted combination of feature maps
    # ----------------------------------------------------

    cam = tf.reduce_sum(
        feature_maps * weights[:, tf.newaxis, tf.newaxis, :],
        axis=-1
    )

    # ----------------------------------------------------
    # ReLU
    # ----------------------------------------------------

    cam = tf.maximum(cam, 0)

    # Take first image
    heatmap = cam[0].numpy()

    # ----------------------------------------------------
    # Normalize
    # ----------------------------------------------------

    heatmap_min = heatmap.min()
    heatmap_max = heatmap.max()

    if heatmap_max > heatmap_min:

        heatmap = (
            heatmap - heatmap_min
        ) / (
            heatmap_max - heatmap_min
        )

    else:

        heatmap = np.zeros_like(heatmap)

    return (
        heatmap,
        float(fake_probability[0].numpy())
    )


def get_explanation(
    heatmap,
    fake_probability,
    threshold=0.07
):

    """
    Generate a simple user-readable explanation.
    """

    height, width = heatmap.shape

    # ----------------------------------------------------
    # Strongest activation
    # ----------------------------------------------------

    max_index = np.unravel_index(
        np.argmax(heatmap),
        heatmap.shape
    )

    row, col = max_index

    # ----------------------------------------------------
    # Horizontal region
    # ----------------------------------------------------

    if col < width / 3:

        horizontal = "left"

    elif col < 2 * width / 3:

        horizontal = "center"

    else:

        horizontal = "right"

    # ----------------------------------------------------
    # Vertical region
    # ----------------------------------------------------

    if row < height / 3:

        vertical = "upper"

    elif row < 2 * height / 3:

        vertical = "central"

    else:

        vertical = "lower"

    region = f"{vertical} facial region, {horizontal} area"

    # ----------------------------------------------------
    # Strong activation percentage
    # ----------------------------------------------------

    strong_pixels = np.sum(
        heatmap >= 0.60
    )

    total_pixels = heatmap.size

    strong_percentage = (
        strong_pixels / total_pixels
    ) * 100

    # ----------------------------------------------------
    # Prediction
    # ----------------------------------------------------

    if fake_probability >= threshold:

        prediction = "FAKE"

        explanation = (
            f"The model classified the image as FAKE "
            f"because its fake probability is "
            f"{fake_probability * 100:.2f}%, "
            f"which is above the {threshold * 100:.0f}% "
            f"decision threshold. "
            f"The strongest Grad-CAM activation is in the "
            f"{region}. "
            f"Approximately {strong_percentage:.1f}% of "
            f"the heatmap contains strong activation."
        )

    else:

        prediction = "REAL"

        explanation = (
            f"The model classified the image as REAL "
            f"because its fake probability is "
            f"{fake_probability * 100:.2f}%, "
            f"which is below the {threshold * 100:.0f}% "
            f"decision threshold. "
            f"The strongest Grad-CAM activation is in the "
            f"{region}."
        )

    # ----------------------------------------------------
    # Important disclaimer
    # ----------------------------------------------------

    explanation += (
        " The highlighted region represents areas that "
        "contributed strongly to the model's decision; "
        "it is not pixel-level proof of manipulation."
    )

    return {
        "prediction": prediction,
        "fake_probability": round(
            fake_probability * 100,
            2
        ),
        "threshold": threshold,
        "strongest_region": region,
        "strong_activation_percentage": round(
            strong_percentage,
            2
        ),
        "explanation": explanation
    }