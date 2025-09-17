import cv2
import pytesseract
from pytesseract import Output
import numpy as np


def preprocess_for_ocr(img):
    """Enhanced preprocessing for better OCR results"""
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()
    
    # Apply CLAHE for contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    gray = clahe.apply(gray)
    
    # Denoise
    gray = cv2.fastNlMeansDenoising(gray)
    
    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(gray, 255,
                                   cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY, 11, 2)
    
    # Morphological operations to clean up the image
    kernel = np.ones((2,2), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    
    return gray, thresh

def crop_detection_box(image, xyxy, min_size=(50, 50), scale_factor=2):
    """Crop and resize detection box for better OCR"""
    x1, y1, x2, y2 = map(int, xyxy)
    
    # Add padding to the crop
    padding = 5
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(image.shape[1], x2 + padding)
    y2 = min(image.shape[0], y2 + padding)
    
    cropped = image[y1:y2, x1:x2]
    
    if cropped.size == 0:
        return cropped
    
    h, w = cropped.shape[:2]
    if h < min_size[0] or w < min_size[1]:
        cropped = cv2.resize(cropped, None, fx=scale_factor, fy=scale_factor, 
                           interpolation=cv2.INTER_CUBIC)
    
    return cropped