export interface Option<T extends string> {
  value: T;
  label: string;
}

/** Turn a `Record<enum, label>` map into an array of `{ value, label }`. */
export function recordToOptions<T extends string>(rec: Record<T, string>): Option<T>[] {
  return (Object.keys(rec) as T[]).map((value) => ({ value, label: rec[value] }));
}
