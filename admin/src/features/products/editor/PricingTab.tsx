import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle2, ClipboardPaste, FileSpreadsheet, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, CardHeader, Field, Input, Modal, Notice } from '@/components/ui';
import { formatEuro, formatNumber } from '@/lib/format';
import { countMissing, lookupGrid } from '@/lib/pricing';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';
import type { PriceGrid, Product } from '@/types/domain';

/** Parses cells copied from Excel: first row = widths, first column = heights. */
export function parsePastedGrid(text: string, grid: PriceGrid) {
  const rows = text.trim().split(/\r?\n/).map((r) => r.split(/\t|;/).map((c) => c.trim()));
  const num = (s: string) => {
    const n = Number(s.replace(/\s|€/g, '').replace(',', '.'));
    return Number.isFinite(n) && s !== '' ? n : null;
  };
  const widths = rows[0].slice(1).map(num);
  const updates: Array<{ hi: number; wi: number; value: number }> = [];
  for (const row of rows.slice(1)) {
    const hi = grid.heights.indexOf(num(row[0]) ?? -1);
    if (hi < 0) continue;
    row.slice(1).forEach((cell, i) => {
      const wi = grid.widths.indexOf(widths[i] ?? -1);
      const v = num(cell);
      if (wi >= 0 && v != null) updates.push({ hi, wi, value: v });
    });
  }
  return updates;
}

