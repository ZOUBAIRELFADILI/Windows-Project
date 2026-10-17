import type { Configuration, Rule, RuleCondition } from '@/types/domain';

export interface RuleEffects {
  hidden: Set<string>; // "stepId:optionId"
  disabled: Set<string>;
  required: Set<string>;
  autoAdded: Set<string>;
  widthLimit?: { min: number; max: number };
  messages: string[];
  fired: Rule[];
}

export const optionKey = (stepId: string, optionId: string) => `${stepId}:${optionId}`;

function matches(cond: RuleCondition, config: Configuration): boolean {
  if (cond.type === 'option') {
    return (config.selections[cond.stepId] ?? []).includes(cond.optionId);
  }
  const value = config[cond.field];
  return cond.op === 'gt' ? value > cond.value : value < cond.value;
}

/** Evaluates every active rule against a configuration. Pure function: same input, same output. */
export function evaluateRules(rules: Rule[], config: Configuration): RuleEffects {
  const effects: RuleEffects = {
    hidden: new Set(),
    disabled: new Set(),
    required: new Set(),
    autoAdded: new Set(),
    messages: [],
    fired: [],
  };

  for (const rule of rules) {
    if (!rule.enabled || !matches(rule.when, config)) continue;
    effects.fired.push(rule);
    const a = rule.then;
    switch (a.type) {
      case 'hide':
        effects.hidden.add(optionKey(a.stepId, a.optionId));
        break;
      case 'disable':
        effects.disabled.add(optionKey(a.stepId, a.optionId));
        break;
      case 'require':
        effects.required.add(optionKey(a.stepId, a.optionId));
        break;
      case 'autoAdd':
        effects.autoAdded.add(optionKey(a.stepId, a.optionId));
        break;
      case 'limitWidth':
        effects.widthLimit = { min: a.min, max: a.max };
        break;
      case 'message':
        effects.messages.push(a.text);
        break;
    }
  }
  return effects;
}

/**
 * Two active rules conflict when one hides/disables an option that another one
 * requires or adds automatically.
 */
export function findConflicts(rules: Rule[]): Array<[Rule, Rule]> {
  const active = rules.filter((r) => r.enabled);
  const conflicts: Array<[Rule, Rule]> = [];
  for (const a of active) {
    if (a.then.type !== 'hide' && a.then.type !== 'disable') continue;
    for (const b of active) {
      if (b.then.type !== 'require' && b.then.type !== 'autoAdd') continue;
      if (a.then.stepId === b.then.stepId && a.then.optionId === b.then.optionId) {
        conflicts.push([a, b]);
      }
    }
  }
  return conflicts;
}
