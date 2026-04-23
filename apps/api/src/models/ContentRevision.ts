import { Schema, model } from "mongoose";

const contentRevisionSchema = new Schema(
  {
    entityType: { type: String, enum: ["condition", "article"], required: true },
    entityId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    state: {
      type: String,
      enum: ["draft", "ai_processed", "clinician_reviewed", "approved", "published", "archived"],
      required: true
    },
    title: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    body: { type: String, required: true },
    reviewerNotes: { type: [String], default: [] }
  },
  { timestamps: true }
);

contentRevisionSchema.index({ entityId: 1, version: 1 }, { unique: true });

export const ContentRevisionModel = model("ContentRevision", contentRevisionSchema);
