import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage } from "../api";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("state@haqdarshak.test");
  const [password, setPassword] = useState("Pass@123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user && localStorage.getItem("hd_token")) return <Navigate to="/" replace />;
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try { await login(email.trim(), password); navigate("/", { replace: true }); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }
  return <div className="login-page">
    <div className="login-aside"><div className="brand brand-light"><div className="brand-mark">H</div><div><strong>haqdarshak</strong><small>SCHEME KNOWLEDGE BASE</small></div></div>
      <div className="login-message"><span className="eyebrow">PUBLIC SERVICE. TRUSTED INFORMATION.</span><h1>Every scheme deserves a clear path to <em>the people.</em></h1><p>A controlled review and publishing workspace for accurate, accountable scheme information.</p>
        <div className="login-feature"><ShieldCheck size={19}/><span>Verified review workflow with version history and audit trail.</span></div></div>
      <div className="aside-foot">INTERNAL REVIEW WORKSPACE <span>•</span> SECURE ACCESS</div>
    </div>
    <div className="login-panel"><form className="login-form" onSubmit={submit}>
      <span className="eyebrow dark">WELCOME BACK</span><h2>Sign in to your workspace</h2><p className="muted">Use your reviewer credentials to continue.</p>
      <label>Email address</label><div className="input-wrap"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@organisation.gov.in"/></div>
      <label>Password</label><div className="input-wrap"><LockKeyhole size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter your password"/></div>
      {error && <div className="alert error">{error}</div>}
      <button className="primary-btn full" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <ArrowRight size={17}/></button>
      <div className="demo-box"><strong>Demo access</strong><span>State: state@haqdarshak.test</span><span>Central: central@haqdarshak.test</span><small>Both demo accounts use Pass@123. Development only.</small></div>
    </form></div>
  </div>;
}