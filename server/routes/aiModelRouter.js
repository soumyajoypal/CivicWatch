const express = require("express");
const aiModelRouter = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getModelResponse } = require("../controllers/modelController");

aiModelRouter.post("/analyze", verifyToken, getModelResponse);

module.exports = aiModelRouter;
