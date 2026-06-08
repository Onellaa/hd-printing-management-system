import { Router } from "express";
import {
  createPayment,
  deletePayment,
  getPaymentById,
  getPayments,
  updatePayment,
} from "../controllers/paymentController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getPayments));
router.post("/", asyncHandler(createPayment));
router.get("/:id", asyncHandler(getPaymentById));
router.put("/:id", asyncHandler(updatePayment));
router.delete("/:id", asyncHandler(deletePayment));

export default router;
