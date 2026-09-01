// components/projects/ProjectFormDialog.tsx

"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Check,
  ChevronsUpDown,
  Users,
  Building2,
  Contact as ContactIcon,
  Handshake,
} from "lucide-react";
import {
  useCreateProject,
  useUpdateProject,
  type Project,
  type CreateProjectPayload,
  type ProjectRelatedTo,
} from "@/hooks/useProjects";
import { ProjectMembersPicker } from "@/components/projects/ProjectMembersPicker";
import { toast } from "sonner";
import { useTeam } from "@/hooks/useSettings";

// ─── Related entity config — Project's full four-type enum ────────────────────

const relatedToConfig: Record<
  ProjectRelatedTo,
  { label: string; icon: React.ElementType; searchEndpoint: string }
> = {
  Customer: { label: "Customer", icon: Users, searchEndpoint: "/customers" },
  Company: { label: "Company", icon: Building2, searchEndpoint: "/companies" },
  Contact: { label: "Contact", icon: ContactIcon, searchEndpoint: "/contacts" },
  Deal: { label: "Deal", icon: Handshake, searchEndpoint: "/deals" },
};

const relatedToTypes = Object.keys(relatedToConfig) as ProjectRelatedTo[];

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  defaultRelatedId?: string; // fixed context — e.g. opened from a Customer's/Deal's own page
  defaultRelatedTo?: ProjectRelatedTo;
  defaultRelatedLabel?: string; // display name for the locked chip
}

// ─── Related record search combobox ────────────────────────────────────────────
// Same pattern used across every polymorphic dialog this conversation — one
// component driven by relatedToConfig, covering all four possible types.

