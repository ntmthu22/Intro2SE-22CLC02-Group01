import paymentController from "../controllers/payment.js";
import checkRole from "../middlewares/check-role.js";

import express from "express";

const router = express.Router();

router.post("/payment", checkRole("user"), paymentController.postPayment);

router.post("/callback", paymentController.postCallback);

export default router;
