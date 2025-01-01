import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    originalImageUrl: {
      type: String,
      required: true,
    },
    convertedImageUrl: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    plyUrl: {
      type: String,
      default: null,
    },
    inputs: {
      promptInput: String,
      negativePromptInput: String,
      elevation: Number,
      inferenceSteps: Number,
      randomSeed: Number,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("product", productSchema);

export default Product;
