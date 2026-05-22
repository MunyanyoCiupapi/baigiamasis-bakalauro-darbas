export type LoggedUser = {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ARTIST';
  createdAt: string;
};

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'loggedUser';

export function saveAuth(token: string, user: LoggedUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): LoggedUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}