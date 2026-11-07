export interface SelectOption<T = string | number> {
  value: T;
  label: string;
}

export interface NormalizeOptionsConfig<T = Record<string, unknown>> {
  valueKey?: string;
  labelKey?: string;
  format?: ((item: T) => string) | null;
}

export default function normalizeOptions<T extends Record<string, unknown> = Record<string, unknown>>(
  list: T[] | null | undefined = [],
  { valueKey = 'id', labelKey = 'nama', format = null }: NormalizeOptionsConfig<T> = {}
): SelectOption<string | number>[] {
  return (list ?? []).map((item) => ({
    value: (item?.[valueKey] as string | number) ?? '',
    label: typeof format === 'function' ? format(item) : String(item?.[labelKey] ?? '-'),
  }));
}
