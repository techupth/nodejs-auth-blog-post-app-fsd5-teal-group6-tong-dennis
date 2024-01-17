import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();
const usersCollection = db.collection("users");
// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const user = {
    username,
    password,
    firstName,
    lastName,
  };
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  try {
    await usersCollection.insertOne(user);
    return res.json({
      message: "User has been created successfully",
    });
  } catch {
    return res.status(400).json({
      message: "Bad request",
    });
  }
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้

authRouter.post("/login", async (req, res) => {
  const user = await usersCollection.findOne({ username: req.body.username });
  console.log(user);
  if (!user) {
    return res.status(404).json({ message: "User not found in database" });
  }
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isValidPassword) {
    return res.status(400).json({ message: "Password is not valid" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "900000",
    }
  );
  return res.json({ message: "login successfully", token });
});

export default authRouter;
