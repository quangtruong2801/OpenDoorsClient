// routes/AppRoutes.tsx
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
import type { ReactNode } from "react";

// Khai báo kiểu props cho component
interface AppRoutesProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AppRoutes({ isDark, setIsDark }: AppRoutesProps) {
  // Khai báo kiểu cho hàm wrap
  const wrap = (element: ReactNode) => (
    <MainLayout isDark={isDark} setIsDark={setIsDark}>
      {element}
    </MainLayout>
  );

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={wrap(<Home />)} />
      <Route path="/recruitments" element={wrap(<RecruitmentList />)} />
      <Route path="/recruitment/:id" element={wrap(<RecruitmentDetail />)} />
      <Route path="/apply" element={wrap(<ApplicationForm />)} />

      {/* Private pages (admin only) */}
      <Route
        path="/settings"
        element={<PrivateRouter adminOnly>{wrap(<Settings />)}</PrivateRouter>}
      />
      <Route
        path="/team/member"
        element={<PrivateRouter adminOnly>{wrap(<TeamMember />)}</PrivateRouter>}
      />
      <Route
        path="/team/management"
        element={
          <PrivateRouter adminOnly>{wrap(<TeamManagement />)}</PrivateRouter>
        }
      />
      <Route
        path="/job/management"
        element={<PrivateRouter adminOnly>{wrap(<JobManagement />)}</PrivateRouter>}
      />
      <Route
        path="/recruitment/management"
        element={
          <PrivateRouter adminOnly>{wrap(<RecruitmentManagement />)}</PrivateRouter>
        }
      />
      <Route
        path="/application/management"
        element={
          <PrivateRouter adminOnly>{wrap(<ApplicationManagement />)}</PrivateRouter>
        }
      />
    </Routes>
  );
}
