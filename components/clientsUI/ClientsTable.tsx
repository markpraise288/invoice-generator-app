"use client";

import { Eye, Pencil, Trash } from "lucide-react";
import { Client } from "@/types";
import Link from "next/link";

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export default function ClientsTable({
  clients,
  onEdit,
  onDelete,
}: ClientsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-none p-6 border border-gray-100 dark:border-gray-700">
      <table className="w-full text-left">
        {/* Header */}
        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm uppercase">
          <tr>
            <th className="p-3">Client Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Address</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-900 dark:text-gray-100">
          {clients
            .filter((client) => !client.isDeleted)
            .map((client) => (
              <tr key={client._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3 font-medium">{client.name}</td>

                <td className="p-3 text-gray-500 dark:text-gray-400">
                  {client.email}
                </td>

                <td className="p-3 text-gray-500 dark:text-gray-400">
                  {client.phone || "-"}
                </td>

                <td className="p-3 text-gray-500 dark:text-gray-400">
                  {client.address || "-"}
                </td>

                <td className="p-3">
                  <div className="flex gap-3">
                    {/* View*/}
                    <Link href={`clients/${client._id}`} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                      <Eye size={16}/>View
                    </Link>
                    {/* Edit */}
                    <button
                      onClick={() => onEdit(client)}
                      className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Pencil size={16} strokeWidth={1.5} />
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(client._id!)}
                      className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}