# backend/test_video.py
"""Utility script to send a known‑real video to the DeepShield /predict_video endpoint
and print a detailed frame‑level probability analysis.

The script uses Flask's test client, so it does **not** start a separate server process
and does **not** modify any model, threshold, or aggregation logic.
"""

import json
import statistics
from pathlib import Path

# Import the Flask app defined in app.py (ensure this script is run from the backend directory)
from app import app

# Path to the known‑real sample video – place the video file in the same backend folder.
VIDEO_PATH = Path(__file__).parent / "sample_real.mp4"
if not VIDEO_PATH.is_file():
    raise FileNotFoundError(f"Sample video not found at {VIDEO_PATH}")

def main():
    # Create a Flask test client
    client = app.test_client()

    # Send POST request with multipart/form-data (field name "video")
    with VIDEO_PATH.open('rb') as f:
        data = {"video": (f, VIDEO_PATH.name)}
        response = client.post("/predict_video", content_type="multipart/form-data", data=data)

    if response.status_code != 200:
        raise RuntimeError(f"Server returned status {response.status_code}: {response.data}")

    result = response.get_json()
    if not result.get("success"):
        raise RuntimeError(f"Prediction failed: {result}")

    # Extract frame‑level details
    frame_details = result.get("frame_details", [])
    if not frame_details:
        print("No frame details returned.")
        return

    # Print per‑frame probability (sorted by original frame order)
    print("Frame-level probabilities:")
    for item in sorted(frame_details, key=lambda x: x["frame"]):
        print(f"Frame {item['frame']} -> {item['fake_probability']:.2f}%")

    # Compute statistics on fake probabilities
    probs = [item["fake_probability"] for item in frame_details]
    mean_prob = statistics.mean(probs)
    median_prob = statistics.median(probs)
    max_prob = max(probs)
    min_prob = min(probs)
    std_dev = statistics.stdev(probs) if len(probs) > 1 else 0.0
    suspicious_frames = [item for item in frame_details if item["suspicious"]]
    suspicious_count = len(suspicious_frames)
    suspicious_pct = (suspicious_count / len(frame_details)) * 100.0

    print("\nStatistical summary:")
    print(f"Mean probability: {mean_prob:.2f}%")
    print(f"Median probability: {median_prob:.2f}%")
    print(f"Maximum probability: {max_prob:.2f}%")
    print(f"Minimum probability: {min_prob:.2f}%")
    print(f"Standard deviation: {std_dev:.2f}")
    print(f"Suspicious frame count: {suspicious_count}")
    print(f"Suspicious frame percentage: {suspicious_pct:.2f}%")

    # Detailed info for each suspicious frame
    if suspicious_frames:
        print("\nSuspicious frames (above threshold):")
        for item in sorted(suspicious_frames, key=lambda x: x["frame"]):
            above = "YES" if item["suspicious"] else "NO"
            print(f"Frame {item['frame']}: {item['fake_probability']:.2f}% - Above threshold: {above}")

    # Top 5 frames by probability (regardless of threshold)
    top5 = sorted(frame_details, key=lambda x: x["fake_probability"], reverse=True)[:5]
    print("\nTop 5 suspicious frames (highest fake probability):")
    for item in top5:
        print(f"Frame {item['frame']}: {item['fake_probability']:.2f}%")

if __name__ == "__main__":
    main()