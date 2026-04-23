import { randomUUID } from "node:crypto";
import type { Server } from "socket.io";
import { eventEnvelopeSchema } from "@mentico/contracts/src/index.js";
import { ContentRevisionModel } from "../models/ContentRevision.js";

export function startContentRevisionStream(io: Server) {
  const stream = ContentRevisionModel.watch([], { fullDocument: "updateLookup" });

  stream.on("change", (change) => {
    const fullDoc = change.fullDocument;
    if (!fullDoc) return;

    const event = eventEnvelopeSchema.safeParse({
      eventId: randomUUID(),
      type: "content.updated",
      entity: "content",
      entityId: String(fullDoc.entityId),
      version: Number(fullDoc.version ?? 0),
      ts: new Date().toISOString(),
      actorId: "system",
      payload: {
        state: fullDoc.state,
        title: fullDoc.title
      }
    });

    if (!event.success) return;
    io.to("public:conditions").emit("content.updated", event.data);
  });

  stream.on("error", (error) => {
    console.error("ContentRevision change stream error", error);
  });

  return stream;
}
