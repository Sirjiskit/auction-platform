export const formatAmount = (value: number) => {
  if (isNaN(value)) return value;
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};
