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
      { categoryList.length != undefined
        ? categoryList.map((c, i) => (
          <Link to={`category/${c.id}` } key={`category-id-${c.id}`} ><li className="category-li" >{c.name}</ li></Link>
        ))
        :<h2>로딩 중</h2>
      }
    </div>
  );
};

export default SidebarComp;