import { getToken } from '../utils/auth';

const API_URL = 'http://localhost:3000';

export async function createPurchase(data: {
  assetId: string;
  licenseId: string;
}) {
  const token = getToken();

  const response = await fetch(`${API_URL}/purchases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Nepavyko sukurti pirkimo');
  }

  return result;
}

export async function getMyPurchases() {
  const token = getToken();

  const response = await fetch(`${API_URL}/purchases/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Nepavyko gauti pirkimų');
  }

  return result;
}