import paymentController from "../controllers/payment.js";

import express from "express";

const router = express.Router();

router.post("/payment", paymentController.postPayment);

router.post("/callback", paymentController.postCallback);

export default router;
