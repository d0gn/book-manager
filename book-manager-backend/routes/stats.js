const express = require("express");
const router = express.Router();
const { getProfileStats } = require("../controllers/statsController");
const { authenticateToken } = require('../middlewares/auth');


// /stats GET → 통계 데이터 반환
router.get("/", authenticateToken, getProfileStats);

module.exports = router;
