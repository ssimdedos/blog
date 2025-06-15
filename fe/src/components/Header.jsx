import '../assets/css/Font.css';
import './Header.css';
import { Link } from 'react-router-dom';

const HeaderComp = () => {
  return (
    <div>
      <div className='title-container' >
        <a href='/' className='home-btn'>
          <div className='logo-box'>
            <img src={process.env.REACT_APP_LOGO_URL} />
          </div>
          <div className='font-box' >
            <p className="font-header" >내 손가락들의 생각:<span style={{ fontSize: '17px' }} > Idea de mis dedos</span></p>
          </div>
        </a>
      </div>
      <div className='header-menu-container' >
        <div className='header-menu'>
          <Link to={'/'} >
            <span>Home</span>
          </Link>
        </div>
        <div className='header-menu'>
          <Link to={'/tag'} >
            <span>Tags</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeaderComp;