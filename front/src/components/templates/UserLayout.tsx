import type { ReactNode } from 'react';
import { UserSidebar } from '../organisms/sidebar/userSidebar/UserSidebar';

export function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <UserSidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
