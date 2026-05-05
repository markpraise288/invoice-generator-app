"use client";

interface User {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
}

interface AccountFormProps {
  user: User;
}

export default function AccountForm({ user }: AccountFormProps) {
  return (
    <div className="my-4 bg-gray-50 dark:bg-gray-900 dark:text-gray-50 rounded-2xl shadow p-6 flex flex-col gap-6">

      {/* FIELD */}
      <Field label="Name" value={user.name} />

      <Field label="Company Name" value={user.companyName} />

      <Field label="Email" value={user.email} />

      <Field label="Phone Number" value={user.phone} />

      <Field label="Address" value={user.address} />

    </div>
  );
}

// 🔥 Reusable Field Component (Cleaner UI)
function Field({ label, value }: { label: string; value: string }) {
    return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold text-gray-600 dark:text-gray-400">{label}</label>
      <p className="bg-gray-100 dark:bg-gray-700 w-full sm:w-[60%] p-3 rounded-xl text-gray-800 dark:text-gray-200">
        {value || "—"}
      </p>
    </div>
  );
}