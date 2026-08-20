import { Router } from "express";
import { createCategory } from "../controllers/category.controller";

import { verifyJwt, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-category", verifyJwt, isAdmin, createCategory);

export default router;
