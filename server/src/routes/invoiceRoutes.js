import { Router } from "express";
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoicePdf,
  getInvoices,
  issueInvoice,
  markInvoicePaid,
  updateInvoice,
} from "../controllers/invoiceController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getInvoices));
router.post("/", asyncHandler(createInvoice));
router.get("/:id", asyncHandler(getInvoiceById));
router.put("/:id", asyncHandler(updateInvoice));
router.delete("/:id", asyncHandler(deleteInvoice));
router.post("/:id/issue", asyncHandler(issueInvoice));
router.post("/:id/mark-paid", asyncHandler(markInvoicePaid));
router.get("/:id/pdf", asyncHandler(getInvoicePdf));

export default router;
