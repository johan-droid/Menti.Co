import "dotenv/config";
import jwt from "jsonwebtoken";
import { connectDb } from "../config/db.js";
import { ConditionModel } from "../models/Condition.js";
import { DoctorModel } from "../models/Doctor.js";

async function seed() {
  await connectDb();

  await ConditionModel.updateOne(
    { slug: "generalized-anxiety-disorder" },
    {
      $set: {
        title: "Generalized Anxiety Disorder",
        summary: "Persistent and excessive worry across daily domains.",
        symptoms: ["restlessness", "fatigue", "sleep disturbance"],
        references: ["https://www.nimh.nih.gov/health/topics/anxiety-disorders"],
        lastReviewedAt: new Date()
      }
    },
    { upsert: true }
  );

  await DoctorModel.updateOne(
    { fullName: "Dr. Ananya Rao", city: "Mumbai" },
    {
      $set: {
        specialties: ["Psychiatry"],
        availability: "Mon-Fri 10:00-18:00",
        verified: true
      }
    },
    { upsert: true }
  );

  console.log("Seeded sample conditions and doctors.");

  if (process.env.JWT_SECRET) {
    const adminToken = jwt.sign({ userId: "dev-admin", role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "12h"
    });
    const reviewerToken = jwt.sign(
      { userId: "dev-reviewer", role: "reviewer" },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h"
      }
    );

    console.log("\nDev tokens (valid 12h):");
    console.log(`ADMIN_TOKEN=${adminToken}`);
    console.log(`REVIEWER_TOKEN=${reviewerToken}`);
  } else {
    console.log("JWT_SECRET not set; skipped token generation.");
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error("seed:dev failed", error);
  process.exit(1);
});
