import express from "express";
import dotenv from "dotenv";
import mainRouter from "./routes";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 9000;

app.get("/", (_req, res) => {
  res.send("Hello from TypeScript + Node.js!");
});

app.use(
  cors({
    origin: "http://localhost:5000",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/", mainRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend Server is running at http://localhost:${PORT}`);
});