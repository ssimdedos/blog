import './MainLayout.css'
import HeaderComp from "../components/Header";
import FooterComp from "../components/Footer";
import SidebarComp from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="layout">
      <div className="header"><HeaderComp /></div>
      <div className="container">
        <div className="sidebar"><SidebarComp /></div>
        <div className="content">{children}</div>
      </div>
      <div className="footer"><FooterComp /></div>
    </div>
  );
}

export default MainLayout;