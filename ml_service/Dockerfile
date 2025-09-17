FROM python:3.10-slim

# System deps for OpenCV + Tesseract
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    libleptonica-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1 \
    git \
    && rm -rf /var/lib/apt/lists/*


# Workdir
WORKDIR /app

# Copy dependency list first (better cache)
COPY requirements.txt ./

# Install PyTorch CPU wheels explicitly (faster & smaller)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# For Ultralytics: avoid first-time prompts
ENV YOLO_VERBOSE=False

# Run the FastAPI app (package path = ml_service.app:app)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
