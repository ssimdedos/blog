import { useEffect, useState } from "react";
import { fetchPostsAdmin, updatePost } from "../api/posts";
import { fetchCategory, fetchSubcategory } from "../api/category";
import './PostsEdit.css';
import Pagenation from "../components/Pagenation";
import { useNavigate } from "react-router-dom";


const PostsEdit = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [authors, setAuthors] = useState([]); // 작성자 목록
  const [pageNum, setPageNum] = useState(1);
  const [postCtn, setPostCtn] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: 'all', // 'all'은 모든 카테고리
    subcategoryId: 'all', // 'all'은 모든 카테고리
    author: 'all',     // 'all'은 모든 작성자
    isPublished: 'all', // 'all', '1' (공개), '0' (비공개)
    page: 1,
    limit: 10,
  });

  const navigate = useNavigate();

  const loadPosts = async () => { // async/await 패턴으로 변경 (Promise 체인과 혼용 방지)
    setLoading(true);
    try {
      const res = await fetchPostsAdmin(filters); // await 추가
      // fetchPostsAdmin 응답이 { data: [...] } 형태라면 res.data 사용
      const postData = res.posts;
      setPosts(postData);
      setTotalPages(res.totalPages);
      setPostCtn(res.totalPosts);
      const uniqueAuthors = [...new Set(postData.map(post => post.author))];
      setAuthors(['all', ...uniqueAuthors]);
    } catch (error) {
      console.error("Error loading posts:", error);
      // 에러 처리: setPosts([]); 또는 setError('...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 모든 fetch 호출에 await를 사용하고, Promise.all로 병렬 처리
    const loadInitialData = async () => {
      setLoading(true); // 모든 초기 데이터 로딩 중으로 설정
      try {
        const [postsRes, subcategoryRes, categoryRes] = await Promise.all([
          fetchPostsAdmin(filters),
          fetchSubcategory('all'),
          fetchCategory(),
        ]);

        const postData = postsRes.posts;
        setPosts(postData);
        const uniqueAuthors = [...new Set(postData.map(post => post.author))];
        setAuthors(['all', ...uniqueAuthors]);

        const subcategoryData = subcategoryRes.data1 ? subcategoryRes.data1 : subcategoryRes;
        setSubcategories(subcategoryData); // fetchSubcategory 응답 구조에 맞게 조정

        const categoryData = categoryRes;
        setCategories(categoryData); // fetchCategory 응답 구조에 맞게 조정

      } catch (error) {
        console.error("Error loading initial data:", error);
        // 오류 처리: setPosts([]); setCategories([]); 등
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    loadPosts(filters);
  }, [filters]);

  useEffect(() => {
    setFilters({
      ...filters,
      page: pageNum
    });
  }, [pageNum]);

  // 필터 입력 변경 핸들러
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // 제목 축약 함수
  const truncateTitle = (title, maxLength) => {
    if (!title || typeof title !== 'string') return '';
    if (title.length > maxLength) {
      return title.substring(0, maxLength) + '...';
    }
    return title;
  };

  // 카테고리 ID를 이름으로 변환하는 헬퍼 함수
  const getCategoryName = (id) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : '알 수 없음';
  };

  // 서브카테고리 ID를 이름으로 변환하는 헬퍼 함수
  const getSubcategoryName = (id, categoryId) => {
    // categoryId가 일치하는 서브카테고리 중 해당 id를 찾음
    const subcategory = subcategories.find(subcat => subcat.id === id && subcat.category_id === categoryId);
    return subcategory ? subcategory.name : (id === 0 ? '없음' : '알 수 없음');
  };

  // 체크박스 핸들러 (is_pinned, is_published)
  const handleCheckboxChange = async (postId, field, isChecked) => {
    // console.log(`게시글 ID ${postId}, ${field} 상태 변경: ${isChecked}`);
    const updateData = {
      [field]: isChecked ? 1 : 0
    };
    const res = await updatePost(postId, updateData);
    alert(res.msg);
    loadPosts(filters);
  };

  // 수정 버튼 클릭
  const editHandler = (e) => {
    const postId = e.target.value;
    navigate(`/update/${postId}`);
  };

  if (loading) {
    return <div className="post-management-loading">게시글 목록 로딩 중...</div>;
  }
  // posts 상태도 배열이어야 하므로 .length > 0으로 확인
  if (!posts || posts.length === 0) { // posts가 null이거나 빈 배열일 때
    return (
      <div className="no-posts-found">
        <span>게시글이 없습니다.</span>
        <button className="action-button reload-btn" onClick={() => window.location.reload()}>새로고침</button>
      </div>);
  }

  return (
    <div className="post-management-container">
      <h1>게시글 관리</h1>

      {/* 필터 섹션 */}
      <div className="filter-section">
        {/* 기간별 필터 */}
        <div className="filter-group">
          <label htmlFor="startDate">시작일:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="endDate">종료일:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>

        {/* 카테고리별 필터 */}
        <div className="filter-group">
          <label htmlFor="categoryId">카테고리:</label>
          <select id="categoryId" name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
            <option value="all">전체</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="subcategoryId">서브카테고리:</label>
          <select id="subcategoryId" name="subcategoryId" value={filters.subcategoryId} onChange={handleFilterChange}>
            <option value="all">전체</option>
            {subcategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* 작성자별 필터 */}
        <div className="filter-group">
          <label htmlFor="author">작성자:</label>
          <select id="author" name="author" value={filters.author} onChange={handleFilterChange}>
            {authors.map(auth => (
              <option key={auth} value={auth}>{auth === 'all' ? '전체' : auth}</option>
            ))}
          </select>
        </div>

        {/* 공개여부별 필터 */}
        <div className="filter-group">
          <label htmlFor="isPublished">공개 여부:</label>
          <select id="isPublished" name="isPublished" value={filters.isPublished} onChange={handleFilterChange}>
            <option value="all">전체</option>
            <option value="1">공개</option>
            <option value="0">비공개</option>
          </select>
        </div>
      </div>

      {/* 게시글 목록 테이블 */}
      <div className="post-table-wrapper">
        <table className="post-management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>공지</th>
              <th>카테고리</th>
              <th>부카테고리</th>
              <th>공개여부</th>
              <th>제목</th>
              <th>작성자</th>
              <th>등록일</th>
              <th>작업</th> {/* 수정/삭제 버튼 등을 위한 열 */}
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={post.is_pinned === 1}
                      onChange={(e) => handleCheckboxChange(post.id, 'is_pinned', e.target.checked)}
                    />
                  </td>
                  <td>{getCategoryName(post.category_id)}</td>
                  <td>{getSubcategoryName(post.sub_category_id, post.category_id)}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={post.is_published === 1}
                      onChange={(e) => handleCheckboxChange(post.id, 'is_published', e.target.checked)}
                    />
                  </td>
                  <td className="post-title-cell">{truncateTitle(post.title, 35)}</td>
                  <td>{post.author}</td>
                  <td>{post.created_at}</td> {/* 이미 포맷된 날짜라고 가정 */}
                  <td>
                    <button className="action-button edit-button" value={post.id} onClick={editHandler} >수정</button>
                    <button className="action-button delete-button" value={post.id} >삭제</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-posts-found">
                  조건에 맞는 게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagenation setPageNum={setPageNum} postCtn={postCtn} totalPages={totalPages} pageNum={pageNum} />
      </div>
    </div>
  )
};

export default PostsEdit;