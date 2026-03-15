import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { FileText, LayoutDashboard, Share2, Plus, User, LogOut, FolderOpen, Users } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.isAdmin || false;
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <div className="sidebar d-flex flex-column p-3 text-white">
      <h4 className="mb-4 d-flex align-items-center">
        <FolderOpen size={24} style={{ marginRight: '8px' }} />
        DocManager
      </h4>

      <Nav className="flex-column">
        {/* Dashboard link - different for admin/users */}
        <Nav.Link
          as={Link}
          to={isAdmin ? "/admin/dashboard" : "/dashboard"}
          className={`d-flex align-items-center text-white ${
            isActive(isAdmin ? '/admin/dashboard' : '/dashboard') ? 'active' : ''
          }`}
        >
          <LayoutDashboard size={20} className="me-2" />
          Dashboard
        </Nav.Link>

        {/* Regular user links */}
        {!isAdmin && (
          <>
            <Nav.Link
              as={Link}
              to="/documents"
              className={`d-flex align-items-center text-white ${isActive('/documents') ? 'active' : ''}`}
            >
              <FileText size={20} className="me-2" />
              Mes documents
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/shared"
              className={`d-flex align-items-center text-white ${isActive('/shared') ? 'active' : ''}`}
            >
              <Share2 size={20} className="me-2" />
              Documents partagés
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/add"
              className={`d-flex align-items-center text-white ${isActive('/add') ? 'active' : ''}`}
            >
              <Plus size={20} className="me-2" />
              Ajouter un document
            </Nav.Link>
          </>
        )}

        {/* Admin links */}
        {isAdmin && (
          <>
            {/* Page Créer un projet */}
              <Nav.Link
                as={Link}
                to="/admin/create-project"
                className={`d-flex align-items-center text-white ${isActive('/admin/create-project') ? 'active' : ''}`}
              >
                <Plus size={20} className="me-2" />
                Créer un projet
              </Nav.Link>

              {/* Page Créer une équipe */}
              <Nav.Link
                as={Link}
                to="/admin/create-team"
                className={`d-flex align-items-center text-white ${isActive('/admin/create-team') ? 'active' : ''}`}
              >
                <Plus size={20} className="me-2" />
                Créer une équipe
              </Nav.Link>


            {/* Page Créer un utilisateur */}
            <Nav.Link
              as={Link}
              to="/admin/create-user"
              className={`d-flex align-items-center text-white ${isActive('/admin/create-user') ? 'active' : ''}`}
            >
              <User size={20} className="me-2" />
              Créer un utilisateur
            </Nav.Link>

            {/* Page Liste des utilisateurs */}
            <Nav.Link
              as={Link}
              to="/admin/users"
              className={`d-flex align-items-center text-white ${isActive('/admin/users') ? 'active' : ''}`}
            >
              <User size={20} className="me-2" />
              Liste des utilisateurs
            </Nav.Link>

            {/* Page Liste des projets & équipes */}
            <Nav.Link
              as={Link}
              to="/admin/projects-teams"
              className={`d-flex align-items-center text-white ${isActive('/admin/projects-teams') ? 'active' : ''}`}
            >
              <Users size={20} className="me-2" />
              Liste des projets et des équipes
            </Nav.Link>
          </>
        )}

        {/* Common link for all users */}
        <Nav.Link
          as={Link}
          to="/profile"
          className={`d-flex align-items-center text-white ${isActive('/profile') ? 'active' : ''}`}
        >
          <User size={20} className="me-2" />
          Profil
        </Nav.Link>
      </Nav>
       
      {/* Logout */}
      <div className="mt-auto">
        <Nav.Link
          as="button"
          className="d-flex align-items-center text-white"
          onClick={handleLogout}
        >
          <LogOut size={20} className="me-2" />
          Se déconnecter
        </Nav.Link>
      </div>
    </div>
  );
}