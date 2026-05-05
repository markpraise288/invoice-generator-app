"use client";

import { X, Save } from "lucide-react";

interface User {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
}

interface UserFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setIsEditing: (value: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userData: User;
}

export default function UserForm({
  handleSubmit,
  setIsEditing,
  handleChange,
  userData,
}: UserFormProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <form
      onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
    >
      {/* HEADER */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            Edit Profile
      </h2>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

      {/* FORM FIELDS */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* NAME */}
            <div className="flex flex-col gap-2">
                          <label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Name</label>
          <input
            name="name"
            value={userData.name}
            onChange={handleChange}
            type="text"
                placeholder="Enter your name"
                className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* COMPANY */}
            <div className="flex flex-col gap-2">
                          <label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Company Name</label>
          <input
            name="companyName"
            value={userData.companyName}
            onChange={handleChange}
            type="text"
                placeholder="Enter company name"
                className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* EMAIL */}
            <div className="flex flex-col gap-2">
                          <label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Email</label>
          <input
            name="email"
            value={userData.email}
            onChange={handleChange}
            type="email"
                placeholder="Enter email address"
                className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* PHONE */}
            <div className="flex flex-col gap-2">
                          <label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Phone Number</label>
          <input
            name="phone"
            value={userData.phone}
            onChange={handleChange}
                type="tel"
                placeholder="Enter phone number"
                className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* ADDRESS */}
            <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Address</label>
          <input
            name="address"
            value={userData.address}
            onChange={handleChange}
            type="text"
                placeholder="Enter your address"
                className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
            </div>
        </div>
      </div>

        {/* ACTIONS */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 font-medium"
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}