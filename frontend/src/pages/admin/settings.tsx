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
          <p>Configure the backend outside the browser and keep repository credentials server-side.</p>
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