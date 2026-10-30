
import mongoose from "mongoose";

const schemeRuleSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
      required: true,
      index: true,
    },
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EligibilityRule",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

schemeRuleSchema.index(
  { schemeId: 1, ruleId: 1 },
  { unique: true }
);

const SchemeRule =
  mongoose.models.SchemeRule ||
  mongoose.model("SchemeRule", schemeRuleSchema);

export default SchemeRule;
