import { Schema, model, models } from "mongoose";

const AICacheSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    endpoint: { type: String, required: true }, // 'summary', 'insights', 'budget', 'monthly-summary'
    cacheKey: { type: String, required: true, unique: true }, // userId_endpoint_statsHash
    response: { type: String, required: true },
    statsHash: { type: String, required: true }, // Hash of stats to detect changes
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// Auto-delete expired entries (MongoDB TTL index)
AICacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.AICache || model("AICache", AICacheSchema);