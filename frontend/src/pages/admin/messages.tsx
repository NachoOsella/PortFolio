import { useState } from 'react';
import { ArrowUpRight, Inbox, MoreHorizontal } from 'lucide-react';
import { relativeDate } from '@/lib/content';
import { getMessages, saveMessages } from '@/services/messages';
import { apiEnabled } from '@/repositories/apiClient';
import { Badge, Button, EmptyState } from '@/components/ui';
import type { ContactMessage } from '@/types';

function DemoMessages({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [selected, setSelected] = useState(messages[0]?.id);
  const current = messages.find((message) => message.id === selected);
  const markRead = (id: string) => {
    const next = messages.map((message) =>
      message.id === id ? { ...message, status: 'read' as const } : message,
    );
    setMessages(next);
    saveMessages(next);
  };
  return (
    <>
      <div className="demo-badge">Demo inbox — sample messages, not real submissions</div>
      <div className="messages-layout">
        <section className="message-list">
          {messages.map((message) => (
            <button
              className={`message-list-item ${message.id === selected ? 'active' : ''}`}
              key={message.id}
              onClick={() => {
                setSelected(message.id);
                markRead(message.id);
              }}
            >
              <span className={`message-unread ${message.status === 'new' ? 'is-new' : ''}`} />
              <div>
                <strong>{message.name}</strong>
                <span>{message.subject}</span>
                <small>{relativeDate(message.createdAt)}</small>
              </div>
            </button>
          ))}
        </section>
        <section className="admin-panel message-detail">
          {current ? (
            <>
              <div className="message-detail-head">
                <div>
                  <p className="panel-kicker">{current.status}</p>
                  <h3>{current.subject}</h3>
                  <span>
                    {current.name} · {current.email}
                    {current.company ? ` · ${current.company}` : ''}
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal size={17} />
                </Button>
              </div>
              <p className="message-body">{current.message}</p>
              <a
                className="button button-secondary"
                href={`mailto:${current.email}?subject=Re: ${current.subject}`}
              >
                Reply by email <ArrowUpRight size={15} />
              </a>
            </>
          ) : (
            <EmptyState title="Select a message" description="Choose a message from the inbox." />
          )}
        </section>
      </div>
    </>
  );
}

function NoRealInbox() {
  return (
    <div className="admin-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Inbox</p>
          <h3>No inbox configured</h3>
        </div>
        <Inbox size={18} />
      </div>
      <div className="messages-empty">
        <p>
          The contact form on the public site opens a draft in the visitor's own email application —
          it does not send submissions to this Studio. Messages are a demo workspace of the
          frontend-only mock; with the Spring Boot API enabled there is no mailbox to read here.
        </p>
        <p>
          If you want to receive messages in a real inbox, point the contact form at a mail service
          and remove this page.
        </p>
      </div>
    </div>
  );
}

export function AdminMessages() {
  const demo = !apiEnabled;
  const unreadCount = demo ? getMessages().filter((message) => message.status === 'new').length : 0;
  return (
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">Inbox / {demo ? `${unreadCount} new` : 'not connected'}</p>
          <h2>Messages</h2>
          <p>
            {demo
              ? 'A demo of a calm place for conversations that start outside the editor.'
              : 'The public contact form opens an email draft; nothing is stored here.'}
          </p>
        </div>
        {demo && (
          <Badge tone="accent">
            <Inbox size={14} />
            {unreadCount} unread
          </Badge>
        )}
      </div>
      {demo ? <DemoMessages initialMessages={getMessages()} /> : <NoRealInbox />}
    </div>
  );
}