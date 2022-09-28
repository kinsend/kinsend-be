/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable unicorn/prevent-abbreviations */
export function findDuplicateArray<T>(array: T[]) {
  return array.filter((item, index) => {
    const indexFinded = array.findIndex((itemFind) => (item as any).id === (itemFind as any).id);
    return index !== indexFinded;
  });
}
