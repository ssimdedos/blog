import './Sidebar.css';
import { useEffect, useState } from "react";
import { fetchCategory } from "../api/category";
import { Link } from "react-router-dom";

const SidebarComp = () => {
  const [categoryList, setCategoryList] = useState({});
  useEffect(()=> {
    // console.log('useEffect');
    fetchCategory().then(data => {
      // console.log(data);
      setCategoryList(data);
    });
  }, []);
  return(
    <div>
      <Link to={'dashboard'}><h3>대시보드</h3></Link>
      <Link to={'categoryedit'}><h3>카테고리 관리</h3></Link>
      <Link to={'postsedit'}><h3>게시글 관리</h3></Link>
      <Link to={'write'}><h3>글 작성</h3></Link>
    </div>
  );
};

export default SidebarComp;