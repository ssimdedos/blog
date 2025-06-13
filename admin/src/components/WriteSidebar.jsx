import { useEffect, useState } from "react";
import { fetchCategory, fetchSubcategory } from "../api/category";
import './WriteSidebar.css';

const WriteSidebarComp = ({ clickPostbtn }) => {
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [isPublished, setIsPublished] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
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

  useEffect(() => {
    const loadCategoriesAndSubcategories = async () => {
      try {
        const categoryRes = await fetchCategory();
        const categoriesData = categoryRes.data1 || categoryRes;
        setCategoryList(categoriesData);

        if (categoriesData.length > 0) {
          const initialCategoryId = categoriesData[0].id;
          setSelectedCategory(initialCategoryId);

          const subcategoryRes = await fetchSubcategory(initialCategoryId);
          const subcategoriesData = subcategoryRes.data1 || subcategoryRes;
          setSubCategoryList(subcategoriesData);
          setSelectedSubcategory(0);

        }
      } catch (error) {
        console.error("카테고리/서브카테고리 로딩 오류:", error);

      }
    };
    loadCategoriesAndSubcategories();
  }, []);

  useEffect(() => {
    if (selectedCategory !== null && selectedCategory !== undefined) {
      fetchSubcategory(selectedCategory).then(data => {
        const subcategoriesData = data.data1 || data;
        setSubCategoryList(subcategoriesData);
        setSelectedSubcategory(0);
      });
    }
  }, [selectedCategory]);

  const createPostHandler = () => {
    clickPostbtn({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      isPublished: isPublished,
      tags: tags,
      isPinned: isPinned,
    });

    setSelectedCategory(categoryList.length > 0 ? categoryList[0].id : null);
    setSelectedSubcategory(0);
    setIsPublished(true);
    setTags('');
    setIsPinned(false);
  };

  return (
    <div className="sidebar-container" >
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
        <li><label>공개<input type="radio" name="published" defaultChecked={isPublished === true} value={true} onChange={() => { setIsPublished(true) }} /></label></li>
        <li><label>비공개<input type="radio" name="published" defaultChecked={isPublished === false} value={false} onChange={() => { setIsPublished(false) }} /></label></li>
      </div>
      <div className="tags">
        <h3>태그 편집</h3>
        <textarea className="tag-box" placeholder="태그를 입력하세요 예시: 여행, 콘텐츠, 시" value={tags} onChange={(e) => { setTags(e.target.value) }}></textarea>
      </div>
      {/* 추후 개발 */}
      <div className="book-to-publish" style={{ display: "none" }}>
        <h3>발행 시간</h3>
        <li>현재<input type="radio" name="publish-time" defaultChecked /></li>
        <li>예약<input type="radio" name="publish-time" /></li>
      </div>
      <label><h3>공지사항으로 등록 <input type="checkbox" value={isPinned} onChange={() => { setIsPinned(!isPinned) }} defaultChecked={isPinned} /></h3></label>
      <div className="post-btn" onClick={createPostHandler} >
        <h4>등록</h4>
      </div>

    </div>
  );
};

export default WriteSidebarComp;