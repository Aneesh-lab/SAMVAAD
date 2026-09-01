const navigationItems = [
  {
    label: "Dashboard",
    icon: "dashboard",
  },
  {
    label: "Learn",
    icon: "menu_book",
  },
  {
    label: "Practice",
    icon: "sign_language",
  },
  {
    label: "Progress",
    icon: "trending_up",
  },
  {
    label: "Achievements",
    icon: "emoji_events",
  },
  {
    label: "Profile",
    icon: "person",
  },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <span className="text-2xl font-bold text-indigo-600">
            SAMVAAD
          </span>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto p-4"
          aria-label="Main navigation"
        >
          {navigationItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={onClose}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
            >
              <span
                className="material-symbols-rounded text-[22px]"
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <span
              className="material-symbols-rounded text-[22px]"
              aria-hidden="true"
            >
              logout
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;