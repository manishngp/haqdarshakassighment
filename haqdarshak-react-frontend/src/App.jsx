import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateScheme from "./pages/CreateScheme";
import SchemeDetails from "./pages/SchemeDetails";

export default function App(){
  return <AuthProvider><Routes>
    <Route path="/login" element={<Login/>}/>
    <Route element={<ProtectedRoute/>}><Route element={<Layout/>}>
      <Route index element={<Dashboard/>}/>
      <Route element={<ProtectedRoute roles={["STATE_REVIEWER"]}/>}>
        <Route path="/schemes/new" element={<CreateScheme/>}/>
      </Route>
      <Route path="/schemes/:schemeId" element={<SchemeDetails/>}/>
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></AuthProvider>;
}