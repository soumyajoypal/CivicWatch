const { StatusCodes } = require("http-status-codes");

//to check if the user has the right role to update a report

const canUpdateReport = (req, res, next) => {
  const { role } = req.user;

  const allowedFields = {
    NormalUser: ["issueDescription", "imageURL", "videoURL", "location"],
    AdminUser: ["status", "adminNotes", "aiAnalysis", "reviewedAt"],
  };

  const keys = Object.keys(req.body);

  if (keys.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Request body cannot be empty.",
    });
  }

  const isValid = keys.every((key) => allowedFields[role]?.includes(key));

  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `You can only update: ${allowedFields[role]?.join(", ")}`,
    });
  }

  next();
};
module.exports = canUpdateReport;
