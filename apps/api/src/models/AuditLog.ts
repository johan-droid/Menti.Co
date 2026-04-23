import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true, index: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

export const AuditLogModel = model("AuditLog", auditLogSchema);
