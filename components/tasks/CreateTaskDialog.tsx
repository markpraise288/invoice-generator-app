// components/tasks/CreateTaskDialog.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { useCreateTask } from "@/hooks/useTasks";
import { priorityConfig } from "./TaskItem";
import type { CreateTaskPayload, TaskPriority, RelatedToType } from "@/hooks/useTasks";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Target,
  Handshake,
  Users,
  FolderKanban,
  Contact,
  Building2,
  Link2,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTeam } from "@/hooks/useSettings"

// ─── Related entity display config ─────────────────────────────────────────────

const relatedToConfig: Record<
  RelatedToType,
  { label: string; icon: React.ElementType; searchEndpoint: string; labelField: string; subField?: string }
> = {
  Lead: { label: "Lead", icon: Target, searchEndpoint: "/leads", labelField: "name", subField: "email" },
  Deal: { label: "Deal", icon: Handshake, searchEndpoint: "/deals", labelField: "title" },
  Customer: { label: "Customer", icon: Users, searchEndpoint: "/customers", labelField: "name", subField: "email" },
  Project: { label: "Project", icon: FolderKanban, searchEndpoint: "/projects", labelField: "name" },
  Contact: { label: "Contact", icon: Contact, searchEndpoint: "/contacts", labelField: "name", subField: "email" },
  Company: { label: "Company", icon: Building2, searchEndpoint: "/companies", labelField: "name" },
};

const relatedToTypes = Object.keys(relatedToConfig) as RelatedToType[];

// ─── Team member type (matches your User model's public fields) ───────────────

