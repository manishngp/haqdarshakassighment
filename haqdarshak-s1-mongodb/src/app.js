import express from "express";
import cors from "cors";
import { router } from "./routes.js";
import { errorHandler } from "./errors.js";

export const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", router);
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);
