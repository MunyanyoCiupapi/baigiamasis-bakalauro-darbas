import { getToken } from '../utils/auth';

const API_URL = 'http://localhost:3000';

export async function createAsset(formData: FormData) {
  const token = getToken();

  const response = await fetch(`${API_URL}/assets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Nepavyko įkelti kūrinio');
  }

  return result;
}

export async function getAssets() {
  const response = await fetch(`${API_URL}/assets`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Nepavyko gauti kūrinių');
  }

  return result;
}

export async function deleteAsset(id: string) {
  const token = getToken();

  const response = await fetch(`${API_URL}/assets/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Nepavyko ištrinti kūrinio');
  }

  return result;
}

export async function getAssetById(id: string) {
  const token = getToken();

  const response = await fetch(`http://localhost:3000/assets/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Nepavyko gauti kūrinio');
  }

  return result;
}