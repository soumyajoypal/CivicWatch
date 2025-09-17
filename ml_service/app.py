


import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"/usr/bin/tesseract"

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ultralytics import YOLO
import uvicorn
import cv2
import requests
import numpy as np
import re
from utils.cloudinary_config import upload_to_cloudinary
from utils.ocr_utils import crop_detection_box, preprocess_for_ocr
import tempfile

app = FastAPI()

# Load YOLO model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "best.pt")
model = YOLO(MODEL_PATH)

class ImageURLRequest(BaseModel):
    url: str

def draw_bounding_boxes(image, detections):
    """Draw YOLO bounding boxes and labels."""
    class_names = {0: "Billboard", 1: "Stand"}
    annotated = image.copy()

    for det in detections:
        x1, y1, x2, y2 = map(int, det["xyxy"])
        cls = det["class"]
        conf = det["confidence"]

        color = (0, 255, 0) if cls == 0 else (0, 0, 255)
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 3)

        label = f"{class_names.get(cls, cls)} {conf:.2f}"
        (tw, th), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(annotated, (x1, y1 - th - 10), (x1 + tw, y1), color, -1)
        cv2.putText(annotated, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    return annotated

def run_ocr_on_detections(image, detections):
    """
    Run OCR only on detected boxes (both Billboard and Stand), filter text properly.
    """
    ocr_results = []
    annotated = image.copy()

    for det in detections:
        cropped = crop_detection_box(image, det["xyxy"])
        if cropped.size == 0:
            continue
            
        gray, thresh = preprocess_for_ocr(cropped)
        data_thresh = pytesseract.image_to_data(thresh, output_type=pytesseract.Output.DICT, config="--psm 6")
        data_gray = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT, config="--psm 6")

        valid_thresh = sum(1 for t, c in zip(data_thresh['text'], data_thresh['conf']) if t.strip() and float(c) > 20)
        valid_gray = sum(1 for t, c in zip(data_gray['text'], data_gray['conf']) if t.strip() and float(c) > 20)

        data = data_thresh if valid_thresh >= valid_gray else data_gray

        x1, y1, x2, y2 = map(int, det["xyxy"])
        for i in range(len(data['text'])):
            text = data['text'][i].strip()
            if not text:
                continue
            try:
                conf = float(data['conf'][i])
            except:
                conf = 0
            if conf > 20 and len(text) >= 2 and any(c.isalnum() for c in text) and not re.match(r'^[^a-zA-Z0-9]+$', text):
                ox, oy, ow, oh = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
                abs_x, abs_y = x1 + ox, y1 + oy
                ocr_results.append({
                    "text": text,
                    "confidence": conf,
                    "bbox": [abs_x, abs_y, abs_x + ow, abs_y + oh],
                    "parent_class": "Billboard" if det["class"] == 0 else "Stand"
                })
                cv2.rectangle(annotated, (abs_x, abs_y), (abs_x + ow, abs_y + oh), (255, 0, 0), 2)
                cv2.putText(annotated, text, (abs_x, abs_y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    return ocr_results, annotated

@app.post("/predict_from_url/")
async def predict_from_url(req: ImageURLRequest):
    try:
        # Download image from URL
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

        # YOLO prediction
        results = model.predict(temp_file.name)
        detections = []
        for result in results:
            for box in result.boxes:
                xyxy = box.xyxy[0].tolist()
                conf = float(box.conf[0].item())
                cls = int(box.cls[0].item())
                detections.append({"class": cls, "confidence": conf, "xyxy": xyxy})

        # Draw YOLO boxes
        annotated_image = draw_bounding_boxes(image, detections)

        # Run OCR
        ocr_results, final_annotated_image = run_ocr_on_detections(annotated_image, detections)

        # Save and upload
        output_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name
        cv2.imwrite(output_file, final_annotated_image)
        cloudinary_url = upload_to_cloudinary(output_file)

        # Cleanup
        os.unlink(temp_file.name)
        os.unlink(output_file)

        return JSONResponse({
            "detections": detections,
            "ocr": ocr_results,
            "annotated_image_url": cloudinary_url
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)