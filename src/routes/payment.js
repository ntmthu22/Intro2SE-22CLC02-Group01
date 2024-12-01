import paymentController from "../controllers/payment.js";
import isUser from "../middlewares/is-user.js";
import { body } from "express-validator";

import express from "express";

const router = express.Router();

router.post("/payment", isUser, paymentController.postPayment);

router.post("/callback", paymentController.postCallback);

export default router;
