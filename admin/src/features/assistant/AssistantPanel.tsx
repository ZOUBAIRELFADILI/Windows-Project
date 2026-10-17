import { clsx } from 'clsx';
import { ArrowUp, Check, Sparkles, Wand2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';
import { answer, describeChange, SUGGESTIONS, type Reply } from './assistantScript';

interface Message {
  id: number;
  from: 'ai' | 'me';
  reply: Reply;
  status?: 'pending' | 'applied' | 'cancelled';
}

export function AssistantPanel() {
  const { assistantOpen, setAssistantOpen, toast } = useUi();
  const { products, promotions, dispatch } = useAdmin();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: 'ai', reply: { text: 'Bonjour ! Je peux expliquer un prix, vérifier vos produits ou préparer des modifications. Vous validez toujours avant que quoi que ce soit change.' } },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!assistantOpen) return null;

  const ask = (text: string) => {
    if (!text.trim()) return;
    const reply = answer(text, products, promotions);
    setMessages((m) => [
      ...m,
      { id: Date.now(), from: 'me', reply: { text } },
      { id: Date.now() + 1, from: 'ai', reply, status: reply.proposal ? 'pending' : undefined },
    ]);
    setInput('');
  };

  const resolve = (msg: Message, apply: boolean) => {
    const p = msg.reply.proposal;
    if (apply && p) {
      p.changes.forEach((c) => dispatch({ type: 'option/save', productId: p.productId, stepId: p.stepId, option: c.after }));
      toast(`${p.changes.length} modifications appliquées (enregistrées dans l’historique).`);
    }
    setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, status: apply ? 'applied' : 'cancelled' } : x)));
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[400px] flex-col border-l border-line bg-canvas shadow-overlay">
      <header className="flex items-center gap-3 bg-ink px-5 py-4 text-white">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-400/90 text-ink">
          <Sparkles size={18} />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Assistant IA</p>
          <p className="text-xs text-slate-300">Propose · vous validez</p>
        </div>
        <button onClick={() => setAssistantOpen(false)} aria-label="Fermer l’assistant" className="text-slate-300 hover:text-white">
          <X size={20} />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={clsx('flex', m.from === 'me' && 'justify-end')}>
            <div className={clsx('max-w-[92%] rounded-xl px-4 py-3 text-sm', m.from === 'me' ? 'bg-brand-600 text-white' : 'border border-line bg-white text-slate-800 shadow-card')}>
              <p>{m.reply.text}</p>
              {m.reply.bullets && (
                <ul className="mt-2 list-disc space-y-1 pl-5 tabular-nums">
                  {m.reply.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {m.reply.proposal && (
                <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/60 p-3">
                  <p className="flex items-center gap-1.5 font-semibold text-brand-800">
                    <Wand2 size={14} /> {m.reply.proposal.title}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-700">
                    {m.reply.proposal.changes.map((c) => (
                      <li key={c.before.id}>• {describeChange(c)}</li>
                    ))}
                  </ul>
                  {m.status === 'pending' ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="primary" className="bg-emerald-700 hover:bg-emerald-800" icon={<Check size={14} />} onClick={() => resolve(m, true)}>
                        Valider
                      </Button>
                      <Button size="sm" icon={<X size={14} />} onClick={() => resolve(m, false)}>
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <p className={clsx('mt-2 text-xs font-semibold', m.status === 'applied' ? 'text-emerald-700' : 'text-slate-500')}>
                      {m.status === 'applied' ? '✓ Appliqué' : 'Annulé — rien n’a changé'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-xs text-slate-700 hover:border-brand-200 hover:text-brand-700">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form
        className="flex gap-2 border-t border-line bg-white p-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Poser une question ou demander une modification…"
          className="h-10 flex-1 rounded-lg border border-line bg-canvas px-3 text-sm focus:border-brand-600 focus:outline-none"
        />
        <button type="submit" aria-label="Envoyer" className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white hover:bg-brand-700">
          <ArrowUp size={18} />
        </button>
      </form>
    </aside>
  );
}
