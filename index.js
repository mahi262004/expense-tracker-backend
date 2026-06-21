import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import { User, Transactions, Tags, Budget } from "./db.js";
import "dotenv/config";

const app = express();
app.use(cors());           // ← allows frontend to call backend
app.use(express.json());

// ── Auth Middleware ───────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ── Auth Routes ───────────────────────────────────────────
app.post("/signup", async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) return res.json({ message: "user already exists" });

  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ message: "you are signed up", token });
});

app.post("/signin", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ message: "user does not exist" });
  if (user.password !== req.body.password) return res.json({ message: "wrong password" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ message: "you are signed in", token });
});

// ── Transaction Routes ────────────────────────────────────
app.get("/transactions", authMiddleware, async (req, res) => {
  const transactions = await Transactions.find({ userId: req.userId }).populate("tag");
  res.json(transactions);
});

app.post("/transactions", authMiddleware, async (req, res) => {
  const transaction = await Transactions.create({ ...req.body, userId: req.userId });
  res.json(transaction);
});

app.put("/transactions/:id", authMiddleware, async (req, res) => {
  const transaction = await Transactions.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(transaction);
});

// ── Tags Routes ───────────────────────────────────────────
app.get("/tags", authMiddleware, async (req, res) => {
  const tags = await Tags.find({ userId: req.userId });
  res.json(tags);
});

app.post("/tags", authMiddleware, async (req, res) => {
  const tag = await Tags.create({ ...req.body, userId: req.userId });
  res.json(tag);
});

app.put("/tags/:id", authMiddleware, async (req, res) => {
  const tag = await Tags.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(tag);
});

// ── Budget Routes ─────────────────────────────────────────
app.get("/budgets", authMiddleware, async (req, res) => {
  const budgets = await Budget.find({ userId: req.userId }).populate("tag");
  res.json(budgets);
});

app.post("/budgets", authMiddleware, async (req, res) => {
  const budget = await Budget.create({ ...req.body, userId: req.userId });
  res.json(budget);
});

app.put("/budgets/:id", authMiddleware, async (req, res) => {
  const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(budget);
});

// ─────────────────────────────────────────────────────────
app.listen(3001, () => console.log("Server running on port 3001"));