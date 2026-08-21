import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
} from "../controllers/product.controller.js";

import { verifyJwt, isAdmin } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/", verifyJwt, isAdmin, upload.single("image"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

export default router;
