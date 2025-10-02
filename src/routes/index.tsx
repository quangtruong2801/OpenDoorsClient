import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Settings from "../pages/Settings";
import TeamMember from "../pages/team/TeamMember";
import TeamManagement from "../pages/team/TeamManagement";
import MainLayout from "../layouts/MainLayout";
import JobManagement from "../pages/job/JobManagement";
import RecruitmentManagement from "../pages/recruitment/RecruitmentManagement";
import RecruitmentList from "../pages/recruitment/RecruitmentList";
import RecruitmentDetail from "../pages/recruitment/RecruitmentDetail";

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/team/member" element={<TeamMember />} />
        <Route path="/team/management" element={<TeamManagement />} />
        <Route path="/job/management" element={<JobManagement />} />
        <Route path="/recruitment/management" element={<RecruitmentManagement />} />
        <Route path="/recruitments" element={<RecruitmentList />} />
        <Route path="/recruitment/:id" element={<RecruitmentDetail />} />
      </Routes>
    </MainLayout>
  );
}
