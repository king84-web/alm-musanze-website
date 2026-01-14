import { PaymentPurpose } from "@/service/financeService";
import { twMerge } from "tailwind-merge";

export function cn(...classes: (string | undefined | false)[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}

const getTimeLeft = (eventDate: string | Date) => {
  const now = new Date();
  const eventTime = new Date(eventDate).getTime();
  let diffTime = eventTime - now.getTime(); // difference in milliseconds

  if (diffTime <= 0) return "Event Started";

  const minutes = Math.floor(diffTime / (1000 * 60));
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} left`;

  const hours = Math.floor(diffTime / (1000 * 60 * 60));
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} left`;

  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return `${days} day${days > 1 ? "s" : ""} left`;
};
export { getTimeLeft };

export const countyOptions = [
  { label: "Bomi", value: "Bomi" },
  { label: "Bong", value: "Bong" },
  { label: "Gbarpolu", value: "Gbarpolu" },
  { label: "Grand Bassa", value: "Grand Bassa" },
  { label: "Grand Cape Mount", value: "Grand Cape Mount" },
  { label: "Grand Gedeh", value: "Grand Gedeh" },
  { label: "Grand Kru", value: "Grand Kru" },
  { label: "Lofa", value: "Lofa" },
  { label: "Margibi", value: "Margibi" },
  { label: "Maryland", value: "Maryland" },
  { label: "Montserrado", value: "Montserrado" },
  { label: "Nimba", value: "Nimba" },
  { label: "River Cess", value: "River Cess" },
  { label: "River Gee", value: "River Gee" },
  { label: "Sinoe", value: "Sinoe" },
];

export function formatCurrency(
  amount: number,
  currency: string = "RWF",
  locale: string = "rw-RW"
): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return formatCurrency(0, currency, locale);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "RWF" ? 0 : 2,
    maximumFractionDigits: currency === "RWF" ? 0 : 2,
  }).format(amount);
}

export type PaymentPurposeOption = {
  label: string;
  value: PaymentPurpose;
};

export const PAYMENT_PURPOSE_OPTIONS: PaymentPurposeOption[] = [
  { label: "Membership Fee", value: "MEMBERSHIP_FEE" },
  { label: "Subscription", value: "SUBSCRIPTION" },
  { label: "Donation", value: "DONATION" },
  { label: "Event Ticket", value: "EVENT_TICKET" },
  { label: "Service Fee", value: "SERVICE_FEE" },
  { label: "Product Purchase", value: "PRODUCT_PURCHASE" },
  { label: "Loan Repayment", value: "LOAN_REPAYMENT" },
  { label: "Loan Disbursement", value: "LOAN_DISBURSEMENT" },
  { label: "Penalty", value: "PENALTY" },
  { label: "Fine", value: "FINE" },
  { label: "Contribution", value: "CONTRIBUTION" },
  { label: "Invoice Payment", value: "INVOICE_PAYMENT" },
  { label: "Registration Fee", value: "REGISTRATION_FEE" },
  { label: "System Charge", value: "SYSTEM_CHARGE" },
  { label: "Other", value: "OTHER" },
];
