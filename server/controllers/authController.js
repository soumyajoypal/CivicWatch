const { StatusCodes } = require("http-status-codes");
const User = require("../models/userSchema");
const { NormalUser, AdminUser } = require("../models/rolesSchema");
const { BadRequest } = require("../errors/index");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const registerUser = async (req, res) => {
  const { username, email, role = "NormalUser" } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new BadRequest("User with this username or email already exists.");
  }

  let newUser;
  if (role.toLowerCase() === "normaluser") {
    console.log("Creating NormalUser");
    console.log(NormalUser);
    newUser = await NormalUser.create(req.body);
  } else if (role.toLowerCase() === "adminuser") {
    if (req.body.adminCode !== process.env.ADMIN_SECRET_CODE) {
      throw new BadRequest("Invalid admin code!.");
    }
    newUser = await AdminUser.create(req.body);
  } else {
    throw new BadRequest("Invalid role provided.");
  }

  return res.status(StatusCodes.CREATED).json({
    data: newUser,
    message: "User registered successfully.",
  });
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequest("Username and Password are required.");
  }

  const user = await User.findOne({ username });
  if (!user) {
    throw new BadRequest("Invalid Credentials!");
  }

  const isPasswordCorrect = await user.checkPassword(password);
  if (!isPasswordCorrect) {
    throw new BadRequest("Invalid Credentials!");
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _, ...userInfo } = user._doc;

  return res.status(StatusCodes.OK).json({
    data: userInfo,
    token,
    message: "Login Successful!",
  });
};

module.exports = { loginUser, registerUser };
