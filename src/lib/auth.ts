import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export function getCurrentMerchant() {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.SESSION_SECRET!);
    return payload as { merchantId: string; email: string };
  } catch {
    return null;
  }
}
