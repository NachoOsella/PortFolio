import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ExternalLink,
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
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusDot } from '@/components/ui';
import { useGitStatus } from '@/hooks/useRepositories';

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', to: '/admin', icon: LayoutDashboard },
      { label: 'Content', to: '/admin/content', icon: FileText },
      { label: 'Projects', to: '/admin/projects', icon: FolderKanban },
      { label: 'Blog posts', to: '/admin/posts', icon: FileText },
      { label: 'Pages', to: '/admin/pages', icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Files', to: '/admin/files', icon: FolderKanban },
      { label: 'Git', to: '/admin/git', icon: GitBranch },
      { label: 'Messages', to: '/admin/messages', icon: MessageSquare },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
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
      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-brand">
          <Link to="/" className="wordmark">
            <span className="wordmark-mark">IO</span>
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
              {group.items.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} />
                  <span>{!collapsed && label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </div>
        <div className="admin-side-bottom">
          <NavLink to="/" title={collapsed ? 'View website' : undefined}>
            <ExternalLink size={17} />
            {!collapsed && <span>View website</span>}
          </NavLink>
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
      <section className="admin-main">
        <header className="admin-header">
          <button
            className="admin-mobile-trigger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu size={19} />
          </button>
          <div>
            <p className="admin-breadcrumb">
              Studio / <span>{title}</span>
            </p>
            <h1>{title}</h1>
          </div>
          <div className="admin-header-actions">
            <div className="sync-chip">
              <StatusDot tone={git?.modified.length ? 'amber' : 'green'} />
              <span>
                {git?.modified.length
                  ? `${git.modified.length} local change${git.modified.length > 1 ? 's' : ''}`
                  : 'All synced'}
              </span>
            </div>
            <div className="admin-user">
              <span className="user-avatar">IO</span>
              <span>{session?.name ?? 'Ignacio'}</span>
              <ChevronRight size={14} />
            </div>
            <button
              className="collapse-button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </section>
    </div>
  );
}
