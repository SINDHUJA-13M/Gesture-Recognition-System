import React, { useEffect, useState } from "react";
import axios from "axios";

const EMOJI_MAP = {
  hello:"👋",yes:"👍",no:"☝️",thank_you:"🙏",please:"👍",
  sorry:"✊",help:"🤙",good:"👍",bad:"👎",stop:"🖐",
  love:"🤟",water:"💧",eat:"🍽",come:"👉",go:"➡️",unknown:"❓",
};

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [error,   setError]   = useState("");

  const fetch = async()=>{
    setLoading(true); setError("");
    try{
      const res = await axios.get("/history");
      setRecords(res.data);
    }catch(e){
      setError("Cannot connect to backend — is Flask running on port 5000?");
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ fetch(); },[]);

  const del = async(id)=>{
    if(!window.confirm("Delete this record?")) return;
    await axios.delete(`/history/${id}`);
    setRecords(r=>r.filter(x=>x.id!==id));
  };

  const filtered = records.filter(r=>
    r.gesture.toLowerCase().includes(search.toLowerCase()) ||
    r.text.toLowerCase().includes(search.toLowerCase())
  );

  const confColor = c=> c*100>=75?"#4ade80":c*100>=50?"#fbbf24":"#f87171";

  const s={
    card:{background:"#12152a",border:"1px solid #1f2440",borderRadius:16,overflow:"hidden"},
    th:{padding:"12px 16px",textAlign:"left",fontSize:11,color:"#475569",
      textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:600,
      background:"#0d0f1a",borderBottom:"1px solid #1f2440"},
    td:{padding:"12px 16px",fontSize:14,borderBottom:"1px solid #161929",verticalAlign:"middle"},
  };

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <h1 style={{fontSize:26,fontWeight:700,flex:1}}>📋 Prediction History</h1>
        <span style={{fontSize:13,color:"#475569"}}>{filtered.length} records</span>
        <button onClick={fetch}
          style={{background:"#1a1d2e",color:"#94a3b8",border:"1px solid #1f2440",fontSize:13}}>
          ↺ Refresh
        </button>
      </div>

      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="🔍  Search by gesture or text…"
        style={{width:"100%",padding:"12px 16px",borderRadius:10,fontSize:14,
          background:"#12152a",border:"1px solid #1f2440",color:"#e2e8f0",
          marginBottom:16,outline:"none",fontFamily:"Inter,sans-serif"}}/>

      {error && (
        <div style={{background:"#2d0a0a",border:"1px solid #7f1d1d",borderRadius:10,
          padding:"12px 16px",marginBottom:16,fontSize:13,color:"#fca5a5"}}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{textAlign:"center",paddingTop:80,color:"#334155"}}>
          <div style={{fontSize:32,marginBottom:12}}>⏳</div>
          <p>Loading history…</p>
        </div>
      ) : filtered.length===0 ? (
        <div style={{textAlign:"center",paddingTop:80,color:"#334155"}}>
          <div style={{fontSize:48,marginBottom:12}}>📭</div>
          <p style={{fontSize:16}}>{search?"No matches found.":"No predictions yet — start capturing gestures!"}</p>
        </div>
      ) : (
        <div style={s.card}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th style={s.th}>#</th>
                <th style={s.th}>Image</th>
                <th style={s.th}>Gesture</th>
                <th style={s.th}>Text</th>
                <th style={s.th}>Confidence</th>
                <th style={s.th}>Time</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.id}
                  onMouseEnter={e=>e.currentTarget.style.background="#161929"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{...s.td,color:"#334155",fontSize:12}}>{r.id}</td>
                  <td style={s.td}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:28}}>{EMOJI_MAP[r.gesture]||"🤚"}</span>
                      <img src={`/images/${r.image_path}`} alt=""
                        style={{width:48,height:48,objectFit:"cover",
                          borderRadius:8,border:"1px solid #1f2440"}}
                        onError={e=>e.target.style.display="none"}/>
                    </div>
                  </td>
                  <td style={s.td}>
                    <code style={{color:"#a78bfa",background:"#1e1b4b",
                      padding:"2px 8px",borderRadius:6,fontSize:13}}>
                      {r.gesture}
                    </code>
                  </td>
                  <td style={{...s.td,fontWeight:600,color:"#e2e8f0"}}>{r.text}</td>
                  <td style={s.td}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:50,height:6,background:"#1a1d2e",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${r.confidence*100}%`,height:"100%",
                          background:confColor(r.confidence),borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:13,fontWeight:600,color:confColor(r.confidence),minWidth:38}}>
                        {(r.confidence*100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td style={{...s.td,color:"#334155",fontSize:12,whiteSpace:"nowrap"}}>
                    {new Date(r.timestamp).toLocaleString()}
                  </td>
                  <td style={s.td}>
                    <button onClick={()=>del(r.id)}
                      style={{background:"transparent",color:"#ef4444",padding:"4px 10px",
                        border:"1px solid #450a0a",borderRadius:6,fontSize:12}}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
