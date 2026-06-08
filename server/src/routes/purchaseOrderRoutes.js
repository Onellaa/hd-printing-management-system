import { Router } from "express";
import {
  convertPurchaseOrderToInvoice,
  createPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderById,
  getPurchaseOrders,
  updatePurchaseOrder,
} from "../controllers/purchaseOrderController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getPurchaseOrders));
router.post("/", asyncHandler(createPurchaseOrder));
router.get("/:id", asyncHandler(getPurchaseOrderById));
router.put("/:id", asyncHandler(updatePurchaseOrder));
router.delete("/:id", asyncHandler(deletePurchaseOrder));
router.post("/:id/convert-to-invoice", asyncHandler(convertPurchaseOrderToInvoice));

export default router;
