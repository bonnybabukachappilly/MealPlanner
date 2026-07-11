const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const rawText = await res.clone().text();

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = JSON.parse(rawText);
    } catch {
      body = rawText;
    }
    console.error(`API ${options.method ?? 'GET'} ${path} failed (${res.status}):`, body);
    throw new ApiError(res.status, body);
  }

  if (res.status === 204 || rawText.length === 0) {
    console.log(`API ${options.method ?? 'GET'} ${path} succeeded with empty body`);
    return undefined as T;
  }

  try {
    const json = JSON.parse(rawText);
    console.log(`API ${options.method ?? 'GET'} ${path} succeeded:`, json);
    return json as T;
  } catch (err) {
    console.error(`API ${options.method ?? 'GET'} ${path} returned non-JSON body:`, rawText);
    throw err;
  }
}

export const client = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data !== undefined ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};