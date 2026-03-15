import React, { useEffect } from 'react';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  // Vérification initiale du rôle utilisateur
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Layout - User data:', userData);
        
        // Liste des routes accessibles aux admins en dehors du préfixe /admin
        const allowedNonAdminRoutes = ['/profile', '/logout', '/settings'];
        
        const currentPath = window.location.pathname;
        const isAllowedRoute = allowedNonAdminRoutes.includes(currentPath);
        
        if (userData.isAdmin && !currentPath.startsWith('/admin') && !isAllowedRoute) {
          console.log('Redirection corrective vers interface admin');
          navigate('/admin/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Erreur de vérification du rôle:', error);
      }
    };

    checkUserRole();
    
    // Ré-verification périodique au cas où
    const interval = setInterval(checkUserRole, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Récupération des données utilisateur pour l'affichage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user 
    ? `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email
    : 'Utilisateur';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/signin'; // Redirection forcée pour rafraîchir l'état
  };

  return (
    <>
      <TopNavbar userName={userName} onLogout={handleLogout} />
      <Sidebar />
      <main
        style={{
          marginLeft: 220,
          paddingTop: 56,
          paddingLeft: 20,
          paddingRight: 20,
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </>
  );
}