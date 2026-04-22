import { getToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  const response = await fetch(`${API_URL}/assets/${id}`, {
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

export async function getMyUploads() {
  const token = getToken();
  const response = await fetch(`${API_URL}/assets/my-uploads`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Nepavyko gauti jūsų kūrinių');
  }

  return response.json();
}

export async function updateAsset(id: string, payload: Record<string, unknown>) {
  const token = getToken();
  const response = await fetch(`${API_URL}/assets/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Nepavyko atnaujinti kūrinio');
  }

  return result;
}
