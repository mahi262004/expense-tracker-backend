import express from "express";
import jwt from "jsonwebtoken";
import { User } from "./db.js";
import "dotenv/config";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  const isEmailVerified = await User.findOne({
    email: req.body.email,
  });
  if (isEmailVerified) {
    return res.json({
      message: "user already exists",
    });
  }

  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  const userId = user._id;
  const token = jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
  );
  res.json({
    message: "you are signed up",
    token: token,
  });
});

app.post("/signin", async (req, res) => {
  const emailValid = await User.findOne({
    email: req.body.email,
  });

  if (emailValid) {
    if (emailValid.password == req.body.password) {
      const userId = emailValid._id;
      const token = jwt.sign(
        {
          userId,
        },
        process.env.JWT_SECRET,
      );
      res.json({
        message: "you are signed in",
        token: token,
      });
    }else{
        return res.json({
            message: "wrong password"
        })
    }
  } else {
    return res.json({
      message: "user does not exist",
    });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3000");
});
