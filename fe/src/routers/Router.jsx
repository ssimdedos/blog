// import '../assets/css/App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from '../pages/Main';
import HeaderRouter from './HeaderRouter';
import MainLayout from '../layouts/MainLayout';
import Category from '../pages/Category';
import WritePost from '../pages/WritePost';
import Pages from '../pages/Pages';

const AppRouter = () => {
  return (
    <Router>
      {/* <HeaderRouter /> */}
      {/* <SideBarRouter /> */}
      <MainLayout>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='category/:id' element={<Category /> } />
          <Route path='/write' element={<WritePost />} />
          <Route path='/pages/:id/:slug' element={<Pages />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;