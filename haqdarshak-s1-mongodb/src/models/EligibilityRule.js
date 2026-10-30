import mongoose from "mongoose";

const eligibilityRuleSchema = new mongoose.Schema({
  ruleCode: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, required: true },
  expression: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export default mongoose.model("EligibilityRule", eligibilityRuleSchema);
