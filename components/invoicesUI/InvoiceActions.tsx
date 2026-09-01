// components/invoicesUI/InvoiceActions.tsx

"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  CircleDollarSign,
  Trash2,
  Download,
} from "lucide-react";

type Props = {
  invoice: any;
  onDelete: (id: string) => void;
  updateInvoice: (invoice: any) => void;
  downloadInvoice: (invoice: any) => void;
};

export default function InvoiceActions({
  invoice,
  onDelete,
  updateInvoice,
  downloadInvoice,
}: Props) {
  return (
    <td className="px-4 py-3 text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          {/* Preview */}
          <DropdownMenuItem asChild className="text-xs gap-2">
            <Link href={`/invoices/${invoice._id}`}>
              <Eye size={13} className="text-muted-foreground" />
              Preview
            </Link>
          </DropdownMenuItem>

          {/* Add Payment — onSelect + preventDefault + deferred state update
              avoids the Radix dropdown-close vs dialog-open race condition */}
          <DropdownMenuItem
            className="text-xs gap-2"
            onSelect={(e) => {
              e.preventDefault();
              setTimeout(() => updateInvoice(invoice), 0);
            }}
          >
            <CircleDollarSign size={13} className="text-emerald-500" />
            Add payment
          </DropdownMenuItem>

          {/* Download — same deferral pattern, in case downloadInvoice ever
              opens UI (a toast, a new tab prompt, etc.) */}
          <DropdownMenuItem
            className="text-xs gap-2"
            onSelect={(e) => {
              e.preventDefault();
              setTimeout(() => downloadInvoice(invoice), 0);
            }}
          >
            <Download size={13} className="text-muted-foreground" />
            Download
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete */}
          <DropdownMenuItem
            className="text-xs gap-2 text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setTimeout(() => invoice._id && onDelete(invoice._id), 0);
            }}
          >
            <Trash2 size={13} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}