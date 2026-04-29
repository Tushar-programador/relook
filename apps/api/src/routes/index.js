import { Router } from "express";
import { authRouter } from "./auth-routes.js";
import { feedbackRouter } from "./feedback-routes.js";
import { projectRouter } from "./project-routes.js";
import { publicRouter } from "./public-routes.js";
import { uploadRouter } from "./upload-routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok"
    },
    error: null
  });
});

router.use("/auth", authRouter);
router.use("/projects", projectRouter);
router.use("/feedback", feedbackRouter);
router.use("/public", publicRouter);
router.use("/uploads", uploadRouter);

export { router as apiRouter };