import sys
import os
import tempfile
import requests
import cv2
import numpy as np
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ultralytics import YOLO
import uvicorn
from utils.cloudinary_config import upload_to_cloudinary

app = FastAPI()

# Load YOLO model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "best.pt")
model = YOLO(MODEL_PATH)

# Your classes
CLASS_NAMES = {
    0: "broken_streetlight",
    1: "fallen_tree",
    2: "illegal_dumping",
    3: "overflowing_bin",
    4: "potholes",
    5: "waterlogging"
}

# Assign unique colors for each class (BGR format)
CLASS_COLORS = {
    0: (0, 255, 0),      # green for broken streetlight
    1: (0, 0, 255),      # red for fallen tree
    2: (255, 255, 0),    # cyan for illegal dumping
    3: (255, 0, 255),    # magenta for overflowing bin
    4: (0, 165, 255),    # orange for potholes
    5: (0, 165, 255)     # orange for waterlogging
}

class ImageURLRequest(BaseModel):
    url: str

def draw_bounding_boxes(image, detections):
    """Draw YOLO bounding boxes and labels with class-specific colors."""
    annotated = image.copy()

    for det in detections:
        x1, y1, x2, y2 = map(int, det["xyxy"])
        cls = det["class"]
        conf = det["confidence"]

        color = CLASS_COLORS.get(cls, (0, 255, 255))  # fallback: yellow
        label = f"{CLASS_NAMES.get(cls, cls)} {conf:.2f}"

        # Draw box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 3)

        # Draw label background
        (tw, th), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(annotated, (x1, y1 - th - 10), (x1 + tw, y1), color, -1)

        # Put label text
        cv2.putText(annotated, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX,
                    0.6, (255, 255, 255), 2)

    return annotated


@app.post("/predict_from_url/")
async def predict_from_url(req: ImageURLRequest):
    try:
        # Download image
        resp = requests.get(req.url, stream=True)
        if resp.status_code != 200:
            return JSONResponse({"error": "Unable to fetch image from URL"}, status_code=400)

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        temp_file.write(resp.content)
        temp_file.close()

        image = cv2.imread(temp_file.name)
        if image is None:
            os.unlink(temp_file.name)
            raise ValueError("Downloaded image is invalid")

        # Run YOLO inference
        results = model(image)[0]  # first batch element
        detections = []
        for box in results.boxes:
            detections.append({
                "class": int(box.cls.item()),
                "class_name": CLASS_NAMES.get(int(box.cls.item()), str(int(box.cls.item()))),
                "confidence": float(box.conf.item()),
                "xyxy": box.xyxy[0].tolist()
            })

        # Draw bounding boxes
        annotated_image = draw_bounding_boxes(image, detections)

        # Save and upload
        output_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name
        cv2.imwrite(output_file, annotated_image)
        cloudinary_url = upload_to_cloudinary(output_file)

        # Cleanup
        os.unlink(temp_file.name)
        os.unlink(output_file)

        return JSONResponse({
            "detections": detections,
            "annotated_image_url": cloudinary_url
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
