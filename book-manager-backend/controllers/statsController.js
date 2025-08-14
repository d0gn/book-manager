const UserBooks = require('../models/User-Books');

async function getProfileStats(req, res) {
  try {
    const result = await UserBooks.getStats(req.user.id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류"
    });
  }
}

module.exports = { getProfileStats };
