// utils/formatDate.ts

export const formatDate = (
  date: string | Date,
  locale: string = "en-US"
) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};