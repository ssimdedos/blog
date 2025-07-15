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
    recentComments: [],
    funnelsGraph: null,
    funnelsData: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const postGraphContainerRef = useRef(null); // Plotly 그래프가 그려질 div를 참조
  const visitorGraphContainerRef = useRef(null);
  const funnelsGraphContainerRef = useRef(null);
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
            visitorGraph,
            recentComments,
            funnelsGraph,
            funnelsData
          } = res.data;

          let parsedTopPostList = [];
          let parsedFunnels100 = [];
          if (topPostList && topPostList.id && Object.keys(topPostList.id).length > 0) {
            parsedTopPostList = Object.keys(topPostList.id).map(key => ({
              id: topPostList.id[key],
              title: topPostList.title[key],
              view_count: topPostList.view_count[key],
            }));
          }
          if (funnelsData.funnels100 && funnelsData.funnels100.id && Object.keys(funnelsData.funnels100.id).length > 0) {
            parsedFunnels100 = Object.keys(funnelsData.funnels100.id).map(key => ({
              id: funnelsData.funnels100.id[key],
              ip_address: funnelsData.funnels100.ip_address[key],
              funnels: funnelsData.funnels100.funnels[key],
              created_at: funnelsData.funnels100.created_at[key],
              country: funnelsData.funnels100.country[key],
              city: funnelsData.funnels100.city[key],
            }))
          }
          // console.log(visitorGraph);
          const parsedPostGraph = JSON.parse(topPostGraph);
          const parsedVisitorGraph = JSON.parse(visitorGraph);
          const parsedFunnelsGraph = JSON.parse(funnelsGraph);
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
            recentComments,
            funnelsGraph: parsedFunnelsGraph,
            funnelsData: { ...funnelsData, funnels100: parsedFunnels100 }
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
      // Plotly.js가 로드될 때까지 기다리는 로직
      const renderPlotly = () => {
        if (window.Plotly) { // window.Plotly 객체가 사용 가능한지 확인
          // 컨테이너를 비우고, Plotly가 그래프를 그릴 div만 남깁니다.
          const postPlotDivId = 'top-posts-plotly-chart'; // 고정 ID를 사용하거나, Flask에서 div ID도 JSON으로 넘겨받을 수 있음
          const visitorPlotDivId = 'visitor-plotly-chart'
          const funnelsPlotDivId = 'funnels-plotly-chart'
          postGraphContainerRef.current.innerHTML = `<div id="${postPlotDivId}" class="plotly-graph-div" style="height:100%; width:100%;"></div>`;
          visitorGraphContainerRef.current.innerHTML = `<div id="${visitorPlotDivId}" class="plotly-graph-div" style="height:100%; width:100%;"></div>`;
          funnelsGraphContainerRef.current.innerHTML = `<div id="${funnelsPlotDivId}" class="plotly-graph-div" style="height:100%; width:100%;"></div>`;
          try {
            // Plotly 그래프를 명시적으로 그립니다.
            // dashboardData.topPostGraph.data와 dashboardData.topPostGraph.layout을 사용
            window.Plotly.newPlot(postPlotDivId, dashboardData.topPostGraph.data, dashboardData.topPostGraph.layout);
            window.Plotly.newPlot(visitorPlotDivId, dashboardData.visitorGraph.data, dashboardData.visitorGraph.layout);
            window.Plotly.newPlot(funnelsPlotDivId, dashboardData.funnelsGraph.data, dashboardData.funnelsGraph.layout);
            // console.log('Plotly 그래프가 성공적으로 렌더링되었습니다. ID:', postPlotDivId);
          } catch (plotError) {
            console.error('Plotly.newPlot 실행 오류:', plotError);
            postGraphContainerRef.current.innerHTML = '<p>그래프를 그리는 데 실패했습니다.</p>';
            visitorGraphContainerRef.current.innerHTML = '<p>그래프를 그리는 데 실패했습니다.</p>';
            funnelsGraphContainerRef.current.innerHTML = '<p>그래프를 그리는 데 실패했습니다.</p>';
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

  const onCommentClick = (postId, slug) => {
    window.open(`${process.env.REACT_APP_HOMEPAGE}/pages/${postId}/${slug}`, '_blank');
  }

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
              <table className="top-posts-table dashboard-table">
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
                      <td data-label="ID">{post.id}</td>
                      <td data-label="제목">{post.title}</td>
                      <td data-label="조회수">{post.view_count.toLocaleString()}</td>
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
          <ul className='recent-comment-list'>
            {dashboardData.recentComments.length > 0 ? (
              <table className="recent-comment-table dashboard-table">
                <thead>
                  <tr>
                    <th>작성자</th>
                    <th>내용</th>
                    <th>등록 날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentComments.map((cmt) => (
                    <tr onClick={() => { onCommentClick(cmt.post_id, cmt.slug) }} >
                      <td data-label="작성자">{cmt.author}</td>
                      <td data-label="내용">{cmt.content}</td>
                      <td data-label="등록 날짜">{cmt.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>최근 작성된 댓글이 없습니다.</p>
            )}
          </ul>
        </div>
        <div className="dashboard-section chart-section order-5 access-list-container">
          <h2>국가 • 도시별 유입 비율</h2>
          <div className="placeholder-chart">
            <ul>
              {dashboardData.topPostGraph ? (
                <div
                  className="plotly-chart-container"
                  ref={funnelsGraphContainerRef}
                >
                </div>
              ) : (
                <p>그래프 데이터를 불러오는 중...</p>
              )}
            </ul>
          </div>
          <ul className='recent-comment-list'>
            {dashboardData.funnelsData ? (
              <table className="recent-comment-table dashboard-table">
                <thead>
                  <tr>
                    <th>나라</th>
                    <th>접근 건수</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(dashboardData.funnelsData.top10Country).map((key) => (
                    <tr>
                      <td>{key}</td>
                      <td>{dashboardData.funnelsData.top10Country[key]}</td>
                    </tr>
                  ))}
                </tbody>
                <thead>
                  <tr>
                    <th>도시</th>
                    <th>접근 건수</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(dashboardData.funnelsData.top10City).map((key) => (
                    <tr>
                      <td>{key}</td>
                      <td>{dashboardData.funnelsData.top10City[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>최근 유입이 없습니다.</p>
            )}
          </ul>
        </div>
        <div className="order-5"></div>
      </div>
        <div className="">
          <h2>최근 접근 목록 100</h2>
          {dashboardData.funnelsData ? (
            <div className='access-list-container' >
              {
                <table className="recent-comment-table dashboard-table access-list-table">
                  <thead>
                    <tr>
                      <th>IP 주소</th>
                      <th>유입 경로</th>
                      <th>접근 시각</th>
                      <th>접근 국가</th>
                      <th>접근 도시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.funnelsData.funnels100.map((funnel) => (
                      <tr>
                        <td data-label="IP" >{funnel.ip_address}</td>
                        <td data-label="유입" className='td-funnels'>{funnel.funnels}</td>
                        <td data-label="시각">{funnel.created_at}</td>
                        <td data-label="국가">{funnel.country}</td>
                        <td data-label="도시">{funnel.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
          ) : (
            <p>여기에 유입 경로 통계가 표시됩니다.</p>
          )}
        </div>
    </div>

  );
};

export default Main;