// Utilities for parsing tokens from Set-Cookie headers

export const extractTokenFromCookie = (
  cookieHeader: string[] | string | undefined,
  isAccess: boolean,
): string | null => {
  if (!cookieHeader) return null;
  const key = isAccess ? 'Authentication' : 'Refresh';

  const entries = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];

  const match = entries.find(
    c => typeof c === 'string' && c.includes(`${key}=`),
  );
  if (!match) return null;
  const parts = match.split(`${key}=`);
  if (parts.length < 2) return null;
  return parts[1].split(';')[0] || null;
};
