import { useEffect } from "react";
import './Pagenation.css';

const Pagenation = ({ setPageNum, postCtn, totalPages, pageNum }) => {
  const postsPerPage = 6;
  const pageGroupSize = 5;
  const validTotalPosts = typeof postCtn === 'number' && !isNaN(postCtn) ? postCtn : 0;
  const validPostsPerPage = typeof postsPerPage === 'number' && !isNaN(postsPerPage) && postsPerPage > 0 ? postsPerPage : 10;
  const currentGroup = Math.ceil(pageNum / pageGroupSize);
  const startPage = (currentGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // 이전 그룹으로 이동 가능한지
  const hasPrevGroup = startPage > 1;
  // 다음 그룹으로 이동 가능한지
  const hasNextGroup = endPage < totalPages;

  if (totalPages <= 1) {
    // 게시글이 없거나 페이지가 1개 이하일 경우 페이지네이션을 렌더링하지 않음
    return null;
  }


  return (
    <nav className="pagination-nav">
      <ul className="pagination-list">
        {/* 이전 그룹으로 이동 버튼 */}
        <li className={`pagination-item ${!hasPrevGroup ? 'disabled' : ''}`}>
          <button
            onClick={() => hasPrevGroup && setPageNum(startPage - 1)}
            disabled={!hasPrevGroup}
            className="pagination-button"
            aria-label="이전 그룹으로"
          >
            &laquo;
          </button>
        </li>

        {/* 이전 페이지 버튼 */}
        <li className={`pagination-item ${pageNum === 1 ? 'disabled' : ''}`}>
          <button
            onClick={() => pageNum > 1 && setPageNum(pageNum - 1)}
            disabled={pageNum === 1}
            className="pagination-button"
            aria-label="이전 페이지"
          >
            &lsaquo;
          </button>
        </li>

        {/* 페이지 번호들 */}
        {pageNumbers.map(number => (
          <li key={number} className={`pagination-item ${pageNum === number ? 'active' : ''}`}>
            <button
              onClick={() => setPageNum(number)}
              className="pagination-button"
              aria-current={pageNum === number ? 'page' : undefined}
            >
              {number}
            </button>
          </li>
        ))}

        {/* 다음 페이지 버튼 */}
        <li className={`pagination-item ${pageNum === totalPages ? 'disabled' : ''}`}>
          <button
            onClick={() => pageNum < totalPages && setPageNum(pageNum + 1)}
            disabled={pageNum === totalPages}
            className="pagination-button"
            aria-label="다음 페이지"
          >
            &rsaquo;
          </button>
        </li>

        {/* 다음 그룹으로 이동 버튼 */}
        <li className={`pagination-item ${!hasNextGroup ? 'disabled' : ''}`}>
          <button
            onClick={() => hasNextGroup && setPageNum(endPage + 1)}
            disabled={!hasNextGroup}
            className="pagination-button"
            aria-label="다음 그룹으로"
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  )
};


export default Pagenation;