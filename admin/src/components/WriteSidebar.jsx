import { useEffect, useState } from "react";
import { fetchCategory, fetchSubcategory } from "../api/category";
import './WriteSidebar.css';

const WriteSidebarComp = (clickPostbtn) => {
  const [categoryList, setCategoryList] = useState({});
  const [subCategoryList, setSubCategoryList] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(1);
  
  const CategoryHandler = (e) => {
    console.log(e.target.value);
    setSelectedCategory(e.target.value);
    fetchSubcategory(e.target.value).then(data => {
      console.log(data);
      setSubCategoryList(data);
    });
  }

  useEffect(()=> {
    // console.log('useEffect');
    fetchCategory().then(data => {
      // console.log(data);
      setCategoryList(data);
    });
    fetchSubcategory(1).then(data => {
      console.log(data);
      setSubCategoryList(data);
    })
  }, []);
  


  return(
    <div>
      <h3>카테고리 목록</h3>
      <select onChange={CategoryHandler} >
        {categoryList.length != undefined ? categoryList.map((v, i) => (<option key={'cate_'+i} value={v.id} >{v.name}</option>)) : <h5>로딩 중</h5>}
      </select>
      <h3>부 카테고리 목록</h3>
      <select onChange={CategoryHandler} >
        {subCategoryList.length != undefined ? subCategoryList.map((v, i) => (<option key={'subcate_'+i} value={v.id} >{v.name}</option>)) : <h5>로딩 중</h5>}
      </select>
      <h3>공개 설정</h3>
      <li>공개<input type="radio" name="published" checked /></li>
      <li>비공개<input type="radio" name="published" /></li>
      <h3>태그 편집</h3>
      <textarea placeholder="태그를 입력하세요 예시: 여행, 콘텐츠, 시"></textarea>
      <h3>발행 시간</h3>
      <li>현재<input type="radio" name="publish-time" checked /></li>
      <li>예약<input type="radio" name="publish-time" /></li>
      <h3>공지사항으로 등록 <input type="checkbox" /></h3>
      
      <div className="post-btn" onChange={clickPostbtn} >
        <h4>등록</h4>
      </div>
      
    </div>
  );
};

export default WriteSidebarComp;