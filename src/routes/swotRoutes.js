import express from "express";
import { getSWOTQuestions, generateSwot, getAllSwotReports, downloadSwotPDF } from "../controllers/swotController.js";

const router = express.Router();

router.get("/questions", getSWOTQuestions);
router.post("/swot-analysis", generateSwot);
router.get("/swot-reports", getAllSwotReports); // ← ✅ new route
router.get("/swot-pdf/:userId", downloadSwotPDF);

export default router;
