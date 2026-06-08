import { Router } from "express";
import {
  getCompanyProfile,
  upsertCompanyProfile,
} from "../controllers/companyProfileController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getCompanyProfile));
router.put("/", asyncHandler(upsertCompanyProfile));

export default router;

