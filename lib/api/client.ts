interface ApiError {
    message: string;
    details?: unknown;
}

export class ApiException extends Error {
    constructor(
        public status: number,
        public payload: ApiError,
    ) {
        super(payload.message);
    }
}

async function request<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const res = await fetch(path, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
        },
    });
    if (res.status === 204) return undefined as T;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new ApiException(res.status, json.error ?? { message: res.statusText });
    }
    return json.data as T;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
    del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
