import '../assets/css/Font.css';
import './Footer.css';

const FooterComp = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content-wrapper">
        {/* <div className="footer-menu">
                    <span>ABOUT</span>
                    <span>EDITORS</span>
                    <span>NEWSLETTER</span>
                    <span>INSTAGRAM</span>
                </div> */}

        <div className="footer-logo">
          Idea de mis dedos
        </div>

        <div className="footer-contact-info">
          <p>
            <span>이메일:</span> ideademisdedos@gmail.com
          </p>
          <p>
            <span>github:</span> ssimdedos
          </p>
          {/* <p>
                        <span>광고 제휴 문의:</span> hello@the-edit.co.kr
                    </p>
                    <p>
                        <span>보도자료:</span> press@the-edit.co.kr
                    </p> */}
        </div>
        {/* <div className="footer-address">
          <p>
            서울시 강남구 도산대로94길 19 진영빌딩 2층 @THE EDIT. ALL RIGHTS RESERVED.
          </p>
        </div> */}
      </div>
    </footer>
  );
};

export default FooterComp;