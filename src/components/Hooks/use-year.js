export const useYear = (includeNextYear = false) => {
  const currentYear = new Date().getFullYear();
  const range = (start, stop, step) =>
    Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step
    );

  let years = range(currentYear, 2000, -1);
  const plusOne = includeNextYear ? 1 : 0;
  const buddisht = includeNextYear ? 544 : 543;

  const yearObjects = years.map((year) => ({
    id: `${year + plusOne}`,
    value: `${year + buddisht}`,
  }));

  return yearObjects;
};
