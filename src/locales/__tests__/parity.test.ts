import ko from '../ko.json';
import en from '../en.json';

const flattenKeys = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? flattenKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

describe('locale resources', () => {
  it('ko와 en의 키 집합이 같다', () => {
    expect(flattenKeys(en).sort()).toEqual(flattenKeys(ko).sort());
  });

  it('보간 변수가 양쪽에서 같다', () => {
    const vars = (text: string) =>
      (text.match(/{{\w+}}/g) ?? []).sort().join(',');
    const koMap = new Map(
      flattenKeys(ko).map(k => [
        k,
        k.split('.').reduce((o: any, p) => o[p], ko),
      ]),
    );
    for (const key of flattenKeys(en)) {
      const enText = key.split('.').reduce((o: any, p) => o[p], en);
      expect(`${key}: ${vars(enText)}`).toBe(`${key}: ${vars(koMap.get(key))}`);
    }
  });
});
