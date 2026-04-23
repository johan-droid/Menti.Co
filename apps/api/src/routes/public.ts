import { Router } from "express";
import { ConditionModel } from "../models/Condition.js";
import { DoctorModel } from "../models/Doctor.js";

export const publicRouter = Router();

publicRouter.get("/conditions", async (req, res) => {
  const query = String(req.query.query ?? "").trim();
  const filter = query
    ? { $or: [{ title: new RegExp(query, "i") }, { summary: new RegExp(query, "i") }] }
    : {};
  const rows = await ConditionModel.find(filter).sort({ updatedAt: -1 }).limit(20).lean();
  res.json({ ok: true, data: rows });
});

publicRouter.get("/doctors", async (req, res) => {
  const specialty = String(req.query.specialty ?? "").trim();
  const city = String(req.query.city ?? "").trim();
  const filter: Record<string, unknown> = {};
  if (specialty) filter.specialties = specialty;
  if (city) filter.city = city;
  const rows = await DoctorModel.find(filter).sort({ verified: -1, updatedAt: -1 }).limit(50).lean();
  res.json({ ok: true, data: rows });
});
