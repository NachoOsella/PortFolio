import { useState } from 'react';
import { Check, CircleAlert, Settings2 } from 'lucide-react';
import { Button, Field, Input } from '@/components/ui';

export function AdminSettings() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Workspace / Settings</p>
          <h2>Settings</h2>
          <p>Keep the future API boundary visible while the browser mock stays simple.</p>
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
            <Field label="Name">
              <Input defaultValue="Ignacio Osella" />
            </Field>
            <Field label="Role">
              <Input defaultValue="Full-stack developer" />
            </Field>
            <Field label="Location">
              <Input defaultValue="Córdoba, Argentina" />
            </Field>
            <Field label="Email">
              <Input defaultValue="hello@ignacioosella.dev" />
            </Field>
            <Button
              onClick={() => {
                setSaved(true);
                window.setTimeout(() => setSaved(false), 1600);
              }}
            >
              {saved ? (
                <>
                  <Check size={15} />
                  Saved
                </>
              ) : (
                'Save settings'
              )}
            </Button>
          </div>
        </section>
        <section className="admin-panel security-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Security boundary</p>
              <h3>Frontend mock only</h3>
            </div>
            <CircleAlert size={18} />
          </div>
          <p>
            This browser demo never stores repository credentials, executes Git, or writes a
            production filesystem. The future Spring Boot service must own authentication with
            secure HttpOnly cookies, authorization, file locking, Git credentials, backups, conflict
            detection, and audit logs.
          </p>
          <div className="architecture-note">
            <span>React frontend</span>
            <i>↓ REST API</i>
            <span>Spring Boot backend</span>
            <i>↓</i>
            <span>Content directory + Git</span>
          </div>
        </section>
      </div>
    </div>
  );
}