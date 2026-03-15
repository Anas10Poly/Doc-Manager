import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AdminCheck = ({ children }: { children: JSX.Element }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        console.log('AdminCheck - Données utilisateur:', user);
        console.log('AdminCheck - isAdmin?', user.isAdmin === true);
        
        setIsAdmin(user.isAdmin === true);
      } catch (error) {
        console.error('Erreur lors de la vérification admin:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    // Écouter les changements dans localStorage
    const handleStorageChange = () => {
      checkAdminStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('AdminCheck: Non-admin redirigé vers /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminCheck;