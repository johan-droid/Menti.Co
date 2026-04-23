import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
  {
    fullName: { type: String, required: true },
    specialties: { type: [String], required: true, index: true },
    city: { type: String, required: true, index: true },
    availability: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

doctorSchema.index({ specialties: 1, city: 1 });

export const DoctorModel = model("Doctor", doctorSchema);
