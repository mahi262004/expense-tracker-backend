import express from "express";
import jwt from "jsonwebtoken";
import { User } from "./db.js";
import "dotenv/config";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    let username= req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    const user= await User.create({
        username,
        password,
        email,

    })
    const userId= user._id
    const token = jwt.sign({
        userId
    }, process.env.JWT_SECRET);
    res.json({
        mesaage:"you are signed up",
        token:token
    })


}) 

app.listen(3001, () => {
    console.log("Server is running on port 3000");
  });



