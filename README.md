# BillGuard

BillGuard is a full-stack application for monitoring and reporting hoarding and billboard violations. It leverages AI-powered image analysis, geolocation, and a robust MERN backend to automate violation detection and management. The platform also includes gamification elements with user XP, badges, and leaderboards.

---

## **Tech Stack**

### **Client**

- **React Native Expo** – Mobile application development
- **NativeWind** – Tailwind CSS for React Native styling
- **Redux Toolkit** – State management
- **Expo SecureStore** – Secure token storage
- **React Navigation** – Navigation within the app

### **Server**

- **MERN Stack**
  - **MongoDB** – Database for storing reports, users, and leaderboard data
  - **Express.js** – Backend API server
  - **Node.js** – Runtime environment
  - **Mongoose** – MongoDB ORM
- **REST APIs** – For user authentication, report handling, and leaderboard management
- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access (NormalUser / AdminUser)

### **ML Service**

- **Python FastAPI** – Machine learning inference API
- **Docker** – Containerized ML service
- **OpenCV / PyTorch / OCR Libraries** – Image analysis for hoarding detection

### **Cloud & Storage**

- **Cloudinary** – Image storage and annotated images
- **Expo SecureStore / AsyncStorage** – Local storage of tokens and session data

---

## **Project Structure**

```
BillGuard/
├─ client/                  # React Native Expo mobile app
│  ├─ assets/               # Images, icons, fonts
│  ├─ components/           # Reusable UI components
│  ├─ lib/                  # Redux slices, utils
│  ├─ (tabs)/               # App screens (Leaderboard, Reports, etc.)
│  └─ app                   # Main entry point
│
├─ server/                  # MERN backend
│  ├─ models/               # MongoDB models
│  ├─ routes/               # API routes
│  ├─ controllers/          # API logic
│  ├─ utils/                # Helper functions
│  └─ server.js             # Express entry point
│
├─ ml_service/              # Dockerized ML inference service
│  ├─ app.py               # FastAPI ML endpoints
│  ├─ requirements.txt      # Python dependencies
│  └─ Dockerfile            # Container setup
```

---

## **Setup & Run Instructions**

### **1. Server (MERN Backend)**

```bash
cd server
npm install
npm run dev   # Starts the server at http://localhost:5000
```

### **2. ML Service**

```bash
cd ml_service
docker build -t ml_service .
docker run -p 8000:8000 ml_service
```

The ML service will be available at `http://localhost:8000/predict_from_url/`.

### **3. Client (React Native Expo)**

```bash
cd client
npm install
expo start   # Starts the Expo development server
```

- Open the Expo Go app on your mobile device or simulator
- Scan the QR code to launch the app

### **Environment Variables**

Create a `.env` file in `server` folders as follows:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_API_KEY=your_cloudinary_API_KEY
ADMIN_SECRET_CODE=admin1923
```

Create a `.env` file in `ml_service` folders as follows:

```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_API_KEY=your_cloudinary_API_KEY
```

### **4. Notes**

- Ensure MongoDB is running locally or accessible via the provided connection string
- ML service should be running before submitting any reports for AI evaluation
- Cloudinary credentials must be valid for image uploads and retrieval

---

## **Features**

- Real-time AI-based hoarding analysis
- Geolocation-based restricted zone detection
- OCR-based content violation detection
- Admin verification with XP and leaderboard system
- Gamification with badges and user levels
- Leaderboard showing top contributors

---

## **Contact**

For questions or contributions, please contact `soumyajoypal@example.com`.
