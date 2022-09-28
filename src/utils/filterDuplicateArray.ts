/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable unicorn/prevent-abbreviations */
export function filterDuplicateArray<T>(array: T[]) {
  return array.reduce(
    (unique, item) =>
      unique.some((itemArr) => JSON.stringify(itemArr) === JSON.stringify(item))
        ? unique
        : [...unique, item],
    [] as T[],
  );
}
