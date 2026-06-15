"use client";

import { Invoice, User } from "@/types";

// 🔥 Import all templates
import Corporate from "@/app/(dashboard)/invoices/templetes/CorporativeWave";
import Classic from "@/app/(dashboard)/invoices/templetes/Classic";
import Modern from "@/app/(dashboard)/invoices/templetes/Modern";
import Bold from "@/app/(dashboard)/invoices/templetes/Bold";
import Minimal from "@/app/(dashboard)/invoices/templetes/Minimal";
import Elegant from "@/app/(dashboard)/invoices/templetes/Elegant";
import Compact from "@/app/(dashboard)/invoices/templetes/Compact";
import BoldPro from "@/app/(dashboard)/invoices/templetes/BoldPro";

interface Props {
  invoice: Invoice;
  user: User; // ✅ FIX: pass user properly
}

// 🔥 Template Map (scalable system)
const TEMPLATE_MAP = {
  corporateWave: Corporate,
  classic: Classic,
  modern: Modern,
  bold: Bold,
  minimal: Minimal,
  elegant: Elegant,
  compact: Compact,
  "bold-pro": BoldPro,
};

export default function InvoiceRenderer({ invoice, user }: Props) {
  const TemplateComponent =
    TEMPLATE_MAP[invoice.template as keyof typeof TEMPLATE_MAP];

  // 🔥 fallback safety
  if (!TemplateComponent) {
    return (
      <div className="p-6 text-red-500">
        Template not found: {invoice.template}
      </div>
    );
  }

  // ✅ pass both invoice + user to template
  return <TemplateComponent invoice={invoice} user={user} />;
}
