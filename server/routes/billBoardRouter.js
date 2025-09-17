const express = require("express");
const billBoardRouter = express.Router();
const {
  getAllBillboards,
  billBoardFeed,
  getBillBoardDetails,
} = require("../controllers/billBoardController");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

billBoardRouter.get("/", verifyToken, verifyAdmin, getAllBillboards);
billBoardRouter.get("/feed", verifyToken, billBoardFeed);
billBoardRouter.get("/details/:billboardId", verifyToken, getBillBoardDetails);
module.exports = billBoardRouter;
