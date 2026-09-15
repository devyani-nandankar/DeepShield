import requests

video_path = input("Enter video path: ")

url = "http://127.0.0.1:5000/predict_video"

with open(video_path, "rb") as video_file:
    response = requests.post(
        url,
        files={
            "video": video_file
        }
    )

print("\nStatus Code:", response.status_code)

print("\nResponse:")
print(response.json())