import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Not authorized</h1>
      <p className="text-slate-500">
        You don&apos;t have permission to view this page.
      </p>
      <Link href="/" className="mt-2 text-sm text-blue-700 underline">
        Back to home
      </Link>
    </div>
  );
}
