import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Settings from "../pages/Settings";
import TeamMember from "../pages/team/TeamMember";
import TeamManagement from "../pages/team/TeamManagement";
import MainLayout from "../layouts/MainLayout";
import JobManagement from "../pages/job/JobManagement";

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/team/member" element={<TeamMember />} />
        <Route path="/team/management" element={<TeamManagement />} />
        <Route path="/job/management" element={<JobManagement />} />
      </Routes>
    </MainLayout>
  );
}
