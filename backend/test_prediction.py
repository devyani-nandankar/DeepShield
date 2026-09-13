import requests

image_path = input("Enter image path: ")

url = "http://127.0.0.1:5000/predict"

with open(image_path, "rb") as image_file:

    response = requests.post(
        url,
        files={
            "image": image_file
        }
    )

print("\nResponse:")
print(response.json())