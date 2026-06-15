import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Beaker,
  Shuffle,
  Gauge,
  Flame,
  Target,
  Droplet,
  Ruler,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/utils';

const menuItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/mixing-powder', label: '粉末配料', icon: Beaker },
  { path: '/blending', label: '混料制粒', icon: Shuffle },
  { path: '/pressing', label: '压制成型', icon: Gauge },
  { path: '/sintering', label: '高温烧结', icon: Flame },
  { path: '/sizing', label: '复压整形', icon: Target },
  { path: '/impregnation', label: '浸油处理', icon: Droplet },
  { path: '/inspection', label: '尺寸检验', icon: Ruler },
  { path: '/furnace-ledger', label: '炉次台账', icon: BookOpen },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'h-screen bg-slate-800 text-white flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      <div
        className={cn(
          'h-16 flex items-center justify-center border-b border-slate-700 font-bold text-lg',
          sidebarCollapsed ? 'px-2' : 'px-4'
        )}
      >
        {!sidebarCollapsed ? (
          <span className="text-blue-400">粉末冶金管理系统</span>
        ) : (
          <span className="text-blue-400 text-sm">PM</span>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={toggleSidebar}
        className="h-12 flex items-center justify-center border-t border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight size={20} />
        ) : (
          <ChevronLeft size={20} />
        )}
      </button>
    </aside>
  );
}
