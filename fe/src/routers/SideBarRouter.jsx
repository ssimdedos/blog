import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Category from '../pages/Category';
import { useEffect, useState } from 'react';
import { fetchCategory } from '../api/category';
import Error from '../pages/Error';
import Board from '../components/Board';

const SideBarRouter = () => {
  const [categoryList, setCategoryList] = useState({});
  useEffect(()=> {
    fetchCategory().then((c) => {
      setCategoryList(c);
    });
  }, []);
  console.log(categoryList);
  return(
    <Routes>
      <Route element={<MainLayout></MainLayout>}>
        {/* { categoryList.length != undefined
        ? categoryList.map((c, i)=> (<Route path={`category/${c.id}`} element={<Category categoryType={c.id} />} />))
        : <Route path='' element={<Error />} /> } */}
        <Route path='category/:id' element={<Category /> } />
      </Route>
    </Routes>
  )
};

export default SideBarRouter;