import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const signupSchema = z.object({
  username: z.string().min(4, "Username must be at least 4 characters").max(25),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  email: z.string().email("Invalid email address"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const transactionSchema = z.object({
  transactionName: z.string().min(1, "Name is required").max(100),
  value: z.number().positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  tag: objectId,
  date: z.coerce.date(),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(40),
});

export const budgetSchema = z.object({
  tag: objectId,
  amount: z.number().positive("Budget amount must be greater than 0"),
  month: z.coerce.date(),
});


export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  req.body = result.data;
  next();
};