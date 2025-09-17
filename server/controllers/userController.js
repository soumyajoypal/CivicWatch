const { StatusCodes } = require("http-status-codes");
const { NormalUser } = require("../models/rolesSchema");
const uploadImage = (req, res) => {
  console.log("File upload request received", req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = req.file.path;
  return res.json({
    message: "Upload successful!",
    url: imageUrl,
    details: req.file,
  });
};

const getAllUsers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (status) filters.status = status;

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      NormalUser.find(filters)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password")
        .lean(),
      NormalUser.countDocuments(filters),
    ]);

    return res.json({
      data: users,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching users",
    });
  }
};

const getUserInfo = async (req, res) => {
  const { userId } = req.params;
  const user = await NormalUser.findById(userId).select("-password").lean();
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User not found" });
  }

  return res.json({
    data: user,
    message: "User fetched successfully",
  });
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const user = await NormalUser.findByIdAndDelete(userId);
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User not found" });
  }

  return res.json({
    message: "User deleted successfully",
  });
};

const getLeaderBoard = async (req, res) => {
  const users = await NormalUser.find({})
    .sort({ xp: -1 })
    .limit(6)
    .select("username xp leaderBoardPosition avatar");
  return res.status(200).json({ data: users, msg: "LeaderBoard received!" });
};

const getBadgeDetails = async (req, res) => {
  const { id } = req.user;
  const user = await NormalUser.findById(id).select("badges").lean();
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User not found" });
  }

  return res.json({
    data: user.badges,
    message: "Badges fetched successfully",
  });
};

module.exports = {
  uploadImage,
  getAllUsers,
  getUserInfo,
  deleteUser,
  getLeaderBoard,
  getBadgeDetails,
};
