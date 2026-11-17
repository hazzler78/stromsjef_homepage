import { NextRequest, NextResponse } from 'next/server';
import { readRuntimeEnv } from '@/lib/runtimeEnv';

export function getAdminPasswordExpected(): string | undefined {
  return readRuntimeEnv('ADMIN_PASSWORD');
}

/** Returns an error response if the request is not authorized; otherwise null. */
export function verifyAdminRequest(req: NextRequest): NextResponse | null {
  const expected = getAdminPasswordExpected();
  if (!expected) {
    return NextResponse.json(
      { error: 'Admin är inte konfigurerad (saknar ADMIN_PASSWORD)' },
      { status: 503 }
    );
  }

  const headerPassword = req.headers.get('x-admin-password');
  const cookiePassword = req.cookies.get('admin_password')?.value;
  const provided = headerPassword ?? cookiePassword;

  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
