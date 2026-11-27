export function fieldShrink(value: string | null | undefined) {
  if (!value) return undefined;
  return { inputLabel: { shrink: true } };
}
