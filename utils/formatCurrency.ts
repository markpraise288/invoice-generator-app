// utils/formatCurrency.ts

const currencyLocales: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  CAD: "en-CA",
  AUD: "en-AU",

  MWK: "en-MW",
  ZAR: "en-ZA",
  NGN: "en-NG",
  KES: "en-KE",
  UGX: "en-UG",
  TZS: "sw-TZ",
  GHS: "en-GH",
  ZMW: "en-ZM",
  BWP: "en-BW",
  EGP: "ar-EG",
  MAD: "fr-MA",
  RWF: "rw-RW",
};

export const formatCurrency = (
  amount: number,
  currency: string = "USD"
): string => {
  try {
    const locale = currencyLocales[currency] || "en-US";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currency} ${amount}`;
  }
};