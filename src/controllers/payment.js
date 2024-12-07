//https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
//parameters
import axios from "axios";
import crypto from "crypto";
import User from "../models/user.js";

var accessKey = "F8BBA842ECF85";
var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

const paymentController = {
  postPayment: async (req, res, next) => {
    console.log(req.user.membershipType);
    if (req.user.membershipType === "Premium") {
      console.log("You are already on Premium plan!");
      req.flash("success", "You are already on Premium plan!");
      res.status(200).redirect("/user/profile");
    }

    var orderInfo = "pay with MoMo";
    var partnerCode = "MOMO";
    const host = `${req.protocol}://${req.get("host")}`;
    var redirectUrl = `${host}/user/profile`;
    var ipnUrl =
      "https://518e-2405-4803-c636-3f00-18da-b3d6-fd8c-5d0c.ngrok-free.app/callback";
    var requestType = "payWithMethod";
    var amount = "50000";
    var orderId = partnerCode + new Date().getTime();
    var requestId = orderId;
    var extraData = req.user._id.toString();
    var orderGroupId = "";
    var autoCapture = true;
    var lang = "vi";

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=" +
      requestType;
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);
    //signature

    var signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });
    // for axios
    const options = {
      method: "POST",
      url: "https://test-payment.momo.vn/v2/gateway/api/create",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };

    let result;

    try {
      result = await axios(options);
      return res.status(200).redirect(result.data.payUrl);
      // return res.status(200).json(result.data);
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: "Server error",
      });
    }
  },
  postCallback: async (req, res, next) => {
    console.log("Callback called");
    const userId = req.body.extraData;
    try {
      const user = await User.findById(userId);

      console.log(user);

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          message: "User not found",
        });
      }
      console.log(req.body.resultCode);

      if (!req.body.resultCode) {
        await user.upgradeAccount();
        console.log("Membership updated!");
      }

      return res
        .status(200)
        .json({ message: "Callback processed successfully" });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },
};

export default paymentController;
