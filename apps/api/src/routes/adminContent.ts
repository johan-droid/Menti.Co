import { Router } from "express";
import { randomUUID } from "node:crypto";
import {
  ingestContentSchema,
  reviewActionSchema,
  type ContentWorkflowState
} from "@mentico/contracts/src/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { AuditLogModel } from "../models/AuditLog.js";
import { ContentRevisionModel } from "../models/ContentRevision.js";

const transitions: Record<ContentWorkflowState, ContentWorkflowState[]> = {
  draft: ["ai_processed"],
  ai_processed: ["clinician_reviewed"],
  clinician_reviewed: ["approved"],
  approved: ["published"],
  published: ["archived"],
  archived: []
};

async function writeAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  before: unknown,
  after: unknown
) {
  await AuditLogModel.create({ actorId, action, entity, entityId, before, after });
}

export function buildAdminContentRouter() {
  const router = Router();
  router.use(requireAuth);

  router.post("/ingest", requireRole(["admin"]), async (req, res) => {
    const parsed = ingestContentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.flatten() });

    const entityId = randomUUID();
    const created = await ContentRevisionModel.create({
      entityType: "condition",
      entityId,
      version: 1,
      state: "draft",
      ...parsed.data
    });
    await writeAudit(req.user!.userId, "content.ingest", "content", entityId, null, created.toObject());
    return res.status(201).json({ ok: true, data: created });
  });

  router.post("/:entityId/review", requireRole(["reviewer", "admin"]), async (req, res) => {
    const parsed = reviewActionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.flatten() });
    const current = await ContentRevisionModel.findOne({ entityId: req.params.entityId })
      .sort({ version: -1 })
      .lean();
    if (!current) return res.status(404).json({ ok: false, error: "Content not found" });
    if (!transitions[current.state as ContentWorkflowState].includes("clinician_reviewed")) {
      return res.status(409).json({ ok: false, error: "Invalid state transition to clinician_reviewed" });
    }

    const next = await ContentRevisionModel.create({
      ...current,
      _id: undefined,
      version: current.version + 1,
      state: "clinician_reviewed",
      reviewerNotes: [...(current.reviewerNotes ?? []), parsed.data.notes]
    });
    await writeAudit(
      req.user!.userId,
      "content.review",
      "content",
      req.params.entityId,
      current,
      next.toObject()
    );
    return res.json({ ok: true, data: next });
  });

  router.post("/:entityId/approve", requireRole(["admin"]), async (req, res) => {
    const current = await ContentRevisionModel.findOne({ entityId: req.params.entityId })
      .sort({ version: -1 })
      .lean();
    if (!current) return res.status(404).json({ ok: false, error: "Content not found" });
    if (!transitions[current.state as ContentWorkflowState].includes("approved")) {
      return res.status(409).json({ ok: false, error: "Invalid state transition to approved" });
    }

    const next = await ContentRevisionModel.create({
      ...current,
      _id: undefined,
      version: current.version + 1,
      state: "approved"
    });
    await writeAudit(
      req.user!.userId,
      "content.approve",
      "content",
      req.params.entityId,
      current,
      next.toObject()
    );
    return res.json({ ok: true, data: next });
  });

  router.post("/:entityId/publish", requireRole(["admin"]), async (req, res) => {
    const current = await ContentRevisionModel.findOne({ entityId: req.params.entityId })
      .sort({ version: -1 })
      .lean();
    if (!current) return res.status(404).json({ ok: false, error: "Content not found" });
    if (!transitions[current.state as ContentWorkflowState].includes("published")) {
      return res.status(409).json({ ok: false, error: "Invalid state transition to published" });
    }

    const next = await ContentRevisionModel.create({
      ...current,
      _id: undefined,
      version: current.version + 1,
      state: "published"
    });
    await writeAudit(
      req.user!.userId,
      "content.publish",
      "content",
      req.params.entityId,
      current,
      next.toObject()
    );
    return res.json({ ok: true, data: next });
  });

  router.get("/audit-logs", requireRole(["admin"]), async (_req, res) => {
    const rows = await AuditLogModel.find({}).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ ok: true, data: rows });
  });

  return router;
}
