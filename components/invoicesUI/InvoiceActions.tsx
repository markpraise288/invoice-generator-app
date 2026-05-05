"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MoreHorizontal,
  Eye,
  CircleDollarSign,
  Trash,
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
    <td className="p-3 text-left">
      <DropdownMenu>
        {/* Trigger */}
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <MoreHorizontal size={18} />
          </button>
        </DropdownMenuTrigger>

        {/* Menu */}
        <DropdownMenuContent
          align="end"
          className="w-44 rounded-xl shadow-lg"
        >
          {/* Preview */}
          <DropdownMenuItem asChild>
            <Link
              href={`/invoices/${invoice._id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye size={16} className="text-gray-600" />
              <span>Preview</span>
            </Link>
          </DropdownMenuItem>

          {/* Add Payment */}
          <DropdownMenuItem
            onClick={() => updateInvoice(invoice)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <CircleDollarSign size={16} className="text-blue-600" />
            <span>Add Payment</span>
          </DropdownMenuItem>

          {/* Divider */}
          <div className="h-px bg-gray-200 my-1" />

          {/* Delete */}
          <DropdownMenuItem
            onClick={() => invoice._id && onDelete(invoice._id)}
            className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
          >
            <Trash size={16} />
            <span>Delete</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => downloadInvoice(invoice)}
            className="flex items-center gap-2 text-green-600 focus:text-green-600 cursor-pointer"
          >
            <CircleDollarSign size={16} />
            <span>Download</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}