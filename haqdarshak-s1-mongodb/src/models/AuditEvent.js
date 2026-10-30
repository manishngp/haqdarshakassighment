import mongoose from "mongoose";

const auditEventSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

auditEventSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
export default mongoose.model("AuditEvent", auditEventSchema);
