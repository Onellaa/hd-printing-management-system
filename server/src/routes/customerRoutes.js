import { Router } from "express";
import {
  createCustomer,
  deactivateCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  reactivateCustomer,
  updateCustomer,
} from "../controllers/customerController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getCustomers));
router.post("/", asyncHandler(createCustomer));
router.get("/:id", asyncHandler(getCustomerById));
router.put("/:id", asyncHandler(updateCustomer));
router.post("/:id/deactivate", asyncHandler(deactivateCustomer));
router.post("/:id/reactivate", asyncHandler(reactivateCustomer));
router.delete("/:id", asyncHandler(deleteCustomer));

export default router;
