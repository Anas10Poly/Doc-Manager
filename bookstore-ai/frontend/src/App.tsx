import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import SharedDocuments from './pages/SharedDocuments';
import SharedDocumentDetails from './pages/SharedDocumentDetails';
import DocumentDetails from './pages/DocumentDetails';
import AddDocumentPage from './pages/AddDocumentPage';
import EditDocumentPage from './pages/EditDocumentPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import PrivateRoute from './routes/PrivateRoute'; 
import AdminCheck from './components/AdminCheck';
import UsersListPage from './pages/admin/UsersListPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateUserPage from './pages/admin/CreateUserPage';
import ProjectsTeamsListPage from './pages/admin/ProjectsTeamsListPage';
import CreateProject from './pages/admin/CreateProject';
import CreateTeam from './pages/admin/CreateTeam';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* User routes */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } 
        />
        
        {/* Documents route with nested details */}
        <Route 
          path="/documents" 
          element={
            <PrivateRoute>
              <Layout>
                <Documents />
                <Outlet />
              </Layout>
            </PrivateRoute>
          } 
        >
          <Route path=":id" element={<DocumentDetails />} />
        </Route>

        <Route 
          path="/shared" 
          element={
            <PrivateRoute>
              <Layout>
                <SharedDocuments />
                <Outlet />
              </Layout>
            </PrivateRoute>
          } 
        >
          <Route path=":id" element={<SharedDocumentDetails />} />
        </Route>
        
        <Route 
          path="/add" 
          element={
            <PrivateRoute>
              <Layout>
                <AddDocumentPage />
              </Layout>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/edit/:id" 
          element={
            <PrivateRoute>
              <Layout>
                <EditDocumentPage />
              </Layout>
            </PrivateRoute>
          } 
        />

        {/* Profile route - ACCESSIBLE À TOUS LES UTILISATEURS CONNECTÉS (users ET admins) */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          } 
        />

        {/* Admin routes - PROTÉGÉES PAR AdminCheck */}
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute>
              <AdminCheck>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminCheck>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/admin/create-project" 
          element={
            <PrivateRoute>
              <AdminCheck>
                <Layout>
                  <CreateProject />
                </Layout>
              </AdminCheck>
            </PrivateRoute>
          } 
        />

        <Route 
          path="/admin/create-team" 
          element={
            <PrivateRoute>
              <AdminCheck>
                <Layout>
                  <CreateTeam />
                </Layout>
              </AdminCheck>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/admin/create-user" 
          element={
            <PrivateRoute>
              <AdminCheck>
                <Layout>
                  <CreateUserPage />
                </Layout>
              </AdminCheck>
            </PrivateRoute>
          } 
        />
       
        <Route 
          path="/admin/users" 
          element={
            <PrivateRoute>
              <AdminCheck>
                <Layout>
                  <UsersListPage />
                </Layout>
              </AdminCheck>
            </PrivateRoute>
          } 
        />
        
        {/* Page principale avec modals intégrés */}
        <Route 
          path="/admin/projects-teams" 
          element={
            <PrivateRoute>
              <AdminCheck>
                <Layout>
                  <ProjectsTeamsListPage />
                </Layout>
              </AdminCheck>
            </PrivateRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;