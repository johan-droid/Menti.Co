import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { connectDb } from "./config/db.js";
import { startContentRevisionStream } from "./realtime/contentStream.js";
import { buildAdminContentRouter } from "./routes/adminContent.js";
import { authRouter } from "./routes/auth.js";
import { publicRouter } from "./routes/public.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api", ts: new Date().toISOString() });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? "*"
  }
});

io.on("connection", (socket) => {
  socket.join("public:conditions");
  socket.emit("connected", { id: socket.id, ts: new Date().toISOString() });
});

const port = Number(process.env.API_PORT ?? 4000);
app.use("/v1/public", publicRouter);
app.use("/v1/auth", authRouter);
app.use("/v1/admin/content", buildAdminContentRouter());

async function start() {
  await connectDb();
  startContentRevisionStream(io);
  httpServer.listen(port, () => {
    console.log(`API + Socket listening on :${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
