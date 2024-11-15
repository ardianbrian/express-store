import bcrypt from "bcryptjs";
//
import UserModel from "../models/user.model.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password) => password && password.length >= 6;

const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name) && name.length >= 3;

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        msg: `Missing fields: ${missingFields.join(", ")}`,
        error: true,
        success: false,
      });
    }

    if (!isValidName(name)) {
      return res.status(400).json({
        msg: "Name must be at least 3 characters",
        error: true,
        success: false,
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        msg: "Invalid email format",
        error: true,
        success: false,
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters",
        error: true,
        success: true,
      });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        msg: "User already registered",
        error: true,
        success: false,
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      msg: "User registered successfully",
      error: false,
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}
