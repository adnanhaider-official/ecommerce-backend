import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/category.controller.js";

import { verifyJwt, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJwt, isAdmin, createCategory);

router.get("/", getAllCategories);

router.patch("/:id", verifyJwt, isAdmin, updateCategory);

router.delete("/:id", verifyJwt, isAdmin, deleteCategory);

export default router;
