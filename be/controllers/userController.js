const bcrypt = require('bcryptjs');
const db = require('../db/db');
const timeUtil = require('../utils/timeFormat');

exports.userIncrement = async (req, res) => {
  // 유입 경로 및 IP 주소는 분석을 위한 데이터로 수집합니다.
  const funnels = req.headers.referer || 'direct_access';
  const ipAddr = req.ip;
  try {
    console.log('유입경로:', funnels);
    console.log('접속IP:', ipAddr);
    await db.runAsync(
      `INSERT INTO clients_info (ip_address, funnels) VALUES (?, ?)`,
      ipAddr, funnels
    );
    console.log(`사용자 정보 등록 완료: IP=${ipAddr}, Funnel=${funnels}`);

    // 'YYYY-MM-DD' 형식 (visitors 테이블의 visit_date에 저장될 값)
    const kstDateString = timeUtil.kstDateString();
    // 'YYYY-MM-DD HH:MM:SS' 형식 (visitors 테이블의 updated_at에 저장될 값)
    const kstDateTimeString = timeUtil.kstDateTimeString();

    const visitorUpdateSql = `
            INSERT INTO visitors (visit_date, unique_visitors_count, created_at, updated_at)
            VALUES (?, 1, ?, ?)
            ON CONFLICT(visit_date) DO UPDATE SET
                unique_visitors_count = unique_visitors_count + 1,
                updated_at = ?
        `;

    const visitorResult = await db.runAsync(
      visitorUpdateSql,
      kstDateString, kstDateTimeString, kstDateTimeString, kstDateTimeString
    );

    if (visitorResult.changes > 0) {
      // 모든 작업이 성공적으로 완료되면 클라이언트에 200 응답 전송
      return res.status(200).json({ success: true, msg: '방문자수 증가 완료' });
    } else {
      // 이 경우는 거의 없겠지만, 만약을 대비 (예: DB에 변경사항이 없다고 보고된 경우)
      console.warn('방문자 수 관련 행이 하나도 변경되지 않음 (이미 최신 상태이거나 매우 빠른 중복 요청)');
      return res.status(200).json({ success: true, msg: 'Visitor count update acknowledged, but no changes reported.' });
    }

  } catch (err) {
    console.error('사용자 증가 및 유입 경로 기록 실패:', err.message);
    return res.status(500).json({ success: false, msg: 'Server error: Failed to record user visit.' });
  }
};

exports.authAdmin = async (req, res) => {
  // console.log(req.body);
  const { password } = req.body;
  const row = await db.getAsync(`SELECT password FROM admin`);
  const isMatch = await bcrypt.compare(password, row.password);
  // console.log(isMatch);
  if (isMatch) {
    res.status(200).json({ success: true, msg: '비밀번호 확인 완료.' });
  } else {
    res.status(200).json({ success: false, msg: '비밀번호가 틀렸습니다.' });
  }
}