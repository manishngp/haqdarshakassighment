import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";
import Scheme from "../src/models/Scheme.js";
import SchemeVersion from "../src/models/SchemeVersion.js";
import EligibilityRule from "../src/models/EligibilityRule.js";
import SchemeRule from "../src/models/SchemeRule.js";

await connectDB();
const passwordHash = await bcrypt.hash("Pass@123", 10);
const state = await User.findOneAndUpdate(
  { email: "state@haqdarshak.test" },
  { $setOnInsert: { name: "State Reviewer", email: "state@haqdarshak.test", passwordHash, role: "STATE_REVIEWER" } },
  { upsert: true, new: true }
);
const central = await User.findOneAndUpdate(
  { email: "central@haqdarshak.test" },
  { $setOnInsert: { name: "Central Reviewer", email: "central@haqdarshak.test", passwordHash, role: "CENTRAL_REVIEWER" } },
  { upsert: true, new: true }
);
let scheme = await Scheme.findOne({ schemeCode: "DEMO-001" });
if (!scheme) scheme = await Scheme.create({ schemeCode: "DEMO-001", name: "Demo Student Support Scheme" });
if (!scheme.publishedVersionId) {
  const version = await SchemeVersion.create({
    schemeId: scheme._id, version: 1, status: "PUBLISHED", createdById: state._id,
    reviewedById: central._id, reviewedAt: new Date(), publishedAt: new Date(),
    data: {
      benefitAmount: { value: 6000, currency: "INR", frequency: "yearly", source: "synthetic://demo.pdf", page: 2 },
      eligibility: { category: "SC/ST", annualFamilyIncomeBelow: 250000 },
      deadline: null
    }
  });
  scheme.publishedVersionId = version._id;
  await scheme.save();
}
const rule = await EligibilityRule.findOneAndUpdate(
  { ruleCode: "INCOME-250K" },
  { $setOnInsert: { description: "Annual family income below ₹2.5 lakh", expression: { field: "annualFamilyIncome", operator: "LT", value: 250000 } } },
  { upsert: true, new: true }
);
await SchemeRule.updateOne({ schemeId: scheme._id, ruleId: rule._id }, { $setOnInsert: { schemeId: scheme._id, ruleId: rule._id } }, { upsert: true });
console.log("Seed complete.");
console.log("state@haqdarshak.test / Pass@123");
console.log("central@haqdarshak.test / Pass@123");
console.log("Demo scheme ID:", String(scheme._id));
process.exit(0);
