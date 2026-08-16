import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Check, Copy, Mail, Send } from 'lucide-react';
import { z } from 'zod';
import { SignatureMark } from '@/components/SignatureMark';
import { Seo } from '@/components/Seo';
import { Button, Field, Input, Textarea } from '@/components/ui';

const CONTACT_ADDRESS = 'nachoosella7@gmail.com';

const contactSchema = z.object({
  name: z.string().min(2, 'Tell me your name.'),
  email: z.string().email('Enter a valid email address.'),
  subject: z.string().min(4, 'Add a short subject.'),
  message: z.string().min(20, 'A little more detail will help.').max(1200, 'Keep the message under 1200 characters.'),
});
type ContactValues = z.infer<typeof contactSchema>;

function composeMailto(values: ContactValues) {
  const subject = encodeURIComponent(values.subject);
  const body = encodeURIComponent(`${values.message}\n\nFrom: ${values.name} <${values.email}>`);
  return `mailto:${CONTACT_ADDRESS}?subject=${subject}&body=${body}`;
}

export function ContactPage() {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [sentValues, setSentValues] = useState<ContactValues | null>(null);
  const [copied, setCopied] = useState<'address' | 'message' | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  const submit = (values: ContactValues) => {
    setSentValues(values);
    setStatus('success');
    reset();
    // Opens the visitor's own mail client; no message is transmitted anywhere
    // until the visitor sends it from their email application.
    window.location.href = composeMailto(values);
  };
  const copyText = async (kind: 'address' | 'message', value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="v2-contact v2-page-top">
      <Seo title="Contact" description="Contact Ignacio Osella about a backend, full-stack or product engineering opportunity." path="/contact" />
      <motion.div
        className="v2-shell v2-contact-layout"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="v2-contact-intro">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Make the hard part easier to see.
          </motion.h1>
          <p>Tell me what is taking shape, where the tension is, and what you need the work to make possible.</p>
          <div className="v2-contact-links">
            <a href={`mailto:${CONTACT_ADDRESS}`}><Mail size={17} /> {CONTACT_ADDRESS}</a>
            <span>Usually replies within two working days.</span>
          </div>
          <motion.div
            className="v2-contact-poster"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span>Context / constraint / change</span>
            <p>Good work begins when we can name the real question.</p>
            <SignatureMark className="v2-contact-poster-mark" />
          </motion.div>
        </div>
        <motion.div
          className="v2-contact-form-wrap"
          initial={reduceMotion ? false : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="v2-contact-form-opening">
            <h2>Start with the version you have.</h2>
            <p>A rough note, an unresolved decision or a problem worth untangling is enough.</p>
          </div>
          {status === 'success' && sentValues ? (
            <div className="v2-success" role="status">
              <Check size={28} />
              <h2>Your email draft is ready.</h2>
              <p>
                Your email application should now show the draft addressed to {CONTACT_ADDRESS}.
                If nothing opened, copy the message below and send it manually.
              </p>
              <div className="v2-success-actions">
                <Button type="button" onClick={() => void copyText('address', CONTACT_ADDRESS)}>
                  {copied === 'address' ? <Check size={15} /> : <Mail size={15} />}
                  {copied === 'address' ? 'Copied' : 'Copy email address'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    void copyText('message', `${sentValues.message}\n\nFrom: ${sentValues.name} <${sentValues.email}>`)
                  }
                >
                  {copied === 'message' ? <Check size={15} /> : <Copy size={15} />}
                  {copied === 'message' ? 'Copied' : 'Copy message'}
                </Button>
              </div>
              <Button type="button" variant="ghost" onClick={() => setStatus('idle')}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(submit)}>
              <div className="v2-contact-short-fields">
                <Field label="Your name" error={errors.name?.message}><Input {...register('name')} autoComplete="name" placeholder="How should I address you?" /></Field>
                <Field label="Email" error={errors.email?.message}><Input {...register('email')} type="email" autoComplete="email" placeholder="you@company.com" /></Field>
              </div>
              <Field label="What are we looking at?" error={errors.subject?.message}><Input {...register('subject')} placeholder="A product, a system, a difficult decision..." /></Field>
              <Field label="Give me the context" error={errors.message?.message}><Textarea {...register('message')} rows={8} placeholder="What is happening now, where does it become unclear, and what would a better outcome change?" /></Field>
              <div className="v2-contact-form-footnote">
                <span>Useful, not polished.</span>
                <span>Submitting opens a draft in your email application — nothing is sent until you send it.</span>
              </div>
              <Button type="submit">
                Open email draft <Send size={16} />
              </Button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}