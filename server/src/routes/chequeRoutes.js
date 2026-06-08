import { Router } from "express";
import {
  createCheque,
  deleteCheque,
  getChequeById,
  getCheques,
  markChequeDeposited,
  updateCheque,
} from "../controllers/chequeController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getCheques));
router.post("/", asyncHandler(createCheque));
router.get("/:id", asyncHandler(getChequeById));
router.put("/:id", asyncHandler(updateCheque));
router.delete("/:id", asyncHandler(deleteCheque));
router.post("/:id/mark-deposited", asyncHandler(markChequeDeposited));

export default router;
