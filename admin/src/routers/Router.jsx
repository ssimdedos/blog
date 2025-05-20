// import '../assets/css/App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from '../pages/Main';
import MainLayout from '../layouts/MainLayout';
import WritePost from '../pages/WritePost';
import CategoryEdit from '../components/CategoryEdit';

const AppRouter = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/dashboard' element={<Main />} />
          <Route path='/categoryedit' element={<CategoryEdit />} />
          <Route path='/write' element={<WritePost />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;