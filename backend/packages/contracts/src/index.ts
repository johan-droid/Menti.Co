import { z } from "zod";

export const contentWorkflowStateSchema = z.enum([
  "draft",
  "ai_processed",
  "clinician_reviewed",
  "approved",
  "published",
  "archived"
]);

export const eventEnvelopeSchema = z.object({
  eventId: z.string().min(1),
  type: z.string().min(1),
  entity: z.enum(["condition", "doctor", "content", "job"]),
  entityId: z.string().min(1),
  version: z.number().int().nonnegative(),
  ts: z.string().datetime(),
  actorId: z.string().min(1),
  payload: z.record(z.unknown())
});

export const ingestContentSchema = z.object({
  title: z.string().min(5),
  sourceUrl: z.string().url(),
  body: z.string().min(50)
});

export const reviewActionSchema = z.object({
  notes: z.string().min(5)
});

export type ContentWorkflowState = z.infer<typeof contentWorkflowStateSchema>;
export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
export type IngestContentInput = z.infer<typeof ingestContentSchema>;
export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
