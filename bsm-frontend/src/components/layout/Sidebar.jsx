import { NavLink } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";

export default function Sidebar({ 
  menu, 
  sidebarOpen = true, 
  setSidebarOpen, 
  handleLogout, 
  collapsible = true,
  widthClass = "w-64"
}) {
  const currentWidth = sidebarOpen ? widthClass : "w-20";
  
  return (
    <aside className={`${currentWidth} bg-white border-r border-slate-100 transition-all duration-300 flex flex-col shadow-sm`}>
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 font-bold text-slate-800">
          {sidebarOpen && <span className="tracking-tight text-base uppercase">Portal</span>}
        </div>
        {collapsible && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <Menu size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon size={18} className="transition-colors group-hover:text-indigo-600 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            sidebarOpen ? "justify-start px-3.5" : "justify-center"
          } gap-3 text-rose-600 hover:bg-rose-50 py-2.5 rounded-xl text-sm font-semibold transition-colors`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {sidebarOpen && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
