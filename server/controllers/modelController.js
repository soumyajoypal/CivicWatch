const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const { BadRequest } = require("../errors");
const { Error } = require("mongoose");
const evaluateCivicIssues = require("../utils/violationEvaluator");

const getModelResponse = async (req, res) => {
  try {
    const {
      url,
      location: {
        coords: { latitude, longitude },
      },
    } = req.body;
    const response = await axios.post(
      "http://127.0.0.1:8000/predict_from_url/",
      { url }
    );
    if (!response) throw new Error("No response from AI model service!");

    const annotatedImageUrl = response.data.annotated_image_url;

    const evaluation = await evaluateCivicIssues(response.data.detections, {
      lat: latitude,
      lon: longitude,
    });

    const verdict = {
      annotatedImageUrl,
      location: { latitude, longitude },
      violations: evaluation.issueType,
      aiAnalysis: evaluation.aiAnalysis,
    };

    return res.status(200).json({ status: "success", verdict });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while processing your request." });
  }
};

module.exports = {
  getModelResponse,
};
