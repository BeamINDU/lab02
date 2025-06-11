/**
 * แปลง string/number ให้เป็น number
 */
export const toNumber = (val: string | number | null | undefined): number => {
  if (val == null) return 0;

  const raw = typeof val === 'string' ? val.replace(/,/g, '').trim() : val;
  const num = Number(raw);

  return isNaN(num) ? 0 : num;
};

/**
 * แปลง number ให้เป็น string พร้อม comma (locale-aware)
 * @param value ค่าตัวเลข
 * @param locale รหัสภาษาท้องถิ่น เช่น 'en-US', 'th-TH'
 * @param minFraction จำนวนทศนิยมต่ำสุด
 * @param maxFraction จำนวนทศนิยมสูงสุด
 */
export const formatNumber = (
  value: number | null | undefined,
  locale: string = 'en-US',
  minFraction: number = 0,
  maxFraction: number = 2
): string => {
  const num = value ?? 0;
  return num.toLocaleString(locale, {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
  });
};
