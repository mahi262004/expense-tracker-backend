const mongoose = require("mongoose");

await mongoose.connect(process.env.MONGO_URI);
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
    maxLength: 25,
  },
  password: {
    type: String,
    required: true,
    minLength: 3,
  },
  email: {
    type: String,
    required: true,
  },
});

const transactionsSchema = new mongoose.Schema({
  transactionName: {
    type: String,
    required: true,
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tags",
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  type: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const tagsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("user", userSchema);
const Tags = mongoose.model("tags", tagsSchema);
const Transactions = mongoose.model("transactions", transactionsSchema);

module.exports = {
  User,
  Transactions,
  Tags,
};
