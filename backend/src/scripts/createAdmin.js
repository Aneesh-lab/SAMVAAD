import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "aneeshmishra9098@gmail.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Kiran@1981",
      10
    );

    await User.create({
      name: "SAMVAAD Admin",
      email: "aneeshmishra9098@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error);
    process.exit(1);
  }
};

createAdmin();