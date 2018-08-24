export function createGetter<T>(value: T) {
  return () => Promise.resolve(value);
}
