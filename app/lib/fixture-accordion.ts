/** Collapse long fixture lists: show two, hide the rest until the heading is opened. */

export const FIXTURE_ACCORDION_PREVIEW = 2;

export function fixtureListIsCollapsible(count: number): boolean {
  return count > FIXTURE_ACCORDION_PREVIEW;
}

export function visibleAccordionItems<T>(
  items: readonly T[],
  expanded: boolean,
  isPinned?: (item: T) => boolean
): T[] {
  if (expanded || !fixtureListIsCollapsible(items.length)) {
    return [...items];
  }
  const head = items.slice(0, FIXTURE_ACCORDION_PREVIEW);
  if (!isPinned) return head;
  const extra = items
    .slice(FIXTURE_ACCORDION_PREVIEW)
    .filter((item) => isPinned(item));
  return [...head, ...extra];
}

export function hiddenAccordionCount(total: number, visible: number): number {
  return Math.max(0, total - visible);
}

export function fixtureAccordionHint(
  total: number,
  visible: number,
  expanded: boolean
): string | null {
  if (!fixtureListIsCollapsible(total)) return null;
  if (expanded) return "Hide extra Matches";
  const hidden = hiddenAccordionCount(total, visible);
  if (hidden <= 0) return "Show all Matches";
  const noun = hidden === 1 ? "Match" : "Matches";
  return `${hidden} more ${noun}`;
}
