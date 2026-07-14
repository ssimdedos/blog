require('dotenv').config();
const jwt = require('jsonwebtoken');

// 자동화 스크립트는 X-API-KEY 헤더, 관리자 웹 UI는 로그인 시 발급된 JWT(Authorization: Bearer) 중
// 하나만 유효하면 통과시킨다.
module.exports = function requireAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.AUTOMATION_API_KEY) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch (err) {
      // 검증 실패 시 아래 401로 떨어짐
    }
  }

  return res.status(401).json({ success: false, msg: '인증이 필요합니다.' });
};
