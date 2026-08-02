import { useState } from 'react';
import { ArrowUpRight, Inbox, MoreHorizontal } from 'lucide-react';
import { relativeDate } from '@/lib/content';
import { getMessages, saveMessages } from '@/services/messages';
import { Badge, Button, EmptyState } from '@/components/ui';

export function AdminMessages() {
  const [messages, setMessages] = useState(getMessages);
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
    <div className="admin-page">
      <div className="admin-intro">
        <div>
          <p className="admin-eyebrow">
            Inbox / {messages.filter((message) => message.status === 'new').length} new
          </p>
          <h2>Messages</h2>
          <p>A calm place for the conversations that start outside the editor.</p>
        </div>
        <Badge tone="accent">
          <Inbox size={14} />
          {messages.filter((message) => message.status === 'new').length} unread
        </Badge>
      </div>
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
    </div>
  );
}