import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GESTURES_INFO = [
  {g:"hello",t:"Hello!",e:"👋"},{g:"yes",t:"Yes",e:"👍"},{g:"no",t:"No",e:"☝️"},
  {g:"thank_you",t:"Thank You",e:"🙏"},{g:"please",t:"Please",e:"👍"},
  {g:"sorry",t:"Sorry",e:"✊"},{g:"help",t:"Help",e:"🤙"},{g:"good",t:"Good",e:"👍"},
  {g:"bad",t:"Bad",e:"👎"},{g:"stop",t:"Stop",e:"🖐"},{g:"love",t:"I Love You",e:"🤟"},
  {g:"water",t:"Water",e:"💧"},{g:"eat",t:"Eat",e:"🍽"},{g:"come",t:"Come",e:"👉"},
  {g:"go",t:"Go",e:"➡️"},
];

export default function WebcamPage() {
  const webcamRef   = useRef(null);
  const intervalRef = useRef(null);
  const navigate    = useNavigate();

  const [camOn,      setCamOn]      = useState(false);
  const [liveOn,     setLiveOn]     = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [sentence,   setSentence]   = useState([]);

  const sendFrame = useCallback(async (goToResult=false)=>{
    if(!webcamRef.current) return;
    const img = webcamRef.current.getScreenshot();
    if(!img) return;
    setLoading(true); setError("");
    try{
      const res = await axios.post("/predict",{image:img});
      if(goToResult){
        localStorage.setItem("gestureResult", JSON.stringify({...res.data, imageSrc:img}));
        navigate("/result");
      } else {
        setLiveResult(res.data);
        if(res.data.gesture!=="unknown" && res.data.confidence>50){
          setSentence(s=>{
            const last = s[s.length-1];
            if(last===res.data.text) return s;
            return [...s.slice(-9), res.data.text];
          });
        }
      }
    }catch(e){
      setError("Backend error — is the Flask server running on port 5000?");
    }finally{ setLoading(false); }
  },[navigate]);

  useEffect(()=>{
    if(liveOn){ intervalRef.current = setInterval(()=>sendFrame(false),1200); }
    else { clearInterval(intervalRef.current); }
    return ()=>clearInterval(intervalRef.current);
  },[liveOn, sendFrame]);

  const stopCam = ()=>{ setCamOn(false); setLiveOn(false); setLiveResult(null); };

  const s = {
    card:{background:"#12152a",borderRadius:16,border:"1px solid #1f2440",overflow:"hidden"},
    badge:(c)=>({
      display:"inline-block",padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600,
      background: c>=75?"#052e1630":c>=50?"#2d1b0030":"#2d0a0a30",
      color: c>=75?"#4ade80":c>=50?"#fbbf24":"#f87171",
      border:`1px solid ${c>=75?"#4ade8055":c>=50?"#fbbf2455":"#f8717155"}`,
    }),
  };

  return(
    <div>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:26,fontWeight:700,marginBottom:6}}>📷 Webcam Capture</h1>
        <p style={{color:"#64748b",fontSize:14}}>
          Show a hand gesture to the camera — capture once or use live detection.
        </p>
      </div>

      {/* Camera feed */}
      <div style={{...s.card,marginBottom:16}}>
        {camOn ? (
          <div style={{position:"relative"}}>
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg"
              videoConstraints={{facingMode:"user",width:640,height:460}}
              style={{width:"100%",display:"block",maxHeight:460,objectFit:"cover"}}
            />
            {liveOn && (
              <div style={{position:"absolute",top:12,left:12,background:"#ef444499",
                color:"#fff",padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600,
                display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:8,height:8,background:"#fff",borderRadius:"50%",
                  animation:"pulse 1s infinite"}}/>
                LIVE
              </div>
            )}
          </div>
        ):(
          <div style={{height:380,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:12,color:"#334155"}}>
            <span style={{fontSize:56}}>📷</span>
            <p style={{fontSize:15}}>Camera is off</p>
            <p style={{fontSize:13,color:"#1e293b"}}>Click Start Camera to begin</p>
          </div>
        )}
      </div>

      {/* Live result badge */}
      {liveResult && (
        <div style={{...s.card,padding:"16px 20px",marginBottom:16,
          display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:40,width:56,textAlign:"center"}}>
            {GESTURES_INFO.find(g=>g.g===liveResult.gesture)?.e || "🤚"}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:22,color:"#a78bfa"}}>
              {liveResult.text || "—"}
            </div>
            <div style={{fontSize:13,color:"#475569",marginTop:2}}>
              Gesture: <code style={{color:"#7c6ffb"}}>{liveResult.gesture}</code>
            </div>
          </div>
          <span style={s.badge(liveResult.confidence)}>
            {liveResult.confidence}%
          </span>
        </div>
      )}

      {/* Sentence builder */}
      {sentence.length>0 && (
        <div style={{...s.card,padding:"14px 20px",marginBottom:16}}>
          <div style={{fontSize:12,color:"#475569",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>
            Sentence Builder
          </div>
          <div style={{fontSize:18,fontWeight:500,color:"#e2e8f0",lineHeight:1.6}}>
            {sentence.join(" ")}
          </div>
          <button onClick={()=>setSentence([])}
            style={{marginTop:10,background:"transparent",color:"#475569",
              border:"1px solid #1f2440",fontSize:12,padding:"4px 10px"}}>
            Clear
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{background:"#2d0a0a",border:"1px solid #7f1d1d",borderRadius:10,
          padding:"12px 16px",marginBottom:16,fontSize:13,color:"#fca5a5"}}>
          ⚠️ {error}
        </div>
      )}

      {/* Controls */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
        <button onClick={()=>camOn?stopCam():setCamOn(true)}
          style={{background:camOn?"#dc2626":"#16a34a",color:"#fff",padding:"11px 22px"}}>
          {camOn?"⏹ Stop Camera":"▶ Start Camera"}
        </button>
        <button onClick={()=>sendFrame(true)} disabled={!camOn||loading}
          style={{background:"#7c3aed",color:"#fff",padding:"11px 22px"}}>
          {loading?"⏳ Processing…":"📸 Capture & Predict"}
        </button>
        <button onClick={()=>setLiveOn(p=>!p)} disabled={!camOn}
          style={{background:liveOn?"#b45309":"#d97706",color:"#fff",padding:"11px 22px"}}>
          {liveOn?"🔴 Stop Live":"🟡 Start Live Detect"}
        </button>
      </div>

      {/* Gesture reference grid */}
      <div style={{marginTop:8}}>
        <h3 style={{fontSize:14,color:"#475569",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>
          Supported Gestures
        </h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:8}}>
          {GESTURES_INFO.map(g=>(
            <div key={g.g} style={{background:"#12152a",border:"1px solid #1f2440",
              borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:4}}>{g.e}</div>
              <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{g.t}</div>
              <div style={{fontSize:10,color:"#475569"}}>{g.g}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
