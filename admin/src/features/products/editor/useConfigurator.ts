import { useMemo, useState } from 'react';
import type { Configuration, Product, Step } from '@/types/domain';
import { computeQuote, defaultConfiguration } from '@/lib/pricing';
import { optionKey } from '@/lib/rules';
import { useAdmin } from '@/store/AdminStore';

/** Holds a customer configuration and recomputes the quote on every change. */
export function useConfigurator(product: Product) {
  const { promotions } = useAdmin();
  const [config, setConfig] = useState<Configuration>(() => defaultConfiguration(product));

  const quote = useMemo(() => computeQuote(product, config, promotions), [product, config, promotions]);

  const select = (step: Step, optionId: string) =>
    setConfig((c) => {
      const current = c.selections[step.id] ?? [];
      const next = step.multi ? (current.includes(optionId) ? current.filter((x) => x !== optionId) : [...current, optionId]) : [optionId];
      return { ...c, selections: { ...c.selections, [step.id]: next } };
    });

  const optionState = (stepId: string, optionId: string) => {
    const key = optionKey(stepId, optionId);
    return {
      selected: (config.selections[stepId] ?? []).includes(optionId) || quote.effects.autoAdded.has(key),
      auto: quote.effects.autoAdded.has(key),
      hidden: quote.effects.hidden.has(key),
      disabled: quote.effects.disabled.has(key),
      required: quote.effects.required.has(key),
    };
  };

  const reset = () => setConfig(defaultConfiguration(product));

  return { config, setConfig, quote, select, optionState, reset };
}
