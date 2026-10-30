import { useEffect, useState } from "react";
import { ArrowUpRight, ClipboardCheck, FileClock, FilePlus2, RefreshCw, Search } from "lucide-react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../auth/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const { user } = useAuth();
  const isState = user?.role === "STATE_REVIEWER";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { const { data } = await api.get("/schemes"); setItems(Array.isArray(data) ? data : data.schemes || []); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const filtered = items.filter(item => `${item.name} ${item.schemeCode}`.toLowerCase().includes(search.toLowerCase()));
  const latestOf = item => item.latestVersion || item.latest || item.version || null;
  const count = status => items.filter(item => latestOf(item)?.status === status).length;
  return <div>
    <div className="page-heading"><div><span className="eyebrow dark">OVERVIEW</span><h1>Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {user?.name?.split(" ")[0] || "Reviewer"}</h1><p>Here’s what’s happening across your scheme review workspace.</p></div>
      <button className="outline-btn" onClick={load}><RefreshCw size={15}/> Refresh</button></div>
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon"><FileClock size={19}/></div><span>Total schemes</span><strong>{loading ? "—" : items.length}</strong><small>In this workspace</small></div>
      <div className="stat-card"><div className="stat-icon blue-icon"><ClipboardCheck size={19}/></div><span>In review</span><strong>{loading ? "—" : count("IN_REVIEW")}</strong><small>Awaiting central decision</small></div>
      <div className="stat-card"><div className="stat-icon green-icon"><FilePlus2 size={19}/></div><span>Published</span><strong>{loading ? "—" : count("PUBLISHED")}</strong><small>Live approved versions</small></div>
    </div>
    <div className="section-heading"><div><h2>{isState ? "Your schemes" : "Review queue"}</h2><p>{isState ? "Track drafts and published scheme versions." : "Review submissions and make a publish decision."}</p></div>
      {isState && <Link className="primary-btn" to="/schemes/new"><FilePlus2 size={16}/> New scheme</Link>}</div>
    <div className="table-card"><div className="table-toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search scheme name or code"/></div><span className="result-count">{filtered.length} schemes</span></div>
      {error && <div className="alert error table-alert">{error}<br/><small>Confirm the backend includes the GET /api/schemes list endpoint described in README.</small></div>}
      {loading ? <div className="empty-state">Loading schemes…</div> : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon"><FileClock size={22}/></div><strong>No schemes found</strong><span>{search ? "Try another search term." : "Create a scheme or wait for a submission to appear here."}</span></div> :
      <div className="table-scroll"><table><thead><tr><th>SCHEME</th><th>VERSION</th><th>STATUS</th><th>LAST UPDATED</th><th></th></tr></thead><tbody>
        {filtered.map(item => { const v=latestOf(item); return <tr key={item._id}><td><strong>{item.name}</strong><small>{item.schemeCode}</small></td><td>{v ? `v${v.version}` : "—"}</td><td><StatusBadge status={v?.status}/></td><td>{v?.updatedAt ? new Date(v.updatedAt).toLocaleDateString("en-IN") : "—"}</td><td><Link className="row-link" to={`/schemes/${item._id}`} state={{scheme:item}} aria-label={`Open ${item.name}`}><ArrowUpRight size={17}/></Link></td></tr>; })}
      </tbody></table></div>}
    </div>
    <div className="tip-line"><ShieldCheckIcon/> {isState ? "Only central reviewers can approve and publish submitted versions." : "A reviewer cannot approve a version they created."}</div>
  </div>;
}
function ShieldCheckIcon(){return <span className="tip-icon"><ClipboardCheck size={16}/></span>}