import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api";

export default function CreateScheme() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ schemeCode:"", name:"", benefitAmount:"", frequency:"yearly", eligibility:"", incomeLimit:"", source:"", page:"" });
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  function change(e){setForm({...form,[e.target.name]:e.target.value});}
  async function submit(e){
    e.preventDefault(); setError(""); setBusy(true);
    const data = {
      benefitAmount: { value:Number(form.benefitAmount), currency:"INR", frequency:form.frequency,
        ...(form.source.trim()?{source:form.source.trim()}:{}), ...(form.page?{page:Number(form.page)}:{}) },
      eligibility: { category:form.eligibility.trim(), ...(form.incomeLimit?{incomeLimit:Number(form.incomeLimit)}:{}) }
    };
    try { const {data:result}=await api.post("/schemes",{schemeCode:form.schemeCode.trim(),name:form.name.trim(),data}); navigate(`/schemes/${result.scheme._id}`,{state:{scheme:result.scheme,version:result.version}}); }
    catch(err){setError(getErrorMessage(err));} finally{setBusy(false);}
  }
  return <div className="form-page"><Link className="back-link" to="/"><ArrowLeft size={16}/> Back to overview</Link>
    <div className="page-heading compact"><div><span className="eyebrow dark">SCHEME MANAGEMENT / NEW</span><h1>Create a scheme draft</h1><p>Add the first version. It will remain a draft until submitted and approved.</p></div></div>
    <form className="form-card" onSubmit={submit}>
      <div className="form-section-title"><span>01</span><div><h2>Basic information</h2><p>Identify the scheme using a unique code and clear name.</p></div></div>
      <div className="form-grid"><div className="field"><label>Scheme code *</label><input name="schemeCode" value={form.schemeCode} onChange={change} required minLength="2" placeholder="MH-STUDENT-001"/></div><div className="field"><label>Scheme name *</label><input name="name" value={form.name} onChange={change} required minLength="2" placeholder="Maharashtra Student Support"/></div></div>
      <div className="form-divider"/>
      <div className="form-section-title"><span>02</span><div><h2>Benefit details</h2><p>Enter the amount and its payment frequency.</p></div></div>
      <div className="form-grid"><div className="field"><label>Benefit amount (₹) *</label><input type="number" name="benefitAmount" min="0" value={form.benefitAmount} onChange={change} required placeholder="6000"/></div><div className="field"><label>Frequency</label><select name="frequency" value={form.frequency} onChange={change}><option value="yearly">Yearly</option><option value="monthly">Monthly</option><option value="one-time">One time</option></select></div><div className="field"><label>Source URL</label><input type="url" name="source" value={form.source} onChange={change} placeholder="https://official.gov.in/document.pdf"/></div><div className="field"><label>Source page</label><input type="number" min="1" name="page" value={form.page} onChange={change} placeholder="4"/></div></div>
      <div className="form-divider"/>
      <div className="form-section-title"><span>03</span><div><h2>Eligibility overview</h2><p>Capture the primary eligibility criteria.</p></div></div>
      <div className="form-grid"><div className="field"><label>Eligible category *</label><input name="eligibility" value={form.eligibility} onChange={change} required placeholder="SC/ST, OBC, General…"/></div><div className="field"><label>Annual family income limit (₹)</label><input type="number" min="0" name="incomeLimit" value={form.incomeLimit} onChange={change} placeholder="250000"/></div></div>
      {error && <div className="alert error">{error}</div>}
      <div className="form-footer"><span><strong>Draft only</strong> · You can edit before submitting for review.</span><button className="primary-btn" disabled={busy}><Save size={16}/>{busy?"Creating…":"Save draft"}</button></div>
    </form>
  </div>;
}