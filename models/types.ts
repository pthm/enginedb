export type CopyWithPartial<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type PartialExcept<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;
