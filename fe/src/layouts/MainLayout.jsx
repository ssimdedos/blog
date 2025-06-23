import './MainLayout.css'
import HeaderComp from "../components/Header";
import FooterComp from "../components/Footer";
import SidebarComp from "../components/Sidebar";
import ScrollToTopBtn from '../components/ScrollToTopBtn';

const MainLayout = ({ children }) => {
  return (
    <div className="layout">
      {/* <div className=""></div> */}
      <div className="header"><HeaderComp /></div>
      <div className="container">
        <div className="content">{children}</div>
        <div className="sidebar"><SidebarComp /></div>
      </div>
      <div className="footer"><FooterComp /></div>
      <ScrollToTopBtn />
    </div>
  );
}

export default MainLayout;