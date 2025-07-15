const db = require('../db/db');
const timeUtil = require('../utils/timeFormat');

exports.getDashboardInfo = async (req, res) => {
  try {
    const kstDateString = timeUtil.kstDateString();

    let query = `SELECT SUM(unique_visitors_count) total_unique_visitors, SUM(today_total_page_view) total_page_view FROM visitors`;
    let query2 = `SELECT unique_visitors_count, today_total_page_view FROM visitors WHERE visit_date = ?`;
    let query3 = `SELECT COUNT(id) cnt FROM posts WHERE deleted_at = 0`;
    let query4 = `
    SELECT c.id id, c.post_id post_id, c.author author, c.content content, c.created_at created_at, p.slug slug 
    FROM comments c 
    LEFT JOIN posts p ON c.post_id = p.id 
    WHERE c.author != 'idea de mis dedos' 
    AND c.deleted_at = 0 
    ORDER BY c.id DESC 
    LIMIT 7`;
    const [totalRow, todayRow, totalPostCnt, recentComments] = await Promise.all([
      // 총 방문자 수 및 총 페이지 뷰
      db.getAsync(query),
      // 당일 방문자 수 및 당일 페이지 뷰
      db.getAsync(query2, [kstDateString]),
      // 총 게시글 수
      db.getAsync(query3),
      // 최근 댓글
      db.allAsync(query4)
      // 접근 목록
      // db.allAsync(query5)
    ]);
    const modifiedCommentList = recentComments.map(cmt => ({ ...cmt, created_at: timeUtil.timeFormattingDetail(cmt.created_at) }))
    let resData = {
      totalVisitors: totalRow ? totalRow.total_unique_visitors || 0 : 0,
      totalPageViews: totalRow ? totalRow.total_page_view || 0 : 0,
      todayVisitors: todayRow ? todayRow.unique_visitors_count || 0 : 0,
      todayPageViews: todayRow ? todayRow.today_total_page_view || 0 : 0,
      totalPosts: totalPostCnt ? totalPostCnt.cnt || 0 : 0,
      recentComments: modifiedCommentList ? modifiedCommentList || [] : []
    };

    try {
      const postsGraphRes = await fetch('http://localhost:7304/top_posts_graph');
      const topPostData = await postsGraphRes.json();
      const topPostList = JSON.parse(topPostData.top_post_list);
      const visitorsGraphRes = await fetch('http://localhost:7304/visitors_graph');
      const visitorData = await visitorsGraphRes.json();
      const funnelsRes = await fetch('http://localhost:7304/funnels_data');
      const FunnelsData = await funnelsRes.json();
      const top10Country = JSON.parse(FunnelsData.top_10_country);
      const top10City = JSON.parse(FunnelsData.top_10_city);
      const funnels100 = JSON.parse(FunnelsData.funnels_100);
      const funnelsData = {top10City, top10Country, funnels100};
      resData = { ...resData, topPostGraph: topPostData.graph_data, topPostList, visitorGraph: visitorData.graph_data, funnelsGraph: FunnelsData.graph_data, funnelsData };
      return res.status(200).json({ success: true, msg: '대시보드 데이터 불러오기 성공', data: resData });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: 'Server error: Failed to connect flask server', error: err.message });
    }

  } catch (err) {
    console.error('대시보드 데이터 불러오기 실패:', err.message);
    // 에러 발생 시 클라이언트에 적절한 500 응답 전송
    return res.status(500).json({ success: false, msg: 'Server error: Failed to load dashboard data.', error: err.message });
  }

}
