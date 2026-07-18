import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 px-6 py-12 text-slate-300">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <span className="text-xl font-bold text-white">Credify</span>
          <p className="mt-3 max-w-xs text-sm text-slate-400">
            Helping professionals find real roles at real companies — verified,
            transparent, and built for clarity.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Platform</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link href="/jobs" className="hover:text-white">
                Find Jobs
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white">
                Post a Role
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Account</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link href="/login" className="hover:text-white">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white">
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-slate-700 pt-6 text-sm text-slate-500">
        © {new Date().getFullYear()} Credify. All rights reserved.
      </div>
    </footer>
  );
}
