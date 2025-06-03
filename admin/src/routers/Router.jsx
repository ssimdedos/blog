// import '../assets/css/App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from '../pages/Main';
import MainLayout from '../layouts/MainLayout';
import WritePost from '../pages/WritePost';
import CategoryEdit from '../pages/CategoryEdit';
import PostsEdit from '../pages/PostsEdit';
import UpdatePost from '../pages/UpdatePost';

const AppRouter = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/dashboard' element={<Main />} />
          <Route path='/categoryedit' element={<CategoryEdit />} />
          <Route path='/postsedit' element={<PostsEdit />} />
          <Route path='/write' element={<WritePost />} />
          <Route path='/update/:id' element={<UpdatePost />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;