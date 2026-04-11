import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
