import { useEffect, useState } from "react";
import { fetchCategory } from "../api/category";

const SidebarComp = () => {
  const [categoryList, setCategoryList] = useState({});
  useEffect(()=> {
    console.log('useEffect');
    fetchCategory().then(data => {
      console.log(data);
      setCategoryList(data);
    });
  }, []);
  return(
    <div>
      {
        categoryList.map((c, i) => (
          <li key={`cate-id-${i+1}`}>
            <h2>{c}</h2>
          </ li>
        ))
      }
    </div>
  );
};

export default SidebarComp;