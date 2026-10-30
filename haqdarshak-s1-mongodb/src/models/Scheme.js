
import mongoose from "mongoose";

const schemeSchema = new mongoose.Schema(
  {
    schemeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    publishedVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchemeVersion",
      default: null,
    },
  },
  { timestamps: true }
);

const Scheme =
  mongoose.models.Scheme ||
  mongoose.model("Scheme", schemeSchema);

export default Scheme;
