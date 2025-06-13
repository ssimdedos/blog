// src/pages/admin/Main.js
import React, { useEffect, useState } from 'react';
import './Main.css'; // CSS 파일을 임포트하여 스타일 적용 (아래에 CSS 코드도 제공)
import { fetchDashboardData } from '../api/dashboard';

const Main = () => {
  // 실제 데이터는 백엔드 API를 통해 가져와야 합니다.
  // 여기서는 더미 데이터를 사용합니다.
  const [dashboardData, setDashboardData] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    totalPageViews: 0,
    todayPageViews: 0,
    totalPosts: 0,
    topPosts: [],
    dailyVisitorsTrend: [ // 최근 7일 방문자 수 (더미 데이터)
      // { date: '06/07', count: 200 },
    ],
  });

  useEffect(() => {
    const getDashboard = async () => {
      const res = await fetchDashboardData();
      if (res.success) {
        // console.log(res);
        const { totalVisitors, todayVisitors, totalPageViews, todayPageViews, totalPosts } = res.data;
        setDashboardData({...dashboardData, totalVisitors, todayVisitors, totalPageViews, todayPageViews, totalPosts});
      }
    }
    getDashboard();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">대시보드</h1>
      <p className="dashboard-subtitle">블로그의 현재 상태를 한눈에 확인하세요.</p>

      {/* 주요 지표 카드 섹션 */}
      <div className="stats-cards">
        <div className="stat-card">
          <h3>총 방문자</h3>
          <p className="stat-value">{dashboardData.totalVisitors.toLocaleString()} 명</p>
        </div>
        <div className="stat-card">
          <h3>오늘 방문자</h3>
          <p className="stat-value">{dashboardData.todayVisitors.toLocaleString()} 명</p>
        </div>
        <div className="stat-card">
          <h3>총 게시글 조회수</h3>
          <p className="stat-value">{dashboardData.totalPageViews.toLocaleString()} 회</p>
        </div>
        <div className="stat-card">
          <h3>오늘 게시글 조회수</h3>
          <p className="stat-value">{dashboardData.todayPageViews.toLocaleString()} 회</p>
        </div>
        <div className="stat-card">
          <h3>총 게시글 수</h3>
          <p className="stat-value">{dashboardData.totalPosts.toLocaleString()} 개</p>
        </div>
      </div>

      {/* 상세 통계 섹션 */}
      <div className="dashboard-sections">
        <div className="dashboard-section chart-section">
          <h2>일일 방문자 추이</h2>
          {/* 실제로는 Recharts나 Chart.js 같은 라이브러리를 사용하여 차트를 그립니다. */}
          <div className="placeholder-chart">
            <p>최근 7일 방문자 수 (예시)</p>
            <ul>
              {dashboardData.dailyVisitorsTrend.map((item, index) => (
                <li key={index}>{item.date}: {item.count}명</li>
              ))}
            </ul>
            <p className="chart-note">*(차트 라이브러리 사용 시 더 시각적으로 표현 가능)*</p>
          </div>
        </div>

        <div className="dashboard-section top-posts-section">
          <h2>인기 게시글 (Top 5)</h2>
          <ul className="top-posts-list">
            {dashboardData.topPosts.map((post) => (
              <li key={post.id}>
                <span>{post.title}</span>
                <span className="post-views">{post.views.toLocaleString()} 회</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 추가 통계 섹션 (필요시 확장) */}
      {/* <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>최근 댓글</h2>
          <p>여기에 최근 댓글 목록이 표시됩니다.</p>
        </div>
        <div className="dashboard-section">
          <h2>유입 경로</h2>
          <p>여기에 유입 경로 통계가 표시됩니다.</p>
        </div>
      </div> */}
    </div>
  );
};

export default Main;