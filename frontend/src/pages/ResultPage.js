import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const EMOJI_MAP = {
  hello:"👋",yes:"👍",no:"☝️",thank_you:"🙏",please:"👍",
  sorry:"✊",help:"🤙",good:"👍",bad:"👎",stop:"🖐",
  love:"🤟",water:"💧",eat:"🍽",come:"👉",go:"➡️",unknown:"❓",
};

export default function ResultPage() {
  const [result,  setResult]  = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loaded,  setLoaded]  = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(()=>{
    const raw = localStorage.getItem("gestureResult");
    if(raw){ setResult(JSON.parse(raw)); setLoaded(true); }
  },[]);

  const playAudio = ()=>{
    if(!audioRef.current) return;
    audioRef.current.play().then(()=>setPlaying(true)).catch(e=>console.warn(e));
  };

  const conf = result?.confidence ?? 0;
  const confColor = conf>=75?"#4ade80":conf>=50?"#fbbf24":"#f87171";
  const confBg    = conf>=75?"#052e16":"#1c1500";

  const s = {
    card:{background:"#12152a",border:"1px solid #1f2440",borderRadius:16,padding:24,marginBottom:16},
    label:{fontSize:11,color:"#475569",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600},
  };

  if(!loaded) return(
    <div style={{textAlign:"center",paddingTop:100,color:"#334155"}}>
      <div style={{fontSize:56,marginBottom:16}}>🎯</div>
      <p style={{fontSize:16,marginBottom:20}}>No prediction yet — capture a gesture first.</p>
      <button onClick={()=>navigate("/")}
        style={{background:"#7c3aed",color:"#fff",padding:"12px 28px"}}>
        Go to Webcam →
      </button>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <h1 style={{fontSize:26,fontWeight:700,flex:1}}>🎯 Prediction Result</h1>
        <button onClick={()=>navigate("/")}
          style={{background:"#1a1d2e",color:"#94a3b8",border:"1px solid #1f2440",fontSize:13}}>
          ← Capture Again
        </button>
        <button onClick={()=>navigate("/history")}
          style={{background:"#1a1d2e",color:"#94a3b8",border:"1px solid #1f2440",fontSize:13}}>
          History →
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* Left: Captured image */}
        <div style={s.card}>
          <div style={s.label}>Captured Frame</div>
          {result.imageSrc && (
            <img src={result.imageSrc} alt="gesture"
              style={{width:"100%",borderRadius:12,border:"1px solid #1f2440",display:"block"}}/>
          )}
        </div>

        {/* Right: All prediction details */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Main prediction */}
          <div style={{...s.card,textAlign:"center",background:"#14103a"}}>
            <div style={{fontSize:64,marginBottom:8}}>
              {EMOJI_MAP[result.gesture]||"🤚"}
            </div>
            <div style={{fontSize:32,fontWeight:700,color:"#a78bfa",marginBottom:4}}>
              {result.text||"Unknown"}
            </div>
            <code style={{fontSize:13,color:"#4f46e5",background:"#1e1b4b",
              padding:"3px 10px",borderRadius:6}}>
              {result.gesture}
            </code>
          </div>

          {/* Confidence meter */}
          <div style={s.card}>
            <div style={s.label}>Confidence Score</div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
              <span style={{fontSize:28,fontWeight:700,color:confColor,minWidth:64}}>
                {conf}%
              </span>
              <div style={{flex:1,height:10,background:"#1a1d2e",borderRadius:5,overflow:"hidden"}}>
                <div style={{width:`${conf}%`,height:"100%",background:confColor,
                  borderRadius:5,transition:"width 0.8s ease"}}/>
              </div>
            </div>
            <div style={{fontSize:12,color:"#475569",background:confBg,
              padding:"6px 12px",borderRadius:8,display:"inline-block"}}>
              {conf>=75?"✅ High confidence":conf>=50?"⚠️ Medium confidence":"❌ Low confidence — try again"}
            </div>
          </div>

          {/* Voice player */}
          <div style={s.card}>
            <div style={s.label}>Voice Output</div>
            {result.audio_url ? (
              <>
                <audio ref={audioRef} src={result.audio_url}
                  onEnded={()=>setPlaying(false)} style={{display:"none"}}/>
                <button onClick={playAudio} disabled={playing}
                  style={{width:"100%",background:playing?"#1e293b":"#0ea5e9",
                    color:"#fff",padding:14,fontSize:15,borderRadius:10}}>
                  {playing?"🔊  Playing…":"▶  Play Voice"}
                </button>
              </>
            ):(
              <div style={{color:"#475569",fontSize:13,padding:"12px 0"}}>
                No audio generated (check internet for gTTS or install pyttsx3 for offline).
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
