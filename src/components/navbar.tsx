"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string; role: string } | null;

export function Navbar() {
  const [user, setUser] = useState<User>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-amber-600">
            <span className="text-2xl">🏗️</span>
            <span>EquipRent</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/machines"
              className={`text-sm font-medium transition-colors ${
                pathname === "/machines" ? "text-amber-600" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Browse Machines
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith("/dashboard") ? "text-amber-600" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === "owner" && (
                  <Link
                    href="/dashboard/listings/new"
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
                  >
                    + List Machine
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                  >
                    <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {user.name[0]}
                    </span>
                    <span className="font-medium">{user.name}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        <p className="text-sm font-medium truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                        Dashboard
                      </Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-3">
            <Link href="/machines" className="block text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
              Browse Machines
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={logout} className="block text-sm font-medium text-red-600">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm font-medium text-slate-600" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/register" className="block text-sm font-medium text-amber-600" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
