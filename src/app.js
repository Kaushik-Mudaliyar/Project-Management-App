import express, { urlencoded } from "express";
import cors from "cors";

const app = express();

// configure app
app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// import routes
import healthCheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.routes.js";
app.use("/api/v1/healtcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.get("/", (req, res) => {
  res.send("Hello world");
});

export default app;
