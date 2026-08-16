import { CircleAlert, Settings2 } from 'lucide-react';
import { metadata } from '@/app/metadata';

export function AdminSettings() {
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Workspace / Settings</p>
          <h2>Settings</h2>
          <p>Identity and security are configured in code and in the backend environment, not from this page.</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="admin-panel settings-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Public profile</p>
              <h3>Site identity</h3>
            </div>
            <Settings2 size={18} />
          </div>
          <div className="settings-form">
            <div className="settings-readonly">
              <span>Name</span>
              <strong>{metadata.name}</strong>
            </div>
            <div className="settings-readonly">
              <span>Role</span>
              <strong>{metadata.role}</strong>
            </div>
            <div className="settings-readonly">
              <span>Location</span>
              <strong>{metadata.location}</strong>
            </div>
            <div className="settings-readonly">
              <span>Email</span>
              <strong>nachoosella7@gmail.com</strong>
            </div>
            <p className="settings-note">
              These values are defined in <code>src/app/metadata.ts</code> and the content files. To
              change them, edit the source and redeploy.
            </p>
          </div>
        </section>
        <section className="admin-panel security-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Security boundary</p>
              <h3>Backend security boundary</h3>
            </div>
            <CircleAlert size={18} />
          </div>
          <p>
            The browser never stores repository credentials, executes Git, or writes a production
            filesystem. The Spring Boot service owns authentication with secure HttpOnly cookies,
            authorization, Markdown validation, GitHub synchronization, and conflict handling.
          </p>
          <div className="architecture-note">
            <span>React frontend</span>
            <i>↓ REST API</i>
            <span>Spring Boot backend</span>
            <i>↓</i>
            <span>GitHub Markdown files</span>
          </div>
        </section>
      </div>
    </div>
  );
}