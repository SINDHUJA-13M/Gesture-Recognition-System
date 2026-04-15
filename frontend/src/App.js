import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import WebcamPage  from "./pages/WebcamPage";
import ResultPage  from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Navbar/>
      <main style={{flex:1,maxWidth:1000,width:"100%",margin:"0 auto",padding:"28px 20px"}}>
        <Routes>
          <Route path="/"        element={<WebcamPage/>}/>
          <Route path="/result"  element={<ResultPage/>}/>
          <Route path="/history" element={<HistoryPage/>}/>
          <Route path="*"        element={<Navigate to="/"/>}/>
        </Routes>
      </main>
    </div>
  );
}
