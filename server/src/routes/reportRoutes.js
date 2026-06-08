import { Router } from "express";
import {
  getChequeReminders,
  getDashboardSummary,
  getOutstandingInvoices,
} from "../controllers/reportController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/dashboard-summary", asyncHandler(getDashboardSummary));
router.get("/outstanding-invoices", asyncHandler(getOutstandingInvoices));
router.get("/cheque-reminders", asyncHandler(getChequeReminders));

export default router;

