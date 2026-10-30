import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FilePlus2, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const stateRole = user?.role === "STATE_REVIEWER";
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">H</div><div><strong>haqdarshak</strong><small>SCHEME KNOWLEDGE BASE</small></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>
        <NavLink to="/" end><LayoutDashboard size={17}/> Overview</NavLink>
        {stateRole && <NavLink to="/schemes/new"><FilePlus2 size={17}/> Create scheme</NavLink>}
      </nav>
      <div className="sidebar-bottom"><div className="secure-note"><ShieldCheck size={17}/><span>Role-based access enabled</span></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><span className="crumb">Workspace</span><span className="crumb-sep">/</span><strong>{stateRole ? "State review" : "Central review"}</strong></div>
        <div className="user-menu"><div className="avatar"><UserRound size={17}/></div><div className="user-copy"><strong>{user?.name || "Reviewer"}</strong><small>{stateRole ? "State Reviewer" : "Central Reviewer"}</small></div><button className="icon-button" title="Sign out" onClick={() => { logout(); navigate("/login"); }}><LogOut size={17}/></button></div>
      </header>
      <section className="page-content"><Outlet/></section>
    </main>
  </div>;
}