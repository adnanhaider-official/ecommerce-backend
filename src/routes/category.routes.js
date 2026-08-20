import { Router } from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/category.controller";

import { verifyJwt, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-category", verifyJwt, isAdmin, createCategory);

router.get("/", getAllCategories);

export default router;
