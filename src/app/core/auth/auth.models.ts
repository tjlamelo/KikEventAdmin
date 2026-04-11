export interface AuthUser {
  id: number;
  username: string;
  email: string;
  phoneNumber?: number;
  enabled?: boolean;
  roles: string[];
}

export function normalizeRoles(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((r) => (typeof r === 'string' ? r : String((r as { name?: string }).name ?? '')));
  }
  return [];
}

export function mapMeToAuthUser(data: Record<string, unknown>): AuthUser {
  return {
    id: Number(data['id']) || 0,
    username: String(data['username'] ?? ''),
    email: String(data['email'] ?? ''),
    phoneNumber: data['phoneNumber'] != null ? Number(data['phoneNumber']) : undefined,
    enabled: data['enabled'] !== undefined ? Boolean(data['enabled']) : undefined,
    roles: normalizeRoles(data['roles'])
  };
}
