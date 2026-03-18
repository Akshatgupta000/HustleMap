import Navbar from "./Navbar";

export default function AppLayout({ onLogout, children }) {
  return (
    <div className="min-h-screen bg-notion-bg text-notion-text">
      <div className="flex">
        <Navbar onLogout={onLogout} />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

