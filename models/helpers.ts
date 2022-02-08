export function val<T>(value: () => T, fallback: T): T {
  try {
    const v = value();
    if (v) {
      return v;
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
}

export function utcUnixEpoch(date: Date): number {
  const utcMilllisecondsSinceEpoch =
    date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000);
  return utcSecondsSinceEpoch;
}
