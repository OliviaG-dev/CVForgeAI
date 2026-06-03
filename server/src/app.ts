import express, { type Request, type Response } from "express";
import cors from "cors";
import { cvRouter } from "./routes/cv.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        const allowed = [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
        ];
        if (
          !origin ||
          allowed.includes(origin) ||
          /^https:\/\/.*\.vercel\.app$/.test(origin)
        ) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    }),
  );
  app.use(express.json());

  app.use("/api/cv", cvRouter);

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  return app;
}
