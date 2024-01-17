import { ObjectId } from "mongodb";
import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้

authRouter.post("/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

   
    const saltRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = {
      username,
      password: hashedPassword,
      firstName,
      lastName,
    };

    const collection = db.collection("user");
    const result = await collection.insertOne(user);

    return res.json({
      message: "User has been created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while creating the user",
    });
  }
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้

authRouter.post("/login", async (req, res) => {
  const user = await db
    .collection("user")
    .find({ username: req.body.username })
    .toArray();
  if (!user.length) {
    return res.status(404).json({
      message: "user not found",
    });
  }
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user[0].password
  );
  if (!isValidPassword) {
    return res.status(401).json({
      message: "password not valid",
    });
  }
  const token = jwt.sign(
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "90000",
    }
  );
  return res.json({
    message: "login succesfully",
    token,
  });
});
export default authRouter;
