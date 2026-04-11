import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// registerRoutes sets up session middleware and all API routes
await registerRoutes(app);

export default app;
