import ActionLog from "../models/ActionLog.js";
import AdminUser from "../models/AdminUser.js";

export const getActionLogs = async (req, res) => {
  try {
    const logs = await ActionLog.findAll({
      include: [
        {
          model: AdminUser,
          as: "admin", // Ensure this association is in associations.js
          attributes: ["first_name", "last_name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 100, // Safety limit
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
