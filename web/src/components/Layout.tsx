
import React, { useState } from 'react';
import { ViewState, UserRole, Member } from '../../types';
import { Icon, Button } from './Common';
import { DatePicker } from './calendar-pick';
import { useThemeStore } from '@/store/themeStore';
import { Logo } from '@/store/mockdata';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  role: UserRole;
  currentUser?: Member | { firstName: string, lastName: string, email: string, avatar: string } | null;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  toggleRole: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, role, currentUser, onNavigate, onLogout, toggleRole }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  
  const NavItem = ({ view, label, icon }: { view: ViewState; label: string; icon: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          onNavigate(view);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors ${isActive
          ? 'bg-primary/10 text-primary dark:text-gray-50 dark:bg-primary/20'
          : 'text-text-secondary dark:text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800/50'
          }`}
      >
        <Icon name={icon} className={isActive ? 'fill' : ''} />
        <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>
      </button>
    );
  };

  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-full bg-cover bg-center shrink-0 border border-gray-200 dark:border-gray-700"
            style={{ backgroundImage: `url(${currentUser?.avatar || Logo })` }}
          ></div>
          <div className="min-w-0">
            <h1 className="font-bold text-text-primary dark:text-text-light truncate">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest User'}
            </h1>
            <p className="text-xs text-text-secondary dark:text-text-muted truncate">
              {role === 'ADMIN' ? 'Administrator' : currentUser?.email || 'Member Portal'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {role === 'MEMBER' ? (
          <>
            <NavItem view="MEMBER_HOME" label="Home" icon="home" />
            <NavItem view="MEMBER_EVENTS" label="Events" icon="event" />
            <NavItem view="MEMBER_GALLERY" label="Gallery" icon="photo_library" />
            <NavItem view="MEMBER_FINANCE" label="Contributions" icon="payments" />
            <NavItem view="MEMBER_PROFILE" label="My Profile" icon="person" />
            <NavItem view="MEMBER_FEEDBACK" label="Feedback" icon="chat_bubble" />
          </>
        ) : (
          <>
            <NavItem view="ADMIN_DASHBOARD" label="Dashboard" icon="dashboard" />
            <NavItem view="ADMIN_MEMBERS" label="Members" icon="group" />
            <NavItem view="ADMIN_EVENTS" label="Events" icon="calendar_month" />
            <NavItem view="ADMIN_FINANCE" label="Budget & Finance" icon="account_balance" />
            <NavItem view="ADMIN_CONTENT" label="Content" icon="web" />
            <NavItem view="ADMIN_INBOX" label="Inbox" icon="inbox" />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 w-full text-text-secondary dark:text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm"
        >
          <Icon name={theme === 'light' ? "light_mode" : "dark_mode"} />
          {theme === "light" ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={toggleRole}
          className="flex items-center gap-3 px-3 py-2 w-full text-text-secondary dark:text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm"
        >
          <Icon name="swap_horiz" />
          Switch to {role === 'MEMBER' ? 'Admin' : 'Member'}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm"
        >
          <Icon name="logout" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-card-dark">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar for Mobile/Tablet */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card-light dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10">
          <Button variant="ghost" size="sm" icon="menu" onClick={() => setIsMobileMenuOpen(true)} />
          <span className="font-extrabold text-sm text-red-700 dark:text-primary">Association Liberian in Musanze (ALM)</span>
          <div className="w-8" /> {/* Spacer */}
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
function useEffect(arg0: () => void, arg1: ("light" | "dark")[]) {
  throw new Error('Function not implemented.');
}

