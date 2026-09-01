"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUpdateLead } from "@/hooks/useLeads";

import type { Lead } from "./LeadsTable";

interface Props {
  open: boolean;

  lead: Lead | null;

  onClose: () => void;
}

export default function EditLeadDialog({
  open,

  lead,

  onClose,
}: Props) {
  const updateLead = useUpdateLead();

  const [form, setForm] = useState({
    name: "",

    email: "",

    phone: "",

    company: "",

    position: "",

    source: "",

    value: 0,

    status: "new",
  });

  useEffect(() => {
    if (!lead) return;

    // Defer updating state to avoid synchronous setState inside effect
    const t = setTimeout(() => {
      setForm({
        name: lead.name || "",

        email: lead.email || "",

        phone: lead.phone || "",

        company: lead.company || "",

        position: lead.position || "",

        source: lead.source || "",

        value: lead.value || 0,

        status: lead.status || "new",
      });
    }, 0);

    return () => clearTimeout(t);
  }, [lead]);

  if (!open || !lead) return null;

  const updateField = (
    field: keyof typeof form,

    value: any,
  ) => {
    setForm((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await updateLead.mutateAsync({
      id: lead._id,

      data: {
        ...form,
        status: form.status as Lead["status"],
      },
    });

    onClose();
  };

  return (
    <div
      className="
fixed
inset-0
z-50
flex
items-center
justify-center

bg-black/40
backdrop-blur-sm
"
    >
      <div
        className="
w-full
max-w-lg
rounded-2xl
border
bg-white
p-6
shadow-2xl

dark:border-slate-700
dark:bg-slate-900
"
      >
        {/* HEADER */}

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Edit Lead</h2>

            <p className="text-sm text-muted-foreground">
              Update customer information
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

        {/* FORM */}

        <div className="mt-6 space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(v) => updateField("name", v)}
          />

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(v) => updateField("email", v)}
          />

          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
          />

          <Input
            placeholder="Company"
            value={form.company}
            onChange={(v) => updateField("company", v)}
          />

          <Input
            placeholder="Position"
            value={form.position}
            onChange={(v) => updateField("position", v)}
          />

          <Input
            placeholder="Lead Source"
            value={form.source}
            onChange={(v) => updateField("source", v)}
          />

          <input
            type="number"
            placeholder="Deal Value"
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

          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
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
            <option value="new">New</option>

            <option value="contacted">Contacted</option>

            <option value="qualified">Qualified</option>

            <option value="proposal_sent">Proposal Sent</option>

            <option value="negotiation">Negotiation</option>

            <option value="won">Won</option>

            <option value="lost">Lost</option>
          </select>
        </div>

        {/* ACTIONS */}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={updateLead.isPending}>
            {updateLead.isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Input({
  placeholder,

  value,

  onChange,
}: {
  placeholder: string;

  value: string;

  onChange: (v: string) => void;
}) {
  return (
    <input
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
