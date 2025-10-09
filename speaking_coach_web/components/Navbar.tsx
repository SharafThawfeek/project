export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      <a href="/" className="text-xl font-bold text-indigo-600">🎤 AI Speaking Coach</a>
      <div className="flex gap-3">
        <a href="/login" className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">Log In</a>
        <a href="/signup" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Sign Up</a>
      </div>
    </nav>
  );
}
