export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-green-400 mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-md p-3 mb-4 bg-slate-800"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-md p-3 mb-6 bg-slate-800"
        />

        <button className="w-full rounded-md bg-green-500 py-3 font-bold text-black">
          Login
        </button>
      </div>
    </main>
  );
}