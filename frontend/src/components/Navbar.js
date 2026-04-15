import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Navbar() {
  const loc = useLocation();
  const nav = {
    background:"#12152a",
    borderBottom:"1px solid #1f2440",
    display:"flex",alignItems:"center",
    padding:"0 28px",height:60,
    position:"sticky",top:0,zIndex:100,
    backdropFilter:"blur(10px)",
  };
  const logo = {
    fontWeight:700,fontSize:20,
    background:"linear-gradient(135deg,#7c6ffb,#a78bfa)",
    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
    marginRight:"auto",letterSpacing:"-0.5px",
  };
  const link = ({isActive})=>({
    padding:"7px 16px",borderRadius:8,fontSize:14,fontWeight:500,
    color: isActive?"#fff":"#64748b",
    background: isActive?"#7c6ffb22":"transparent",
    border: isActive?"1px solid #7c6ffb55":"1px solid transparent",
    transition:"all 0.15s",
  });
  return(
    <nav style={nav}>
      <span style={logo}>✋ GestureAI</span>
      <div style={{display:"flex",gap:6}}>
        <NavLink to="/"        style={link}>📷 Webcam</NavLink>
        <NavLink to="/result"  style={link}>🎯 Result</NavLink>
        <NavLink to="/history" style={link}>📋 History</NavLink>
      </div>
    </nav>
  );
}
