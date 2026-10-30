import mongoose from "mongoose";

const fieldChangeSchema = new mongoose.Schema({
  versionId: { type: mongoose.Schema.Types.ObjectId, ref: "SchemeVersion", required: true, index: true },
  field: { type: String, required: true },
  oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
  newValue: { type: mongoose.Schema.Types.Mixed, default: null },
  source: { type: mongoose.Schema.Types.Mixed, default: null },
  changedById: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  changedAt: { type: Date, default: Date.now }
});

export default mongoose.model("FieldChange", fieldChangeSchema);
