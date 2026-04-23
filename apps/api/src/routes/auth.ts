import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["patient", "doctor", "admin", "reviewer"])
});

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ ok: false, error: "JWT_SECRET is required" });

  const token = jwt.sign(parsed.data, secret, { expiresIn: "12h" });
  return res.json({ ok: true, data: { token, ...parsed.data } });
});
