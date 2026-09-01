"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCreateLead } from "@/hooks/useLeads";

interface Props {
  open: boolean;
  onClose: () => void;
}

type LeadSource =
  | "facebook"
  | "google"
  | "linkedin"
  | "manual"
  | "referral"
  | "website"
  | "other";

const initialForm = {
  name: "",

  email: "",

  phone: "",

  company: "",

  position: "",

  source: "manual" as LeadSource,

  value: 0,
};

export default function CreateLeadDialog({ open, onClose }: Props) {
  const createLead = useCreateLead();

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");

  const updateField = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);

    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.name || !form.email || !form.phone) {
      setError("Name, email and phone are required.");

      return;
    }

    try {
      await createLead.mutateAsync({
        ...form,

        status: "new",
      });

      resetForm();

      onClose();
    } catch (error) {
      setError("Failed to create lead. Try again.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black/50
      backdrop-blur-sm
      px-4
      "
    >
      <div
        className="
        w-full max-w-xl

        rounded-2xl

        border

        bg-white

        shadow-2xl

        p-6


        dark:border-slate-700
        dark:bg-slate-900
        "
      >
        {/* HEADER */}

        <div
          className="
          flex
          items-start
          justify-between
        "
        >
          <div>
            <h2
              className="
              text-xl
              font-bold
            "
            >
              Create Lead
            </h2>

            <p
              className="
              text-sm
              text-muted-foreground
            "
            >
              Add a potential customer into your sales pipeline.
            </p>
          </div>

          <button
            onClick={onClose}
            className="
            rounded-lg
            p-2

            hover:bg-slate-100

            dark:hover:bg-slate-800
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="
            mt-4

            rounded-lg

            border

            border-red-300

            bg-red-50

            p-3

            text-sm

            text-red-600

            dark:bg-red-950
            "
          >
            {error}
          </div>
        )}

        {/* FORM */}

        <div
          className="
          mt-6
          space-y-4
        "
        >
          <InputField
            placeholder="Full name"
            value={form.name}
            onChange={(v) => updateField("name", v)}
          />

          <InputField
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(v) => updateField("email", v)}
          />

          <InputField
            placeholder="Phone number"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
          />

          <InputField
            placeholder="Company"
            value={form.company}
            onChange={(v) => updateField("company", v)}
          />

          <InputField
            placeholder="Position"
            value={form.position}
            onChange={(v) => updateField("position", v)}
          />

          {/* SOURCE */}

          <select
            value={form.source}
            onChange={(e) =>
              updateField("source", e.target.value as LeadSource)
            }
            className="
            w-full

            rounded-xl

            border

            bg-transparent

            p-3

            text-sm


            dark:border-slate-700

            dark:bg-slate-800
            "
          >
            <option value="manual">Manual</option>

            <option value="website">Website</option>

            <option value="facebook">Facebook</option>

            <option value="google">Google</option>

            <option value="linkedin">LinkedIn</option>

            <option value="referral">Referral</option>
          </select>

          <input
            type="number"
            placeholder="Potential deal value"
            value={form.value}
            onChange={(e) => updateField("value", Number(e.target.value))}
            className="
            w-full

            rounded-xl

            border

            bg-transparent

            p-3

            text-sm


            dark:border-slate-700

            dark:bg-slate-800
            "
          />
        </div>

        {/* ACTIONS */}

        <div
          className="
          mt-6

          flex

          justify-end

          gap-3
        "
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createLead.isPending}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={createLead.isPending}>
            {createLead.isPending ? (
              <>
                <Loader2
                  className="
                  mr-2
                  animate-spin
                  "
                  size={16}
                />
                Creating...
              </>
            ) : (
              "Create Lead"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  placeholder,

  value,

  type = "text",

  onChange,
}: {
  placeholder: string;

  value: string;

  type?: string;

  onChange: (value: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="

w-full

rounded-xl

border

bg-transparent

p-3

text-sm


focus:outline-none

focus:ring-2

focus:ring-blue-500


dark:border-slate-700

dark:bg-slate-800

"
    />
  );
}
