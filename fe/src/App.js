import './App.css'; 
import React, { useEffect } from 'react';
import AppRouter from './routers/Router';
import { useCookies } from 'react-cookie';
import { recordUserInfo } from './api/users';

function App() {
  const [cookie, setCookie] = useCookies(['dedosVisitor']);
  useEffect(()=> {
    if(!cookie['dedosVisitor']) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      setCookie('dedosVisitor', 'true', {path:'/', expires});
      recordUserInfo();
    }
  },[]);
  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;
