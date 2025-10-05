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

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/recruitments"
        element={
          <MainLayout>
            <RecruitmentList />
          </MainLayout>
        }
      />
      <Route
        path="/recruitment/:id"
        element={
          <MainLayout>
            <RecruitmentDetail />
          </MainLayout>
        }
      />

      {/* Private pages (admin only) */}
      <Route
        path="/settings"
        element={
          <PrivateRouter adminOnly>
            <MainLayout>
              <Settings />
            </MainLayout>
          </PrivateRouter>
        }
      />
      <Route
        path="/team/member"
        element={
          <PrivateRouter adminOnly>
            <MainLayout>
              <TeamMember />
            </MainLayout>
          </PrivateRouter>
        }
      />
      <Route
        path="/team/management"
        element={
          <PrivateRouter adminOnly>
            <MainLayout>
              <TeamManagement />
            </MainLayout>
          </PrivateRouter>
        }
      />
      <Route
        path="/job/management"
        element={
          <PrivateRouter adminOnly>
            <MainLayout>
              <JobManagement />
            </MainLayout>
          </PrivateRouter>
        }
      />
      <Route
        path="/recruitment/management"
        element={
          <PrivateRouter adminOnly>
            <MainLayout>
              <RecruitmentManagement />
            </MainLayout>
          </PrivateRouter>
        }
      />
    </Routes>
  );
}
