type ResolvedElement = {
  element: Element;
};

export type GetStyleInfo = (resolved: ResolvedElement) => {
  className: unknown;
  styles: Record<string, string> | null;
};

export function initDesignMode(_getStyleInfo: GetStyleInfo) {
  return () => {};
}
