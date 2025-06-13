const db = require('../db/db');
const timeUtil = require('../utils/timeFormat');

exports.getDashboardInfo = async (req, res) => {
  try {
    const kstDateString = timeUtil.kstDateString();
    
    let query = `SELECT SUM(unique_visitors_count) total_unique_visitors, SUM(today_total_page_view) total_page_view FROM visitors`;
    let query2 = `SELECT unique_visitors_count, today_total_page_view FROM visitors WHERE visit_date = ?`;
    let query3 = `SELECT COUNT(id) cnt FROM posts`;
    let query4 = `SELECT visit_date, unique_visitors_count FROM visitors 
                  WHERE visit_date >= STRFTIME('%Y-%m-%d', DATE('now', '-7 days', 'localtime'))
                  AND visit_date <= STRFTIME('%Y-%m-%d', 'now', 'localtime')
                ORDER BY visit_date ASC`;

    const [totalRow, todayRow, totalPostCnt, dailyVisitorsTrend] = await Promise.all([
      // 총 방문자 수 및 총 페이지 뷰
      db.getAsync(query),
      // 당일 방문자 수 및 당일 페이지 뷰
      db.getAsync(query2, [kstDateString]),
      // 총 게시글 수
      db.getAsync(query3),
      // 일일 방문자 추이 (예: 최근 7일)
      db.allAsync(query4)
    ]);
    
    const resData = {
      totalVisitors: totalRow ? totalRow.total_unique_visitors || 0 : 0,
      totalPageViews: totalRow ? totalRow.total_page_view || 0 : 0,
      todayVisitors: todayRow ? todayRow.unique_visitors_count || 0 : 0,
      todayPageViews: todayRow ? todayRow.today_total_page_view || 0 : 0,
      totalPosts: totalPostCnt ? totalPostCnt.cnt || 0 : 0,
      dailyVisitorsTrend: dailyVisitorsTrend || [], // 일일 방문자 추이 추가
    };

    // console.log('Dashboard Data:', resData);
    res.status(200).json({ success: true, msg: '대시보드 데이터 불러오기 성공', data: resData });

  } catch (err) {
    console.error('대시보드 데이터 불러오기 실패:', err.message);
    // 에러 발생 시 클라이언트에 적절한 500 응답 전송
    res.status(500).json({ success: false, msg: 'Server error: Failed to load dashboard data.', error: err.message });
  }

}