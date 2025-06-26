import { useEffect, useState } from "react";
import { fetchCategory, fetchSubcategory } from "../api/category";
import "./WriteSidebar.css";

function findUniqueSubstrings(tags, modifiedTags) {
  const tagArr = tags
    ? tags
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
    : [];
  const modiTagArr = modifiedTags
    ? modifiedTags
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
    : [];

  const modiTagSet = new Set(modiTagArr);

  const deletedTags = tagArr.filter((item) => !modiTagSet.has(item));

  return deletedTags;
}

const UpdateSidebarComp = ({ clickPostbtn, sidebarInputs }) => {
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isPublished, setIsPublished] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState("");
  const [modifiedTags, setModifiedTags] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const CategoryHandler = (e) => {
    const newSelectedCategory = parseInt(e.target.value);
    setSelectedCategory(newSelectedCategory);
    fetchSubcategory(newSelectedCategory).then((data) => {
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
      if (!sidebarInputs || sidebarInputs.categoryId === null) {
        // 데이터가 아직 없으면 기다리거나 초기 상태로 유지
        setIsLoading(true); // 데이터가 준비되지 않았다면 로딩 상태를 유지
        return;
      }
      setIsLoading(true);
      try {
        const categoryRes = await fetchCategory();
        const categoriesData = categoryRes.data1 || categoryRes;
        // console.log(categoriesData);
        setCategoryList(categoriesData);
        if (categoriesData.length > 0) {
          setSelectedCategory(sidebarInputs.categoryId);
          const subcategoryRes = await fetchSubcategory(
            sidebarInputs.categoryId
          );
          const subcategoriesData = subcategoryRes.data1 || subcategoryRes;
          setSubCategoryList(subcategoriesData);
          setSelectedSubcategory(sidebarInputs.subcategoryId);
        }
        setIsPublished(sidebarInputs.isPublished);
        setTags(sidebarInputs.tags);
        setModifiedTags(sidebarInputs.tags);
        setIsPinned(sidebarInputs.isPinned);
      } catch (error) {
        console.error("카테고리/서브카테고리 로딩 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 카테고리 선택시
  useEffect(() => {
    if (
      selectedCategory !== null &&
      selectedCategory !== undefined &&
      selectedCategory !== sidebarInputs.categoryId
    ) {
      fetchSubcategory(selectedCategory)
        .then((data) => {
          const subcategoriesData = data.data1 || data;
          setSubCategoryList(subcategoriesData);
          setSelectedSubcategory(0);
        })
        .catch((error) => {
          console.error("서브카테고리 업데이트 오류:", error);
        });
    }
  }, [selectedCategory, sidebarInputs.categoryId]);

  // 게시글 등록
  const createPostHandler = () => {
    const deletedTagArray = findUniqueSubstrings(tags, modifiedTags);

    clickPostbtn({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      isPublished: isPublished,
      tags: modifiedTags,
      isPinned: isPinned,
      deletedTags: deletedTagArray,
    });
  };

  if (isLoading) return <div>게시글 정보가 로딩 중입니다.</div>;
  return (
    <div>
      <div className="category-list">
        <h3>카테고리 목록</h3>
        <select onChange={CategoryHandler} value={selectedCategory || ""}>
          {categoryList.length === 0 ? (
            <option value="">로딩 중...</option>
          ) : (
            categoryList.map((v) => (
              <option key={"cate_" + v.id} value={v.id}>
                {v.name}
              </option>
            ))
          )}
        </select>
      </div>
      <div className="sub-category-list">
        <h3>부 카테고리 목록</h3>
        <select onChange={SubcategoryHandler} value={selectedSubcategory}>
          {subCategoryList.length === 0 ? (
            <option value={0}>없음</option>
          ) : (
            <>
              <option value={0}>없음</option>
              {subCategoryList.map((v) => (
                <option key={"subcate_" + v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
      <div className="is-published">
        <h3>공개 설정</h3>
        <li>
          <label>
            공개
            <input
              type="radio"
              name="published"
              checked={isPublished === true}
              value={true}
              onChange={() => {
                setIsPublished(true);
              }}
            />
          </label>
        </li>
        <li>
          <label>
            비공개
            <input
              type="radio"
              name="published"
              checked={isPublished === false}
              value={false}
              onChange={() => {
                setIsPublished(false);
              }}
            />
          </label>
        </li>
      </div>
      <div className="tags">
        <h3>태그 편집</h3>
        <textarea
          className="tag-box"
          placeholder="태그를 입력하세요 예시: 여행, 콘텐츠, 시"
          value={modifiedTags}
          onChange={(e) => {
            setModifiedTags(e.target.value);
          }}
        ></textarea>
      </div>
      {/* 추후 개발 */}
      <div className="book-to-publish" style={{ display: "none" }}>
        <h3>발행 시간</h3>
        <li>
          현재
          <input type="radio" name="publish-time" defaultChecked />
        </li>
        <li>
          예약
          <input type="radio" name="publish-time" />
        </li>
      </div>
      <label>
        <h3>
          공지사항으로 등록{" "}
          <input
            type="checkbox"
            value={isPinned}
            onChange={() => {
              setIsPinned(!isPinned);
            }}
            checked={isPinned}
          />
        </h3>
      </label>
      <div className="post-btn" onClick={createPostHandler}>
        <h4>수정</h4>
      </div>
    </div>
  );
};

export default UpdateSidebarComp;