function RelatedRecordCombobox({
  relatedTo,
  value,
  onChange,
}: {
  relatedTo: ProjectRelatedTo;
  value: { id: string; label: string } | null;
  onChange: (record: { id: string; label: string } | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const config = relatedToConfig[relatedTo];

  const { data, isLoading } = useQuery({
    queryKey: [config.searchEndpoint, "project-link-search", search],
    queryFn: async () => {
      const res = await apiFetch(
        `${config.searchEndpoint}?search=${encodeURIComponent(search)}&limit=10`
      );
      const key = Object.keys(res.data || {}).find((k) => Array.isArray(res.data[k]));
      return (key ? res.data[key] : res.data ?? []) as any[];
    },
    enabled: open,
  });

  const options: any[] = Array.isArray(data) ? data : [];
  const Icon = config.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            <Icon size={13} className="text-muted-foreground shrink-0" />
            <span className="truncate">
              {value ? value.label : `Select a ${config.label.toLowerCase()}...`}
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${config.label.toLowerCase()}s...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{isLoading ? "Searching..." : "No results found."}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const label = option.name ?? option.title ?? option._id;
                return (
                  <CommandItem
                    key={option._id}
                    value={option._id}
                    onSelect={() => {
                      onChange({ id: option._id, label });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === option._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{label}</span>
                      {option.email && (
                        <span className="text-xs text-muted-foreground">{option.email}</span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const emptyForm = (relatedTo: ProjectRelatedTo): CreateProjectPayload => ({
  name: "",
  description: "",
  relatedId: "",
  relatedTo,
  status: "planning",
  startDate: null,
  dueDate: null,
  budget: 0,
  members: [],
  tags: [],
});

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  defaultRelatedId,
  defaultRelatedTo,
  defaultRelatedLabel,
}: ProjectFormDialogProps) {
  const isEditing = !!project;
  const isFixedContext = !!defaultRelatedId && !!defaultRelatedTo;

  const [form, setForm] = useState<CreateProjectPayload>(emptyForm(defaultRelatedTo ?? "Customer"));
  const [budgetInput, setBudgetInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Picker-mode state — only relevant when NOT in a fixed context
  const [pickerType, setPickerType] = useState<ProjectRelatedTo>(defaultRelatedTo ?? "Customer");
  const [pickerRecord, setPickerRecord] = useState<{ id: string; label: string } | null>(null);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isSubmitting = createProject.isPending || updateProject.isPending;
  const { data: members } = useTeam();

  useEffect(() => {
    if (!open) return;

    setRelatedError(null);

    if (project) {
      setForm({
        name: project.name,
        description: project.description || "",
        relatedId: typeof project.relatedId === "string" ? project.relatedId : project.relatedId._id,
        relatedTo: project.relatedTo,
        status: project.status,
        startDate: project.startDate || null,
        dueDate: project.dueDate || null,
        budget: project.budget,
        owner: project.owner?._id || null,
        members: project.members.map((m) => m._id) || members?.map((m) => m._id),
        tags: project.tags,
      });
      setBudgetInput(project.budget ? (project.budget / 100).toString() : "");
      setTagsInput(project.tags.join(", "));

      if (!isFixedContext && typeof project.relatedId !== "string") {
        setPickerType(project.relatedTo);
        setPickerRecord({
          id: project.relatedId._id,
          label: (project.relatedId as any).name ?? (project.relatedId as any).title ?? "",
        });
      }
    } else {
      const initialType = defaultRelatedTo ?? "Customer";
      setForm(emptyForm(initialType));
      setBudgetInput("");
      setTagsInput("");
      setPickerType(initialType);
      setPickerRecord(null);
    }
  }, [project, open, isFixedContext, defaultRelatedTo]);

  const handlePickerTypeChange = (type: ProjectRelatedTo) => {
    setPickerType(type);
    setPickerRecord(null); // switching type invalidates whatever record was picked
    setRelatedError(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    const relatedId = isFixedContext ? defaultRelatedId! : pickerRecord?.id;
    const relatedTo = isFixedContext ? defaultRelatedTo! : pickerType;

    if (!relatedId) {
      setRelatedError("Choose what this project relates to");
      return;
    }

    const payload: CreateProjectPayload = {
      ...form,
      relatedId,
      relatedTo,
      budget: Math.round(parseFloat(budgetInput || "0") * 100),
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (isEditing && project) {
        await updateProject.mutateAsync({ id: project._id, data: payload });
        toast.success("Project updated");
      } else {
        await createProject.mutateAsync(payload);
        toast.success("Project created");
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? "Failed to update project" : "Failed to create project");
    }
  };

  const fixedConfig = defaultRelatedTo ? relatedToConfig[defaultRelatedTo] : null;
  const FixedIcon = fixedConfig?.icon ?? Users;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="projectName">Name</Label>
            <Input
              id="projectName"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Website Redesign"
            />
          </div>

          {/* ── Related to: locked chip OR type + record picker ── */}
          {isFixedContext ? (
            <div className="grid gap-2">
              <Label className="text-xs">Related to</Label>
              <div className="flex h-9 items-center gap-2 rounded-lg border bg-muted/40 px-3">
                <FixedIcon size={13} className="text-muted-foreground shrink-0" />
                <span className="truncate text-sm font-medium">
                  {defaultRelatedLabel || defaultRelatedId}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label className="text-xs">
                Related to
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={pickerType}
                  onValueChange={(v) => handlePickerTypeChange(v as ProjectRelatedTo)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {relatedToTypes.map((type) => {
                      const Icon = relatedToConfig[type].icon;
                      return (
                        <SelectItem key={type} value={type}>
                          <span className="flex items-center gap-2">
                            <Icon size={13} className="text-muted-foreground" />
                            {relatedToConfig[type].label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <RelatedRecordCombobox
                  relatedTo={pickerType}
                  value={pickerRecord}
                  onChange={setPickerRecord}
                />
              </div>
              {relatedError && (
                <p className="text-xs text-destructive">{relatedError}</p>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="projectDescription">Description</Label>
            <Textarea
              id="projectDescription"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="What is this project about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate ? form.startDate.slice(0, 10) : ""}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value || null }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate ? form.dueDate.slice(0, 10) : ""}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value || null }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: any) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ProjectMembersPicker
            selectedMemberIds={form.members || []}
            onChange={(members) => setForm((f) => ({ ...f, members }))}
          />

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="design, urgent, q3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}