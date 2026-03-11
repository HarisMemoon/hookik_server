import ActionLog from "../models/ActionLog.js";

export const logAction = async (
  adminId,
  action,
  targetType,
  targetId,
  details = {},
) => {
  try {
    await ActionLog.create({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  } catch (err) {
    console.error("Logging failed:", err);
    // We don't throw error here so the main process (like creating user) doesn't stop
  }
};
