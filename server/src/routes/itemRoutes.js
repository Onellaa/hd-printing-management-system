import { Router } from "express";
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  updateItem,
} from "../controllers/itemController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getItems));
router.post("/", asyncHandler(createItem));
router.get("/:id", asyncHandler(getItemById));
router.put("/:id", asyncHandler(updateItem));
router.delete("/:id", asyncHandler(deleteItem));

export default router;
