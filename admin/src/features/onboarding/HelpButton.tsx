import { CircleHelp, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { Drawer } from '@/components/ui';
import { HELP, type HelpTopic } from './helpContent';

export function HelpButton({ topic }: { topic: HelpTopic }) {
  const [open, setOpen] = useState(false);
  const h = HELP[topic];
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-brand-200 hover:text-brand-700"
      >
        <CircleHelp size={14} /> Aide
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title={h.title} subtitle={h.intro} width="max-w-[420px]">
        <ol className="space-y-4">
          {h.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
              <p className="pt-1 text-sm text-slate-700">{s}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <Lightbulb size={18} className="shrink-0" />
          <p>Une question ? Ouvrez l’Assistant IA en haut à droite et demandez « comment je fais pour… ».</p>
        </div>
      </Drawer>
    </>
  );
}
