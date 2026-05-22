const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function registerUser(data: {
  email: string;
  password: string;
  displayName: string;
  role: 'USER' | 'ARTIST';
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Registracija nepavyko');
  }

  return result;
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Prisijungimas nepavyko');
  }

  return result;
}