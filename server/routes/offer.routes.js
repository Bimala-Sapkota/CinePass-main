import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createOffer,
  deleteOffer,
  getActiveOffers,
  getAllOffers,
  updateOffer,
  validatePromoCode,
} from "../controllers/offer.controller.js";

const router = express.Router();

router.get("/active", getActiveOffers);
router.post("/validate", validatePromoCode);

router.use(protect, authorize("admin"));

router.route("/").get(getAllOffers).post(createOffer);

router.route("/:id").patch(updateOffer).delete(deleteOffer);

export default router;
