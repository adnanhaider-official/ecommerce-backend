import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/product.controller.js";

import { verifyJwt, isAdmin } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/", verifyJwt, isAdmin, upload.single("image"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);
router.patch("/:id", verifyJwt, isAdmin, upload.single("image"), updateProduct);

export default router;
