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
import PrivateRouter from "../layouts/PrivateRoute";
import LoginPage from "../pages/LoginPage";
import ApplicationForm from "../pages/application/ApplicationForm";
import ApplicationManagement from "../pages/application/ApplicationManagement";

interface AppRoutesProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AppRoutes({ isDark, setIsDark }: AppRoutesProps) {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Các route có chung layout MainLayout */}
      <Route element={<MainLayout isDark={isDark} setIsDark={setIsDark} />}>
        {/* Public pages trong layout */}
        <Route path="/recruitments" element={<RecruitmentList />} />
        <Route path="/recruitment/:id" element={<RecruitmentDetail />} />
        <Route path="/apply" element={<ApplicationForm />} />

        {/* Private routes */}
        <Route element={<PrivateRouter />}>
          <Route index element={<Home />} /> {/* / */}
          <Route path="settings" element={<Settings />} />

          {/* Các route dành riêng cho admin */}
          <Route element={<PrivateRouter adminOnly />}>
            <Route path="team">
              <Route path="member" element={<TeamMember />} />
              <Route path="management" element={<TeamManagement />} />
            </Route>

            <Route path="job/management" element={<JobManagement />} />
            <Route path="recruitment/management" element={<RecruitmentManagement />} />
            <Route path="application/management" element={<ApplicationManagement />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
