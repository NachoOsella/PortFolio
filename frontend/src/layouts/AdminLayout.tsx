import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusDot } from '@/components/ui';
import { SignatureMark } from '@/components/SignatureMark';
import { useGitStatus } from '@/hooks/useRepositories';

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', code: 'L-00', to: '/admin', icon: LayoutDashboard },
      { label: 'Content', code: 'D-01', to: '/admin/content', icon: FileText },
      { label: 'Projects', code: 'P-02', to: '/admin/projects', icon: FolderKanban },
      { label: 'Blog posts', code: 'N-03', to: '/admin/posts', icon: FileText },
      { label: 'About me', code: 'A-04', to: '/admin/about', icon: UserRound },
      { label: 'Pages', code: 'D-05', to: '/admin/pages', icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Files', code: 'F-06', to: '/admin/files', icon: FolderKanban },
      { label: 'Git', code: 'G-07', to: '/admin/git', icon: GitBranch },
      { label: 'Messages', code: 'M-08', to: '/admin/messages', icon: MessageSquare },
      { label: 'Settings', code: 'S-09', to: '/admin/settings', icon: Settings },
    ],
  },
];
export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: git } = useGitStatus();
  const title =
    location.pathname === '/admin'
      ? 'Overview'
      : (navGroups
          .flatMap((group) => group.items)
          .find((item) => location.pathname.startsWith(item.to) && item.to !== '/admin')?.label ??
        'Workspace');
  const exit = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <div className={`admin-app ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Admin workspace navigation"
      >
        <div className="admin-brand">
          <Link to="/" className="admin-brand-link" aria-label="Return to Ignacio Osella portfolio">
            <SignatureMark className="admin-brand-mark" />
            {!collapsed && <span>Studio</span>}
          </Link>
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="admin-side-scroll">
          {navGroups.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <p>{!collapsed && group.label}</p>
              {group.items.map(({ label, code, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} />
                  {!collapsed && <span className="admin-nav-code">{code}</span>}
                  <span>{!collapsed && label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </div>
        <div className="admin-side-bottom">
          <div className="admin-account">
            <div className="admin-user">
              <span className="user-avatar">IO</span>
              {!collapsed && <span>{session?.name ?? 'Ignacio'}</span>}
            </div>
            <button
              className="collapse-button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
          <button onClick={exit} title={collapsed ? 'Log out' : undefined}>
            <LogOut size={17} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="admin-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}
      <div className="admin-main">
        <header className="admin-header">
          <button
            className="admin-mobile-trigger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            aria-controls="admin-sidebar"
            aria-expanded={mobileOpen}
          >
            <Menu size={19} />
          </button>
          <div className="admin-header-record">
            <p className="admin-breadcrumb">
              Private studio / <span>Content ledger</span>
            </p>
            <h1>{title}</h1>
            <span>WORKING / LOCAL</span>
          </div>
          <div className="admin-header-actions">
            <div className="sync-chip" aria-label="Repository status">
              <StatusDot tone={git?.modified.length ? 'amber' : 'green'} />
              <span>
                {git?.modified.length
                  ? `${git.modified.length} local change${git.modified.length > 1 ? 's' : ''}`
                  : 'All synced'}
              </span>
            </div>
          </div>
        </header>
        <main id="main-content" className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
