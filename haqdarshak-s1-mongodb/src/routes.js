import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "./models/User.js";
// import Scheme from "./models/Scheme.js";
// import SchemeVersion from "./models/SchemeVersion.js";
import FieldChange from "./models/FieldChange.js";
import { HttpError, asyncHandler } from "./errors.js";
import { requireAuth, allowRoles } from "./middleware/auth.js";
import Scheme from "./models/Scheme.js";
import SchemeVersion from "./models/SchemeVersion.js";
import * as service from "./services/schemeService.js";

export const router = express.Router();

router.post("/auth/login", asyncHandler(async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!body.success) throw new HttpError(400, "Valid email and password are required");
  const user = await User.findOne({ email: body.data.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(body.data.password, user.passwordHash))) throw new HttpError(401, "Invalid credentials");
  const token = jwt.sign({ id: String(user._id), role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
}));

router.use(requireAuth);


router.get("/schemes", asyncHandler(async (req, res) => {
  const schemes = await Scheme.find()
    .sort({ updatedAt: -1 })
    .lean();

  const rows = await Promise.all(
    schemes.map(async (scheme) => {
      const latestVersion = await SchemeVersion.findOne({
        schemeId: scheme._id
      })
        .sort({ version: -1 })
        .populate("createdById", "name role")
        .lean();

      return {
        ...scheme,
        latestVersion
      };
    })
  );

  res.json({ schemes: rows });
}));


router.post("/schemes", allowRoles("STATE_REVIEWER"), asyncHandler(async (req, res) => {
  const body = z.object({ schemeCode: z.string().min(2), name: z.string().min(2), data: z.record(z.string(), z.any()) }).safeParse(req.body);
  if (!body.success) throw new HttpError(400, "schemeCode, name and data are required");
  res.status(201).json(await service.createSchemeDraft(req.user, body.data));
}));

router.post("/schemes/:schemeId/drafts", allowRoles("STATE_REVIEWER"), asyncHandler(async (req, res) => {
  const body = z.object({ data: z.record(z.string(), z.any()) }).safeParse(req.body);
  if (!body.success) throw new HttpError(400, "data object is required");
  res.status(201).json(await service.createNewDraft(req.user, req.params.schemeId, body.data));
}));

router.patch("/versions/:versionId", allowRoles("STATE_REVIEWER"), asyncHandler(async (req, res) => {
  const body = z.object({ data: z.record(z.string(), z.any()) }).safeParse(req.body);
  if (!body.success) throw new HttpError(400, "data object is required");
  res.json(await service.updateDraft(req.user, req.params.versionId, body.data));
}));

router.post("/versions/:versionId/submit", allowRoles("STATE_REVIEWER"), asyncHandler(async (req, res) => {
  res.json(await service.submitForReview(req.user, req.params.versionId));
}));

router.post("/versions/:versionId/review", allowRoles("CENTRAL_REVIEWER"), asyncHandler(async (req, res) => {
  const body = z.object({ decision: z.enum(["APPROVE", "RETURN"]), comment: z.string().optional() }).safeParse(req.body);
  if (!body.success) throw new HttpError(400, "decision must be APPROVE or RETURN");
  res.json(await service.reviewVersion(req.user, req.params.versionId, body.data.decision, body.data.comment));
}));

router.get("/schemes/:schemeId/published", asyncHandler(async (req, res) => {
  res.json(await service.getPublishedScheme(req.params.schemeId));
}));

router.get("/schemes/:schemeId/versions", asyncHandler(async (req, res) => {
  if (!await Scheme.exists({ _id: req.params.schemeId })) throw new HttpError(404, "Scheme not found");
  const versions = await SchemeVersion.find({ schemeId: req.params.schemeId })
    .sort({ version: -1 })
    .populate("createdById", "name role")
    .populate("reviewedById", "name role");
  res.json(versions);
}));

router.get("/versions/:versionId/changes", asyncHandler(async (req, res) => {
  res.json(await FieldChange.find({ versionId: req.params.versionId }).sort({ changedAt: 1 }));
}));

router.post("/schemes/:schemeId/rules/:ruleId", allowRoles("CENTRAL_REVIEWER"), asyncHandler(async (req, res) => {
  res.status(201).json(await service.linkRule(req.params.schemeId, req.params.ruleId));
}));

router.patch("/rules/:ruleId", allowRoles("CENTRAL_REVIEWER"), asyncHandler(async (req, res) => {
  const body = z.object({ description: z.string().min(2), expression: z.any() }).safeParse(req.body);
  if (!body.success) throw new HttpError(400, "description and expression are required");
  res.json(await service.updateSharedRule(req.user, req.params.ruleId, body.data.description, body.data.expression));
}));
