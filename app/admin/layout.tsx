import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminSideNav } from "@/components/admin/AdminSideNav";

export const metadata: Metadata = {
  title: "Admin — NILPro",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="admin-shell">
      <AdminSideNav />
      <main className="admin-main">{children}</main>
    </div>
  );
}
