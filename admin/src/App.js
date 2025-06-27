import { useEffect, useState } from 'react';
import './App.css';
import AppRouter from './routers/Router';
import { useCookies } from 'react-cookie';
import { authAdmin } from './api/users';

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [password, setPassword] = useState(null);
  const [cookie, setCookie] = useCookies(['dedosAdmin']);
  const loginCheck = async () => {
    const authAdminRes = await authAdmin(password);
    if (authAdminRes.success) {
      if (!cookie['dedosAdmin']) {
        const expires = new Date();
        expires.setHours(expires.getHours() + 2);
        setCookie('dedosAdmin', 'true', { path: '/', expires });
        setIsLogin(true);
      }
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
    return
  }

  useEffect(() => {
    if (cookie['dedosAdmin']) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, []);

  // 엔터 키로 로그인 시도
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      loginCheck();
    }
  };

  if (isLogin === false) {
    return (
      <div className="login-container">
        <div className="login-header">
          <h1>Idea de mis dedos</h1>
          <h2>관리자 페이지</h2>
        </div>
        <div className="login-form">
          <label>
            <input
              type='password'
              placeholder='비밀번호를 입력해주세요.'
              value={password}
              onChange={(e) => { setPassword(e.target.value) }}
              onKeyDown={handleKeyPress}
            />
          </label>
          <button onClick={loginCheck}>확인</button>
        </div>
      </div>
    )
  };
  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;
