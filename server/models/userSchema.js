const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const options = { discriminatorKey: "role", timestamps: true };

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Your Name"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Please Enter Your Username"],
      validate: {
        validator: async function (username) {
          if (this.isModified("username")) {
            const user = await mongoose.models.User.findOne({ username });
            return !user || !user.isVerified || user._id.equals(this._id);
          }
          return true;
        },
        message: "Username already exists",
      },
    },
    email: {
      type: String,
      required: [true, "Please Enter Your Email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email!",
      ],
      validate: {
        validator: async function (email) {
          if (this.isModified("email")) {
            const user = await mongoose.models.User.findOne({ email });
            return !user || !user.isVerified || user._id.equals(this._id);
          }
          return true;
        },
        message: "Email already exists",
      },
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dzjbxojvu/image/upload/v1756096742/profile_n3nxlk.png",
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password!"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
  },
  options
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

userSchema.methods.checkPassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