export function PricingTab({ product }: { product: Product }) {
  const { dispatch } = useAdmin();
  const { toast } = useUi();
  const [gridId, setGridId] = useState(product.grids.find((g) => countMissing(g) > 0)?.id ?? product.grids[0]?.id);
  const [editing, setEditing] = useState<{ hi: number; wi: number; value: string } | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const [increase, setIncrease] = useState(5);
  const [test, setTest] = useState({ width: 2400, height: 2100 });

  const grid = product.grids.find((g) => g.id === gridId);

  if (!grid) {
    return (
      <Card className="p-8 text-center">
        <FileSpreadsheet className="mx-auto text-slate-400" size={36} />
        <p className="mt-3 font-semibold">Aucune grille de prix</p>
        <p className="mt-1 text-sm text-muted">Importez la liste de prix de votre fournisseur depuis Excel.</p>
        <Button variant="primary" className="mt-4" onClick={() => toast('L’import Excel sera branché à l’API.')}>
          Importer un fichier Excel
        </Button>
      </Card>
    );
  }

  const values = grid.prices.flat().filter((v): v is number => v != null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const missing = countMissing(grid);
  const found = lookupGrid(grid, test.width, test.height);
  const pid = product.id;

  const heat = (v: number) => {
    const t = (v - min) / Math.max(1, max - min);
    return { backgroundColor: `rgba(37, 99, 235, ${0.08 + t * 0.62})`, color: t > 0.62 ? 'white' : '#0F172A' };
  };

  const commitCell = () => {
    if (!editing) return;
    const v = editing.value.trim() === '' ? null : Number(editing.value.replace(',', '.'));
    dispatch({ type: 'grid/cell', productId: pid, gridId: grid.id, hi: editing.hi, wi: editing.wi, value: v != null && Number.isFinite(v) ? v : null });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {product.grids.map((g) => {
          const m = countMissing(g);
          return (
            <button
              key={g.id}
              onClick={() => setGridId(g.id)}
              className={clsx('flex items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-card transition', g.id === grid.id ? 'border-2 border-brand-600' : 'border-line hover:border-slate-300')}
            >
              <span className={clsx('grid h-11 w-11 place-items-center rounded-lg text-sm font-bold', g.id === grid.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')}>{g.panels}V</span>
              <div className="min-w-0">
                <p className="font-semibold">{g.label}</p>
                <p className="text-xs text-muted">
                  {formatNumber(g.minWidth)}–{formatNumber(g.maxWidth)} × {formatNumber(g.minHeight)}–{formatNumber(g.maxHeight)} mm
                </p>
                <Badge tone={m ? 'red' : 'green'} className="mt-1.5">
                  {m ? `${m} prix manquant${m > 1 ? 's' : ''}` : 'Complète'}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button icon={<FileSpreadsheet size={15} />} onClick={() => toast('L’import de fichier sera branché à l’API (aperçu avant import).')}>
          Importer un fichier Excel
        </Button>
        <Button icon={<ClipboardPaste size={15} />} onClick={() => setPasteOpen(true)}>
          Coller depuis Excel
        </Button>
        <div className="flex items-center gap-1 rounded-lg border border-line bg-white pl-3">
          <TrendingUp size={15} className="text-slate-500" />
          <span className="text-sm font-semibold">Augmenter de</span>
          <select value={increase} onChange={(e) => setIncrease(Number(e.target.value))} className="h-9 bg-transparent px-1 text-sm font-semibold">
            {[2, 3, 5, 8, 10].map((v) => (
              <option key={v} value={v}>
                {v} %
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              dispatch({ type: 'grid/increase', productId: pid, gridId: grid.id, percent: increase });
              toast(`Grille « ${grid.label} » augmentée de ${increase} %.`);
            }}
          >
            Appliquer
          </Button>
        </div>
        <Button variant="soft" icon={<Sparkles size={15} />} disabled={!missing} onClick={() => dispatch({ type: 'grid/fill', productId: pid, gridId: grid.id })}>
          Remplir les cases vides
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <CardHeader title={`Prix de base — ${grid.label}`} subtitle="En € TTC. Cliquez une case pour la modifier. Le prix d’une taille intermédiaire est celui de la case supérieure." />
          {missing > 0 && (
            <div className="px-5 pt-4">
              <Notice
                tone="amber"
                icon={<AlertTriangle size={16} />}
                title={`${missing} taille${missing > 1 ? 's' : ''} sans prix`}
                action={
                  <Button size="sm" onClick={() => dispatch({ type: 'grid/fill', productId: pid, gridId: grid.id })}>
                    Remplir
                  </Button>
                }
              >
                Les clients ne pourront pas commander ces dimensions tant qu’elles n’ont pas de prix.
              </Notice>
            </div>
          )}
          <div className="overflow-x-auto p-5">
            <table className="w-full border-separate border-spacing-1 text-sm">
              <thead>
                <tr>
                  <th className="whitespace-nowrap px-2 text-left text-[11px] font-medium text-muted">
                    H ↓ / L →<br />
                    (mm)
                  </th>
                  {grid.widths.map((w) => (
                    <th key={w} className="px-2 py-2 text-center font-semibold">
                      {formatNumber(w)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.heights.map((h, hi) => (
                  <tr key={h}>
                    <th className="px-2 text-left font-semibold">{formatNumber(h)}</th>
                    {grid.widths.map((w, wi) => {
                      const v = grid.prices[hi][wi];
                      const isEditing = editing?.hi === hi && editing.wi === wi;
                      const isTest = found.ok && found.width === w && found.height === h;
                      return (
                        <td key={w} className="p-0">
                          {isEditing ? (
                            <input
                              autoFocus
                              value={editing.value}
                              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                              onBlur={commitCell}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitCell();
                                if (e.key === 'Escape') setEditing(null);
                              }}
                              className="h-10 w-full min-w-[72px] rounded-md border-2 border-brand-600 px-1 text-center text-sm"
                            />
                          ) : (
                            <button
                              onClick={() => setEditing({ hi, wi, value: v == null ? '' : String(v) })}
                              style={v == null ? undefined : heat(v)}
                              className={clsx(
                                'h-10 w-full min-w-[72px] whitespace-nowrap rounded-md px-1 text-center text-[13px] font-medium tabular-nums',
                                v == null && 'border border-dashed border-amber-400 bg-amber-50 text-amber-700',
                                isTest && 'ring-2 ring-ink ring-offset-1',
                              )}
                            >
                              {v == null ? '⚠ vide' : `${formatNumber(v)} €`}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-6 rounded" style={{ background: 'linear-gradient(90deg, rgba(37,99,235,.08), rgba(37,99,235,.7))' }} /> Moins cher → plus cher
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-dashed border-amber-400 bg-amber-50" /> Prix manquant
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded ring-2 ring-ink" /> Taille testée
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold">Limites de dimensions</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              {[
                ['Largeur min.', grid.minWidth],
                ['Largeur max.', grid.maxWidth],
                ['Hauteur min.', grid.minHeight],
                ['Hauteur max.', grid.maxHeight],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-canvas p-3">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-semibold tabular-nums">{formatNumber(Number(v))} mm</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Tester un prix</h2>
            <p className="mt-0.5 text-sm text-muted">Comme un client qui saisit ses dimensions.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Largeur">
                <Input type="number" step={10} suffix="mm" value={test.width} onChange={(e) => setTest({ ...test, width: Number(e.target.value) })} />
              </Field>
              <Field label="Hauteur">
                <Input type="number" step={10} suffix="mm" value={test.height} onChange={(e) => setTest({ ...test, height: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="mt-4 rounded-xl bg-brand-50 p-4">
              <p className="text-xs text-muted">Prix de base</p>
              {found.ok ? (
                <>
                  <p className="text-3xl font-bold text-brand-700 tabular-nums">{formatEuro(found.price)}</p>
                  <p className="mt-1 text-xs text-muted">
                    Case utilisée : {found.width} × {found.height} mm
                  </p>
                </>
              ) : (
                <p className="mt-1 font-semibold text-red-600">{found.reason === 'missing-price' ? 'Prix manquant pour cette taille' : 'Dimensions hors limites'}</p>
              )}
            </div>
            {found.ok && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 size={14} /> Cette dimension est dans la grille.
              </p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        title="Coller depuis Excel"
        subtitle="Copiez le tableau dans Excel (Ctrl+C) puis collez-le ici (Ctrl+V)."
        icon={<ClipboardPaste size={20} />}
        footer={
          <>
            <Button onClick={() => setPasteOpen(false)}>Annuler</Button>
            <Button
              variant="primary"
              disabled={!pasted.trim()}
              onClick={() => {
                const updates = parsePastedGrid(pasted, grid);
                updates.forEach((u) => dispatch({ type: 'grid/cell', productId: pid, gridId: grid.id, ...u }));
                toast(`${updates.length} prix importés.`);
                setPasted('');
                setPasteOpen(false);
              }}
            >
              Importer {pasted.trim() ? `(${parsePastedGrid(pasted, grid).length} prix détectés)` : ''}
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-muted">Première ligne : les largeurs. Première colonne : les hauteurs. Les autres cases : les prix.</p>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={8}
          placeholder={'\t2000\t2100\t2200\n1800\t4120\t4280\t4450\n1900\t4350\t4530\t4710'}
          className="w-full rounded-lg border border-slate-300 p-3 font-mono text-sm focus:border-brand-600 focus:outline-none"
        />
      </Modal>
    </div>
  );
}
