export function getCurrentUser() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

export function getUserIdFromToken(): number | null {
  const user = getCurrentUser();
  return user?.id || null;
}

