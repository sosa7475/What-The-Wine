import express from "express";
import { registerRoutes } from "./routes";

const app = express();
// 10mb so base64 blog thumbnails from the content agent aren't rejected (413).
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));

let initPromise: Promise<void> | null = null;

function init() {
  if (!initPromise) {
    initPromise = registerRoutes(app).then(() => {});
  }
  return initPromise;
}

init();

export default async function handler(req: any, res: any) {
  await init();
  app(req, res);
}