interface TeamMember {
  _id: string;
  name: string;
  email: string;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// ─── Assignee picker ────────────────────────────────────────────────────────────
// Searchable combobox over your team, same pattern as ProjectMembersPicker/
// CustomerCompanyContactFields — fetches on open, filters client-side once loaded
// since team rosters are typically small (adjust to server-side search if yours
// isn't).

function AssigneeCombobox({
  value,
  currentUserId,
  onChange,
  disabled,
}: {
  value: string;
  currentUserId: string;
  onChange: (userId: string, member: TeamMember) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const { data: members, isLoading } = useTeam();

  const options: TeamMember[] = Array.isArray(members) ? members : [];
  const selected = options.find((m) => m._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-9 w-full justify-between text-sm font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">
                    {getInitials(selected.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {selected._id === currentUserId ? `${selected.name} (Me)` : selected.name}
                </span>
              </>
            ) : (
              <>
                <UserRound size={13} className="text-muted-foreground" />
                Select assignee...
              </>
            )}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search team members..." />
          <CommandList>
            <CommandEmpty>{isLoading ? "Loading team..." : "No members found."}</CommandEmpty>
            <CommandGroup>
              {options.map((member) => (
                <CommandItem
                  key={member._id}
                  value={member.name}
                  onSelect={() => {
                    onChange(member._id, member);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === member._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {member._id === currentUserId ? `${member.name} (Me)` : member.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Generic record search combobox (used only in relatedTo picker mode) ──────

interface RecordOption {
  _id: string;
  [key: string]: any;
}

function RelatedRecordCombobox({
  relatedTo,
  value,
  onChange,
  disabled,
}: {
  relatedTo: RelatedToType;
  value: { id: string; label: string } | null;
  onChange: (record: { id: string; label: string } | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const config = relatedToConfig[relatedTo];

  const { data, isLoading } = useQuery({
    queryKey: [config.searchEndpoint, "task-link-search", search],
    queryFn: async () => {
      const res = await apiFetch(
        `${config.searchEndpoint}?search=${encodeURIComponent(search)}&limit=10`
      );
      const items = res.data?.items ?? res.data ?? [];
      const key = Object.keys(res.data || {}).find((k) => Array.isArray(res.data[k]));
      return (key ? res.data[key] : items) as RecordOption[];
    },
    enabled: open,
  });

  const options: RecordOption[] = Array.isArray(data) ? data : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-9 w-full justify-between text-sm font-normal"
        >
          <span className="truncate">{value ? value.label : `Search ${config.label.toLowerCase()}s...`}</span>
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
                const label = option[config.labelField] ?? option._id;
                const sub = config.subField ? option[config.subField] : undefined;
                return (
                  <CommandItem
                    key={option._id}
                    value={option._id}
                    onSelect={() => {
                      onChange(
                        value?.id === option._id ? null : { id: option._id, label }
                      );
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
                      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
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

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedId?: string;
  relatedTo?: RelatedToType;
  relatedLabel?: string;
  currentUserId: string | null; // logged-in user — used as the default assignee only
  onSuccess?: () => void;
}

// ─── Default State ─────────────────────────────────────────────────────────────

const getDefaultState = (currentUserId: string) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const defaultDue = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T09:00`;

  return {
    title: "",
    description: "",
    dueDate: defaultDue,
    priority: "medium" as TaskPriority,
    assignedTo: currentUserId,
  };
};

// ─── Field Error ───────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle size={11} />
      {message}
    </span>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CreateTaskDialog({
  open,
  onOpenChange,
  relatedId,
  relatedTo,
  relatedLabel,
  currentUserId,
  onSuccess,
}: CreateTaskDialogProps) {
  const [form, setForm] = useState(() => getDefaultState(currentUserId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: createTask, isPending } = useCreateTask();

  const isFixedContext = !!relatedId && !!relatedTo;
  const [pickerType, setPickerType] = useState<RelatedToType>("Lead");
  const [pickerRecord, setPickerRecord] = useState<{ id: string; label: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    setForm((prev) => ({ ...prev, priority }));
  };

  const handleAssigneeChange = (userId: string) => {
    setForm((prev) => ({ ...prev, assignedTo: userId }));
    if (errors.assignedTo) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.assignedTo;
        return next;
      });
    }
  };

  const handlePickerTypeChange = (type: RelatedToType) => {
    setPickerType(type);
    setPickerRecord(null);
    if (errors.related) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.related;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Task title is required";
    if (!form.dueDate) next.dueDate = "Due date is required";
    if (form.dueDate && new Date(form.dueDate) <= new Date()) {
      next.dueDate = "Due date must be in the future";
    }
    if (!form.assignedTo) next.assignedTo = "Choose who this task is assigned to";
    if (!isFixedContext && !pickerRecord) {
      next.related = "Choose a record to link this task to";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isPending) return;

    const finalRelatedId = isFixedContext ? relatedId! : pickerRecord!.id;
    const finalRelatedTo = isFixedContext ? relatedTo! : pickerType;

    const payload: CreateTaskPayload = {
      title: form.title.trim(),
      relatedId: finalRelatedId,
      relatedTo: finalRelatedTo,
      assignedTo: form.assignedTo,
      dueDate: new Date(form.dueDate).toISOString(),
      priority: form.priority,
    };

    if (form.description.trim()) {
      payload.description = form.description.trim();
    }

    createTask(payload, {
      onSuccess: () => {
        setForm(getDefaultState(currentUserId));
        setErrors({});
        setPickerType("Lead");
        setPickerRecord(null);
        onSuccess?.();
        onOpenChange(false);
      },
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(getDefaultState(currentUserId));
      setErrors({});
      setPickerType("Lead");
      setPickerRecord(null);
    }
    onOpenChange(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedPriority = priorityConfig[form.priority];
  const fixedConfig = relatedTo ? relatedToConfig[relatedTo] : null;
  const FixedIcon = fixedConfig?.icon ?? Link2;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CheckSquare size={16} className="text-primary" />
            New Task
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* ── Linked record: locked chip OR picker ── */}
          {isFixedContext ? (
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Linked to</Label>
              <Badge
                variant="outline"
                className="w-fit gap-1.5 py-1.5 px-2.5 font-normal text-foreground"
              >
                <FixedIcon size={12} className="text-muted-foreground" />
                <span className="text-muted-foreground">{fixedConfig?.label}:</span>
                <span className="font-medium">{relatedLabel || relatedId}</span>
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Label className="text-xs">
                Link to
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={pickerType} onValueChange={handlePickerTypeChange} disabled={isPending}>
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
                  disabled={isPending}
                />
              </div>
              <FieldError message={errors.related} />
            </div>
          )}

          {/* ── Title ── */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="title" className="text-xs">
              Title
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Send proposal, Follow up call"
              className={cn(
                "h-9",
                errors.title && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isPending}
              autoFocus={isFixedContext}
            />
            <FieldError message={errors.title} />
          </div>

          {/* ── Description ── */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="description" className="text-xs">
              Description
              <span className="text-muted-foreground ml-1 font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add any details or context..."
              rows={3}
              className="resize-none text-sm"
              disabled={isPending}
            />
          </div>

          {/* ── Assignee ── */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs">
              Assigned to
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <AssigneeCombobox
              value={form.assignedTo}
              currentUserId={currentUserId}
              onChange={handleAssigneeChange}
              disabled={isPending}
            />
            <FieldError message={errors.assignedTo} />
          </div>

          {/* ── Due date + Priority row ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="dueDate" className="text-xs">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock size={11} />
                  Due date
                  <span className="text-destructive ml-0.5">*</span>
                </span>
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={form.dueDate}
                onChange={handleChange}
                className={cn(
                  "h-9 text-sm",
                  errors.dueDate &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isPending}
              />
              <FieldError message={errors.dueDate} />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs">Priority</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-between text-sm font-medium",
                      selectedPriority.className
                    )}
                    disabled={isPending}
                  >
                    {selectedPriority.label}
                    <ChevronDown size={13} className="ml-1 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  {(Object.keys(priorityConfig) as TaskPriority[]).map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => handlePriorityChange(p)}
                      className={cn(
                        "text-xs font-medium",
                        form.priority === p && "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "mr-2 size-2 rounded-full inline-block",
                          p === "low" && "bg-slate-400",
                          p === "medium" && "bg-blue-400",
                          p === "high" && "bg-amber-400",
                          p === "urgent" && "bg-rose-500"
                        )}
                      />
                      {priorityConfig[p].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex items-center gap-1 mr-auto">
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">
              ⌘
            </kbd>
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">
              ↵
            </kbd>
            <span className="text-[11px] text-muted-foreground ml-0.5">
              to save
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}