import { fail, redirect } from '@sveltejs/kit';

import { encodeSession, landingFor, SESSION_COOKIE } from '#lib/server/session';

import type { Actions, PageServerLoad } from './$types';

type Account = {
  password: string;
  employeeId: bigint;
  role: string;
  centerCode: string;
  landing: string;
};

// Stub accounts for the demo. Employee ids 1 and 2 come from
// src/prisma/seed.ts; verified_by is a foreign key to employee, so the id has
// to exist in the database.
const accounts: Record<string, Account> = {
  admin: {
    password: 'admin',
    employeeId: 2n,
    role: 'QUAN_LY',
    centerCode: 'TT01',
    landing: '/duyetPhieuBaoHanh',
  },
  employee: {
    password: 'employee',
    employeeId: 1n,
    role: 'NHAN_VIEN',
    centerCode: 'TT01',
    landing: '/traCuuKhachHang',
  },
};

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.employee) {
    redirect(303, landingFor(locals.employee.role));
  }
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = String(data.get('username') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const account = accounts[username];

    if (!account || account.password !== password) {
      return fail(400, {
        username,
        message: 'Sai ten dang nhap hoac mat khau',
      });
    }

    cookies.set(
      SESSION_COOKIE,
      encodeSession(account),
      {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
      },
    );

    redirect(303, account.landing);
  },
};
