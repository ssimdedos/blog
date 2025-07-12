// src/pages/admin/Main.js
import React, { useEffect, useRef, useState } from 'react';
import './Main.css'; // CSS 파일을 임포트하여 스타일 적용 (아래에 CSS 코드도 제공)
import { fetchDashboardData } from '../api/dashboard';

const Main = () => {
  const [dashboardData, setDashboardData] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    totalPageViews: 0,
    todayPageViews: 0,
    totalPosts: 0,
    topPostList: [],
    topPostGraph: null,
    visitorGraph: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const postGraphContainerRef = useRef(null); // Plotly 그래프가 그려질 div를 참조
  const visitorGraphContainerRef = useRef(null); // Plotly 그래프가 그려질 div를 참조

  useEffect(() => {
    const getDashboard = async () => {
      try {
        const res = await fetchDashboardData();
        if (res.success) {
          const {
            totalVisitors,
            todayVisitors,
            totalPageViews,
            todayPageViews,
            totalPosts,
            topPostList,
            topPostGraph,
            visitorGraph
          } = res.data;

          let parsedTopPostList = [];
          if (topPostList && topPostList.id && Object.keys(topPostList.id).length > 0) {
            parsedTopPostList = Object.keys(topPostList.id).map(key => ({
              id: topPostList.id[key],
              title: topPostList.title[key],
              view_count: topPostList.view_count[key],
            }));
          }
          // console.log(visitorGraph);
          const parsedPostGraph = JSON.parse(topPostGraph);
          const parsedVisitorGraph = JSON.parse(visitorGraph);
          // console.log(parsedVisitorGraph);
          setDashboardData({
            totalVisitors,
            todayVisitors,
            totalPageViews,
            todayPageViews,
            totalPosts,
            topPostList: parsedTopPostList,
            topPostGraph: parsedPostGraph, // 파싱된 그래프 JSON 데이터 저장
            visitorGraph: parsedVisitorGraph,
          });
        } else {
          setError(res.msg || '대시보드 데이터 불러오기 실패');
        }
      } catch (error) {
        console.error("fetchDashboardData 호출 중 오류 발생:", error);
        setError('서버와 통신 중 오류 발생: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    getDashboard();
  }, []);

  // Plotly 그래프를 렌더링하는 useEffect
  useEffect(() => {
    // 로딩 중이 아니고, 그래프 데이터가 있고, ref가 현재 DOM 요소를 가리킬 때만 실행
    if (!loading && dashboardData.topPostGraph && postGraphContainerRef.current) {
      console.log('Plotly 렌더링 useEffect 실행됨!');
      console.log('Graph Data (parsed from Flask):', dashboardData.topPostGraph);

      // Plotly.js가 로드될 때까지 기다리는 로직
      const renderPlotly = () => {
        if (window.Plotly) { // window.Plotly 객체가 사용 가능한지 확인
          // 컨테이너를 비우고, Plotly가 그래프를 그릴 div만 남깁니다.
          const postPlotDivId = 'top-posts-plotly-chart'; // 고정 ID를 사용하거나, Flask에서 div ID도 JSON으로 넘겨받을 수 있음
          const visitorPlotDivId = 'visitor-plotly-chart'
          postGraphContainerRef.current.innerHTML = `<div id="${postPlotDivId}" class="plotly-graph-div" style="height:100%; width:100%;"></div>`;
          visitorGraphContainerRef.current.innerHTML = `<div id="${visitorPlotDivId}" class="plotly-graph-div" style="height:100%; width:100%;"></div>`;
          try {
            // Plotly 그래프를 명시적으로 그립니다.
            // dashboardData.topPostGraph.data와 dashboardData.topPostGraph.layout을 사용
            window.Plotly.newPlot(postPlotDivId, dashboardData.topPostGraph.data, dashboardData.topPostGraph.layout);
            window.Plotly.newPlot(visitorPlotDivId, dashboardData.visitorGraph.data, dashboardData.visitorGraph.layout);
            console.log('Plotly 그래프가 성공적으로 렌더링되었습니다. ID:', postPlotDivId);
          } catch (plotError) {
            console.error('Plotly.newPlot 실행 오류:', plotError);
            postGraphContainerRef.current.innerHTML = '<p>그래프를 그리는 데 실패했습니다.</p>';
            visitorGraphContainerRef.current.innerHTML = '<p>그래프를 그리는 데 실패했습니다.</p>';
          }
        } else {
          console.warn('Plotly.js가 아직 로드되지 않았습니다. 50ms 후 재시도...');
          setTimeout(renderPlotly, 50); // 50ms 후에 다시 시도
        }
      };

      renderPlotly(); // Plotly 렌더링 시작

    } else if (!loading && !dashboardData.topPostGraph && !error) {
      // 데이터 로드는 완료됐는데 topPostGraph 없는 경우 (예: Flask에서 데이터가 없다고 보냈을 때)
      postGraphContainerRef.current.innerHTML = '<p>그래프 데이터를 불러오지 못했거나 데이터가 없습니다.</p>';
      visitorGraphContainerRef.current.innerHTML = '<p>그래프 데이터를 불러오지 못했거나 데이터가 없습니다.</p>';
    }
  }, [dashboardData.topPostGraph, dashboardData.visitorGraph, loading]);

  if (loading) {
    return <div className="admin-dashboard"><p>대시보드 데이터를 불러오는 중...</p></div>;
  }
  if (error) {
    return <div className="admin-dashboard"><p>오류: {error}</p></div>;
  }

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
        <div className="dashboard-section chart-section order-1">
          <h2>일일 방문자 추이</h2>
          <div className="placeholder-chart">
            <ul>
              {dashboardData.visitorGraph ? (
                <div
                  className="plotly-chart-container"
                  ref={visitorGraphContainerRef}
                >
                </div>
              ) : (
                <p>그래프 데이터를 불러오는 중...</p>
              )}
            </ul>
          </div>
        </div>
        <div className="dashboard-section chart-section order-2">
          <h2>인기 게시글 (Top 5)</h2>
          <div className="placeholder-chart">
            <ul>
              {dashboardData.topPostGraph ? (
                <div
                  className="plotly-chart-container"
                  ref={postGraphContainerRef}
                >
                </div>
              ) : (
                <p>그래프 데이터를 불러오는 중...</p>
              )}
            </ul>
          </div>
        </div>
        <div className="dashboard-section top-posts-section order-4">
          <ul className="top-posts-list">
            {dashboardData.topPostList.length > 0 ? (
              <table className="top-posts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>제목</th>
                    <th>조회수</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.topPostList.map((post) => (
                    <tr key={post.id}>
                      <td>{post.id}</td>
                      <td>{post.title}</td>
                      <td>{post.view_count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>인기 게시글 목록을 불러오는 중이거나 데이터가 없습니다.</p>
            )}
          </ul>
        </div>
        <div className="dashboard-section order-3">
          <h2>최근 댓글</h2>
          <p>여기에 최근 댓글 목록이 표시됩니다.</p>
        </div>
        <div className="dashboard-section order-5">
          <h2>접근 목록</h2>
          <p>여기에 유입 경로 통계가 표시됩니다.</p>
        </div>
      </div>
    </div>

  );
};

export default Main;