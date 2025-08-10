import express from "express";
import dotenv from "dotenv";
import mainRouter from "./routes";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

dotenv.config();

const prisma = new PrismaClient();

const swaggerDocument = YAML.load(path.join(__dirname, "../docs/openapi.yaml"));

const app = express();
const PORT = process.env.PORT || 9000;

app.get("/", (_req, res) => {
  res.send("Hello from TypeScript + Node.js!");
});

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
  console.log("API Docs available at http://localhost:8000/api-docs");
});
