// import '../assets/css/App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from '../pages/Main';
import HeaderRouter from './HeaderRouter';
import SideBarRouter from './SideBarRouter';
import MainLayout from '../layouts/MainLayout';

const AppRouter = () => {
  return (
    <Router>
        <div>
          {/* <HeaderRouter /> */}
          {/* <SideBarRouter /> */}
          <Routes>
            <Route path='/' element={<MainLayout><Main /></MainLayout>} />
          </Routes>
        </div>
    </Router>
  );
};

export default AppRouter;