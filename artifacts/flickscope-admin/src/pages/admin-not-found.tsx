import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#010312] px-4 text-white">
      <div className="max-w-md text-center">
        <div className="mb-6 animate-bounce text-8xl" aria-hidden="true">
          🛰️
        </div>

        <h1 className="text-7xl font-black text-blue-400">404</h1>

        <h2 className="mt-5 text-2xl font-bold">Signal Lost</h2>

        <p className="mt-3 text-gray-400">
          Hmm... this page escaped from the server.
          <br />
          You do not have permission to access this page.
        </p>

        <div className="mt-6 animate-pulse text-4xl" aria-hidden="true">
          🏃‍♂️💨
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-[#4f6689] px-6 py-3 font-semibold transition hover:bg-[#7898bf]/30"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
