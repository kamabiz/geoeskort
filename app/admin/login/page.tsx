import { LoginForm } from '@/components/admin/LoginForm';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLoginPage() {
  if (await getSession()) redirect('/admin/');

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <span className="admin-login__logo">GEO<span>ESKORT</span></span>
          <p>Blog Admin</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
