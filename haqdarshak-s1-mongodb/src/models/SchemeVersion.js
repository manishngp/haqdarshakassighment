
import mongoose from "mongoose";

const schemeVersionSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "IN_REVIEW",
        "PUBLISHED",
        "RETURNED",
        "SUPERSEDED",
      ],
      default: "DRAFT",
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewComment: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

schemeVersionSchema.index(
  { schemeId: 1, version: 1 },
  { unique: true }
);

const SchemeVersion =
  mongoose.models.SchemeVersion ||
  mongoose.model("SchemeVersion", schemeVersionSchema);

export default SchemeVersion;
