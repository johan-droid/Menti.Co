import { Schema, model } from "mongoose";

const conditionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    symptoms: { type: [String], default: [] },
    references: { type: [String], default: [] },
    lastReviewedAt: { type: Date }
  },
  { timestamps: true }
);

export const ConditionModel = model("Condition", conditionSchema);
