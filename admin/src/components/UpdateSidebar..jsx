import { useEffect, useState } from "react";
import { fetchCategory, fetchSubcategory } from "../api/category";
import './WriteSidebar.css';

const UpdateSidebarComp = ({ clickPostbtn, sidebarInputs }) => {
  const [loading, setLoding] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isPublished, setIsPublished] = useState(1);
  const [isPinned, setIsPinned] = useState(0);
  const [tags, setTags] = useState('');

  const CategoryHandler = (e) => {
    const newSelectedCategory = e.target.value;
    setSelectedCategory(parseInt(newSelectedCategory));
    fetchSubcategory(newSelectedCategory).then(data => {
      const subcategoriesData = data.data1 || data;
      setSubCategoryList(subcategoriesData);
      setSelectedSubcategory(0);
    });
  };

  const SubcategoryHandler = (e) => {
    setSelectedSubcategory(parseInt(e.target.value));
  };

  // 사이드바 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoding(true);
        const categoryRes = await fetchCategory();
        const categoriesData = categoryRes.data1 || categoryRes;
        // console.log(categoriesData);
        setCategoryList(categoriesData);
        if (categoriesData.length > 0) {
          setSelectedCategory(sidebarInputs.categoryId);
          const subcategoryRes = await fetchSubcategory(sidebarInputs.categoryId);
          const subcategoriesData = subcategoryRes.data1 || subcategoryRes;
          setSubCategoryList(subcategoriesData);
          setSelectedSubcategory(sidebarInputs.subcategoryId);
        }
        setIsPublished(sidebarInputs.isPublished);
        setTags(sidebarInputs.tags);
        setIsPinned(sidebarInputs.isPinned);
      } catch (error) {
        console.error("카테고리/서브카테고리 로딩 오류:", error);
      } finally {
        setLoding(false);
      }
    };
    if(sidebarInputs !== undefined) {
      loadData();
    }
  }, []);

  // 게시글 수정
  const createPostHandler = () => {
    try {
      clickPostbtn({
        category: selectedCategory,
        subcategory: selectedSubcategory,
        isPublished: isPublished,
        tags: tags,
        isPinned: isPinned,
      });
    } catch (err) {
      console.error('게시글 수정 에러: ',err);
    }
  };

  if (loading) {
    return <div className="post-management-loading">게시글 정보 로딩 중...</div>;
  }

  return (
    <div>
      <div className="category-list">
        <h3>카테고리 목록</h3>
        <select onChange={CategoryHandler} value={selectedCategory || ''} >
          {categoryList.length === 0 ? (
            <option value="">로딩 중...</option>
          ) : (
            categoryList.map((v) => (
              <option key={'cate_' + v.id} value={v.id} >{v.name}</option>
            ))
          )}
        </select>
      </div>
      <div className="sub-category-list">
        <h3>부 카테고리 목록</h3>
        <select onChange={SubcategoryHandler} value={selectedSubcategory || 0} >
          {subCategoryList.length === 0 ? (
            <option value={0}>없음</option>
          ) : (
            <>
              <option value={0}>없음</option>
              {subCategoryList.map((v) => (<option key={'subcate_' + v.id} value={v.id} >{v.name}</option>))}
            </>
          )}
        </select>
      </div>
      <div className="is-published">
        <h3>공개 설정</h3>
        <li>
          <label>공개
            <input
              type="radio"
              name="published"
              checked={isPublished === 1}
              value={1}
              onChange={() => { setIsPublished(1) }}
            />
          </label>
        </li>
        <li>
          <label>비공개
            <input
              type="radio"
              name="published"
              checked={isPublished === 0}
              value={0}
              onChange={() => { setIsPublished(0) }}
            />
          </label>
        </li>
      </div>
      <div className="tags">
        <h3>태그 편집</h3>
        <textarea 
          className="tag-box" 
          placeholder="태그를 입력하세요 예시: 여행, 콘텐츠, 시" 
          value={tags} onChange={(e) => { setTags(e.target.value) }} />
      </div>
      {/* 추후 개발 */}
      <div className="book-to-publish" style={{ display: "none" }}>
        <h3>발행 시간</h3>
        <li>현재<input type="radio" name="publish-time" defaultChecked /></li>
        <li>예약<input type="radio" name="publish-time" /></li>
      </div>
      <label><h3>공지사항으로 등록 <input type="checkbox" value={isPinned} onChange={() => { setIsPinned(!isPinned) }} defaultChecked={isPinned} /></h3></label>
      <div className="post-btn" onClick={createPostHandler} >
        <h4>수정</h4>
      </div>
    </div>
  );
};

export default UpdateSidebarComp;