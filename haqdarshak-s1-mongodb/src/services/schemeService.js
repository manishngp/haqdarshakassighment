
import mongoose from "mongoose";

const schemeVersionSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
      required: true,
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
      required: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

    reviewedAt: {
      type: Date,
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    reviewComment: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate versions for the same scheme.
schemeVersionSchema.index(
  { schemeId: 1, version: 1 },
  { unique: true }
);

// Improve scheme version history queries.
schemeVersionSchema.index({ schemeId: 1, version: -1 });

// Prevent OverwriteModelError during repeated model registration.
// const SchemeVersion = mongoose.modelNames().includes("SchemeVersion")
//   ? mongoose.model("SchemeVersion")
//   : mongoose.model("SchemeVersion", schemeVersionSchema);

// export default SchemeVersion;

// const existingModel = mongoose.connection.models.SchemeVersion;

// const SchemeVersion =
//   existingModel || mongoose.model("SchemeVersion", schemeVersionSchema);

// export default SchemeVersion;