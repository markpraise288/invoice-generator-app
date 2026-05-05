"use client";

import { ChangeEvent, FormEvent } from "react";

interface Client {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface ClientFormProps {
  handleSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  saveEdit?: (e: FormEvent<HTMLFormElement>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isAddingClient: boolean;
  setIsAddingClient: (value: boolean) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  client: Partial<Client>;
}

export default function ClientsForm({
  handleSubmit,
  saveEdit,
  handleChange,
  isAddingClient,
  setIsAddingClient,
  isEditing,
  setIsEditing,
  client,
}: ClientFormProps) {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (isAddingClient && handleSubmit) return handleSubmit(e);
    if (isEditing && saveEdit) return saveEdit(e);
  };

  return (
        <form
      onSubmit={onSubmit}
      className="bg-gray-50 dark:bg-gray-800 lg:w-[40%] sm:w-[70%] rounded-2xl shadow"
    >
      {/* Header */}
      <div className="flex justify-between border-b p-4 border-gray-300 dark:border-gray-700">
        <h2 className="font-bold text-lg dark:text-white">
          {isAddingClient ? "Add New Client" : "Editing Client"}
        </h2>

        <button
          type="button"
          onClick={() =>
            isAddingClient
              ? setIsAddingClient(false)
              : setIsEditing(false)
          }
          className="text-xl text-gray-500 dark:text-gray-400"
        >
          ✕
        </button>
      </div>

      {/* Form Fields */}
      <div className="p-4">
        <div className="flex gap-8 justify-center flex-wrap">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold dark:text-gray-200">Full Name *</label>
            <input
              name="name"
              value={client.name || ""}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-2"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold dark:text-gray-200">Email *</label>
            <input
              name="email"
              value={client.email || ""}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-2"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold dark:text-gray-200">Phone *</label>
            <input
              name="phone"
              value={client.phone || ""}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-2"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold dark:text-gray-200">Address</label>
            <input
              name="address"
              value={client.address || ""}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-2"
            />
          </div>
        </div>

        {/* Actions */}
        {(isAddingClient || isEditing) && (
          <div className="p-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                isAddingClient
                  ? setIsAddingClient(false)
                  : setIsEditing(false)
              }
              className="text-red-600 dark:text-red-400 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="py-2 px-4 text-white bg-blue-600 rounded-xl"
            >
              {isAddingClient ? "Add Client" : "Save"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}