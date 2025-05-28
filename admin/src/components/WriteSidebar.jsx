import { useEffect, useState } from "react";
import { fetchCategory, fetchSubcategory } from "../api/category";
import './WriteSidebar.css';

const WriteSidebarComp = ({clickPostbtn}) => {
  const [categoryList, setCategoryList] = useState({});
  const [subCategoryList, setSubCategoryList] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [selectedSubcategory, setSelectedSubcategory] = useState(0);

  const [isPublished, setIsPublished] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState('');

  
  const CategoryHandler = (e) => {
    // console.log(e.target.value);
    setSelectedCategory(e.target.value);
    fetchSubcategory(e.target.value).then(data => {
      // console.log(data);
      setSubCategoryList(data);
      if (data.length != 0) {
        // console.log(data[0].id);
        setSelectedSubcategory(data[0].id);
      } else {
        setSelectedSubcategory(0);
      }
    });
  }

  const SubcategoryHandler = (e) => {
    console.log(e.target.value);
    setSelectedSubcategory(e.target.value);
  }


  useEffect(()=> {
    // console.log('useEffect');
    fetchCategory().then(data => {
      // console.log(data);
      setCategoryList(data);
      setSelectedCategory(data[0].id);
    });
    fetchSubcategory(selectedCategory).then(data => {
      // console.log(data);
      setSubCategoryList(data);
      if (data.length != 0) {
        // console.log(data[0].id);
        setSelectedSubcategory(data[0].id);
      } else {
        setSelectedSubcategory(0);
      }
    });
  }, []);

  const createPostHandler = ()=> {
    clickPostbtn({
      ['category'] : selectedCategory,
      ['subcategory'] : selectedSubcategory,
      ['isPublished'] : isPublished,
      ['tags'] : tags,
      ['isPinned'] : isPinned,
    });
  };



  return(
    <div>
      <div className="category-list">
        <h3>카테고리 목록</h3>
        <select onChange={CategoryHandler} >
          {categoryList.length != undefined ? categoryList.map((v, i) => (<option key={'cate_'+i} value={v.id} >{v.name}</option>)) : <h5>로딩 중</h5>}
        </select>
      </div>
      <div className="sub-category-list">
        <h3>부 카테고리 목록</h3>
        <select onChange={SubcategoryHandler} >
          {subCategoryList.length == 0 ? <option defaultValue value={0} >없음</option> :<></>}
          {subCategoryList.length != undefined ? subCategoryList.map((v, i) => (<option key={'subcate_'+i} value={v.id} >{v.name}</option>)) : <h5>로딩 중</h5>}
        </select>
      </div>
      <div className="is-published">
        <h3>공개 설정</h3>
        <li><label>공개<input type="radio" name="published" checked={isPublished===true} value={true} onChange={()=>{setIsPublished(!isPublished)}} /></label></li>
        <li><label>비공개<input type="radio" name="published" checked={isPublished===false}  value={false} onChange={()=>{setIsPublished(!isPublished)}} /></label></li>
      </div>
      <div className="tags">
        <h3>태그 편집</h3>
        <textarea className="tag-box" placeholder="태그를 입력하세요 예시: 여행, 콘텐츠, 시" value={tags} onChange={(e)=>{setTags(e.target.value)}}></textarea>
      </div>
      {/* 추후 개발 */}
      <div className="book-to-publish" style={{display:"none"}}>
        <h3>발행 시간</h3>
        <li>현재<input type="radio" name="publish-time" checked /></li>
        <li>예약<input type="radio" name="publish-time" /></li>
      </div>
      <label><h3>공지사항으로 등록 <input type="checkbox" value={isPinned} onChange={()=> {setIsPinned(!isPinned)}} /></h3></label>
      <div className="post-btn" onClick={createPostHandler} >
        <h4>등록</h4>
      </div>
      
    </div>
  );
};

export default WriteSidebarComp;