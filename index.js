import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import bcrypt from "bcrypt";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { User, Transactions, Tags, Budget } from "./db.js";
import {
  signupSchema,
  signinSchema,
  transactionSchema,
  tagSchema,
  budgetSchema,
  validate,
} from "./validators.js";
import "dotenv/config";

if (!process.env.JWT_SECRET) {
  console.error(
    "Missing JWT_SECRET in environment variables. Check your .env file."
  );
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());


const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});


const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


app.post("/signup", authLimiter, validate(signupSchema), async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ message: "You are signed up", token });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});

app.post("/signin", authLimiter, validate(signinSchema), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ message: "You are signed in", token });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});


app.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transactions.find({
      userId: req.userId,
    }).populate("tag");
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

app.post(
  "/transactions",
  authMiddleware,
  validate(transactionSchema),
  async (req, res) => {
    try {
      const transaction = await Transactions.create({
        ...req.body,
        userId: req.userId,
      });
      res.status(201).json(transaction);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  }
);

app.put(
  "/transactions/:id",
  authMiddleware,
  validate(transactionSchema),
  async (req, res) => {
    try {
      const transaction = await Transactions.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { returnDocument: "after" }
      );
      if (!transaction)
        return res.status(404).json({ message: "Transaction not found" });
      res.json(transaction);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  }
);

app.delete("/transactions/:id", authMiddleware, async (req, res) => {
  try {
    await Transactions.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
});


app.get("/tags", authMiddleware, async (req, res) => {
  try {
    const tags = await Tags.find({ userId: req.userId });
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
});

app.post("/tags", authMiddleware, validate(tagSchema), async (req, res) => {
  try {
    const tag = await Tags.create({ ...req.body, userId: req.userId });
    res.status(201).json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create tag" });
  }
});

app.put(
  "/tags/:id",
  authMiddleware,
  validate(tagSchema),
  async (req, res) => {
    try {
      const tag = await Tags.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { returnDocument: "after" }
      );
      if (!tag) return res.status(404).json({ message: "Tag not found" });
      res.json(tag);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update tag" });
    }
  }
);

app.delete("/tags/:id", authMiddleware, async (req, res) => {
  try {
    await Tags.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Tag deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete tag" });
  }
});


app.get("/budgets", authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId }).populate(
      "tag"
    );
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch budgets" });
  }
});

app.post(
  "/budgets",
  authMiddleware,
  validate(budgetSchema),
  async (req, res) => {
    try {
      const budget = await Budget.create({ ...req.body, userId: req.userId });
      res.status(201).json(budget);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message:
          "Failed to create budget. You may already have one for this tag/month.",
      });
    }
  }
);

app.put(
  "/budgets/:id",
  authMiddleware,
  validate(budgetSchema),
  async (req, res) => {
    try {
      const budget = await Budget.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { returnDocument: "after" }
      );
      if (!budget)
        return res.status(404).json({ message: "Budget not found" });
      res.json(budget);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update budget" });
    }
  }
);

app.delete("/budgets/:id", authMiddleware, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Budget deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete budget" });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});