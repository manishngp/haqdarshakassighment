import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, FileEdit, History, Send, ShieldCheck, X } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../auth/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function SchemeDetails(){
  const {schemeId}=useParams(); const location=useLocation(); const {user}=useAuth();
  const [scheme,setScheme]=useState(location.state?.scheme||null);
  const [version,setVersion]=useState(location.state?.version||null);
  const [versions,setVersions]=useState([]); const [changes,setChanges]=useState([]);
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const [decision,setDecision]=useState("APPROVE"); const [comment,setComment]=useState("");
  const [edit,setEdit]=useState(false); const [json,setJson]=useState("");
  const isState=user?.role==="STATE_REVIEWER";
  async function load(){
    setError("");
    try{
      const {data:history}=await api.get(`/schemes/${schemeId}/versions`);
      setVersions(history);
      const latest=history[0]||null; setVersion(latest);
      if(latest){const {data:log}=await api.get(`/versions/${latest._id}/changes`);setChanges(log);}
      if(!scheme && history[0]?.schemeId){setScheme({_id:schemeId,name:"Scheme",schemeCode:""});}
      if(history[0]?.data)setJson(JSON.stringify(history[0].data,null,2));
    }catch(e){setError(getErrorMessage(e));}
  }
  useEffect(()=>{load();},[schemeId]);
  async function action(path,body){
    setBusy(true);setError("");
    try{await api.post(path,body||{});setEdit(false);await load();}
    catch(e){setError(getErrorMessage(e));}
    finally{setBusy(false);}
  }
  async function saveEdit(){
    let parsed;try{parsed=JSON.parse(json);}catch{return setError("The scheme data must be valid JSON.");}
    setBusy(true);setError("");
    try{await api.patch(`/versions/${version._id}`,{data:parsed});setEdit(false);await load();}
    catch(e){setError(getErrorMessage(e));}finally{setBusy(false);}
  }
  async function createNextDraft(){
    setBusy(true);setError("");
    try{const {data:newVersion}=await api.post(`/schemes/${schemeId}/drafts`,{data:version.data});await load();setVersion(newVersion);setJson(JSON.stringify(newVersion.data,null,2));}
    catch(e){setError(getErrorMessage(e));}finally{setBusy(false);}
  }
  const current=version||versions[0];
  const canEdit=isState && current && ["DRAFT","RETURNED"].includes(current.status) && String(current.createdById?._id||current.createdById)===String(user.id);
  const canSubmit=canEdit;
  const canReview=!isState && current?.status==="IN_REVIEW" && String(current.createdById?._id||current.createdById)!==String(user.id);
  return <div className="detail-page">
    <Link className="back-link" to="/"><ArrowLeft size={16}/> Back to overview</Link>
    {error&&<div className="alert error">{error}</div>}
    <div className="page-heading"><div><span className="eyebrow dark">SCHEME DETAILS</span><h1>{scheme?.name||"Scheme workspace"}</h1><p>{scheme?.schemeCode||schemeId} <span className="dot-sep">•</span> Review versions, edits and publication history.</p></div>{current&&<StatusBadge status={current.status}/>}</div>
    {current?.reviewComment&&<div className="alert warning"><strong>Returned with feedback</strong><p>{current.reviewComment}</p></div>}
    <div className="detail-grid">
      <section className="panel main-panel"><div className="panel-heading"><div><h2>Version workspace</h2><p>Latest version and its current state</p></div><span className="version-pill">VERSION {current?.version??"—"}</span></div>
        {!current?<div className="empty-state">No version details available.</div>:<>
          <div className="version-meta"><div><small>CREATED BY</small><strong>{current.createdById?.name||"Reviewer"}</strong></div><div><small>LAST UPDATED</small><strong>{current.updatedAt?new Date(current.updatedAt).toLocaleString("en-IN"):"—"}</strong></div></div>
          <div className="data-heading"><h3>Scheme data</h3>{canEdit&&!edit&&<button className="outline-btn small" onClick={()=>{setJson(JSON.stringify(current.data,null,2));setEdit(true);}}><FileEdit size={14}/> Edit JSON</button>}</div>
          {edit?<><textarea className="json-editor" value={json} onChange={e=>setJson(e.target.value)} spellCheck="false"/><div className="inline-actions"><button className="outline-btn" onClick={()=>setEdit(false)}>Cancel</button><button className="primary-btn" disabled={busy} onClick={saveEdit}>Save changes</button></div></>:<pre className="json-view">{JSON.stringify(current.data,null,2)}</pre>}
          {canSubmit&&<div className="action-bar"><div><strong>Ready for review?</strong><small>Submitting locks this version until a decision is made.</small></div><button className="primary-btn" disabled={busy} onClick={()=>action(`/versions/${current._id}/submit`)}><Send size={15}/> Submit for review</button></div>}
          {canReview&&<div className="review-box"><h3>Review decision</h3><div className="decision-toggle"><button className={decision==="APPROVE"?"selected":""} onClick={()=>setDecision("APPROVE")}><Check size={15}/> Approve & publish</button><button className={decision==="RETURN"?"selected return-selected":""} onClick={()=>setDecision("RETURN")}><X size={15}/> Return for changes</button></div>{decision==="RETURN"&&<textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Explain what needs to be corrected…" rows="3"/>}<button className={`primary-btn ${decision==="RETURN"?"return-btn":""}`} disabled={busy||(decision==="RETURN"&&!comment.trim())} onClick={()=>action(`/versions/${current._id}/review`,{decision,...(decision==="RETURN"?{comment}:{})})}>{busy?"Processing…":decision==="APPROVE"?"Confirm publish":"Return with comments"}</button><small>Publishing makes this version the live scheme record. The previous published version is retained as superseded.</small></div>}
          {isState&&current.status==="PUBLISHED"&&<div className="action-bar"><div><strong>Published version is locked</strong><small>Create a separate draft to make future changes.</small></div><button className="outline-btn" disabled={busy} onClick={createNextDraft}><FileEdit size={15}/> Create new draft</button></div>}
        </>}
      </section>
      <aside className="panel side-panel"><div className="panel-heading"><div><h2><History size={17}/> Version history</h2><p>Every version is retained.</p></div></div>
        <div className="timeline">{versions.map(v=><div className="timeline-item" key={v._id}><div className={`timeline-dot ${v.status==="PUBLISHED"?"published":v.status==="IN_REVIEW"?"review":""}`}/><div className="timeline-content"><div><strong>Version {v.version}</strong><StatusBadge status={v.status}/></div><small>{v.createdAt?new Date(v.createdAt).toLocaleString("en-IN"):"—"}</small>{v.reviewComment&&<p>{v.reviewComment}</p>}</div></div>)}</div>
        <div className="panel-subheading"><h3><Clock3 size={15}/> Field change log</h3></div>
        {changes.length===0?<p className="muted small-text">No field-level changes recorded for this version.</p>:<div className="change-list">{changes.map(c=><div className="change-item" key={c._id}><strong>{c.field}</strong><small>{c.changedAt?new Date(c.changedAt).toLocaleString("en-IN"):""}</small><span className="change-values"><code>{JSON.stringify(c.oldValue)}</code> → <code>{JSON.stringify(c.newValue)}</code></span></div>)}</div>}
        <div className="security-note"><ShieldCheck size={16}/><span>Changes and review decisions are recorded for accountability.</span></div>
      </aside>
    </div>
  </div>;
}