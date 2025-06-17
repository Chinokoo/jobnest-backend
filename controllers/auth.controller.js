import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  sendPasswordResetEmail,
  sendSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../config/mailtrap/emails.js";
import { randomBytes } from "crypto";

const generateTokenAndCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });

  res.cookie("token", token, {
    secure: true,
    sameSite: "none",
    credentials: true,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, //24hr
  });

  return token;
};

export const register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const findUser = await User.findOne({ email });
    if (findUser)
      return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 1 day
    });

    await user.save();

    generateTokenAndCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("error in the register controller", error);
    return res.status(500).json({
      message: "Internal server error.",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      message: "Email verified successfully.",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("error in the verifyEmail controller", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  // Validate input
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        message: "User not found please create an account to continue.",
      });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Email or Password." });

    generateTokenAndCookie(res, user._id);

    user.lastLogin = Date.now();

    await user.save();

    res.status(200).json({
      message: "Logged in successfully.",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("error in the login controller", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found." });

    // generate reset token and expiry
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiry;
    await user.save();

    // send email with reset token
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("error in the forgotPassword controller", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    // update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendSuccessEmail(user.email);

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("error in the resetPassword controller", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully." });
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("error in the checkAuth controller", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

export const updateUser = async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      user: {
        ...user._doc,
        password: undefined,
      },
      message: "User updated successfully.",
    });
  } catch (error) {
    console.error("error in the updateUser controller", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};
