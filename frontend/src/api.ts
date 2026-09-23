const BASE = '';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch { /* keep statusText */ }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export interface User {
  id: number;
  email: string;
  username: string | null;
  display_name: string | null;
}

export interface CardRecord {
  id: number;
  config: string;
  html: string;
  published: boolean;
  username: string | null;
  public_url: string | null;
  created_at: string;
  updated_at: string;
}

export const api = {
  signup: (email: string, password: string) =>
    request<User>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    request<User>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: () => request<User>('/api/auth/me'),
  claimUsername: (username: string) =>
    request<User>('/api/auth/username', { method: 'PUT', body: JSON.stringify({ username }) }),

  listCards: () => request<CardRecord[]>('/api/cards'),
  createCard: (config: string, html: string) =>
    request<CardRecord>('/api/cards', { method: 'POST', body: JSON.stringify({ config, html }) }),
  updateCard: (id: number, config: string, html: string) =>
    request<CardRecord>(`/api/cards/${id}`, { method: 'PUT', body: JSON.stringify({ config, html }) }),
  publishCard: (id: number, username: string) =>
    request<CardRecord>(`/api/cards/${id}/publish`, { method: 'POST', body: JSON.stringify({ username }) }),
  deleteCard: (id: number) =>
    request<{ ok: boolean }>(`/api/cards/${id}`, { method: 'DELETE' }),
  usernameAvailable: (u: string) =>
    request<{ available: boolean }>(`/api/cards/username-available?u=${encodeURIComponent(u)}`),

  uploadMedia: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/media/upload', { method: 'POST', body: form, credentials: 'include' });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const data = await res.json();
        detail = data.detail || detail;
      } catch { /* keep */ }
      throw new ApiError(res.status, detail);
    }
    const data = (await res.json()) as { url: string };
    return data.url;
  },
};

export function publicCardUrl(username: string): string {
  if (import.meta.env.DEV) {
    return `http://localhost:8000/${username}`;
  }
  return `/${username}`;
}
