function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <div>
          <h1 className="text-xl font-bold text-indigo-600">
            SAMVAAD
          </h1>

          <p className="hidden text-xs text-slate-500 sm:block">
            Learn. Practice. Communicate.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          🔔
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
            U
          </div>

          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            User
          </span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;