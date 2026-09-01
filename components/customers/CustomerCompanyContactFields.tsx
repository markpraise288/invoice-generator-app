"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { apiFetch } from "@/lib/apiFetch";
import { useQuery } from "@tanstack/react-query";

interface LinkOption {
  _id: string;
  name: string;
  email?: string;
}

interface EntityComboboxProps {
  label: string;
  placeholder: string;
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  searchEndpoint: string; // e.g. "/companies" or "/contacts"
}

function EntityCombobox({
  label,
  placeholder,
  value,
  onChange,
  searchEndpoint,
}: EntityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [searchEndpoint, "combobox", search],
    queryFn: async () => {
      const res = await apiFetch(
        `${searchEndpoint}?search=${encodeURIComponent(search)}&limit=10`
      );
      return res.data?.items ?? res.data ?? [];
    },
    enabled: open,
  });

  const options: LinkOption[] = Array.isArray(data) ? data : [];
  const selected = options.find((o) => o._id === value);

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between font-normal"
          >
            <span className="truncate">
              {selected ? selected.name : placeholder}
            </span>
            <div className="flex items-center gap-1">
              {value && (
                <X
                  className="h-3.5 w-3.5 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                  }}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Searching..." : "No results found."}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option._id}
                    value={option._id}
                    onSelect={() => {
                      onChange(option._id === value ? null : option._id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{option.name}</span>
                      {option.email && (
                        <span className="text-xs text-muted-foreground">
                          {option.email}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface CustomerCompanyContactFieldsProps {
  company: string | null | undefined;
  contact: string | null | undefined;
  onCompanyChange: (id: string | null) => void;
  onContactChange: (id: string | null) => void;
}

export function CustomerCompanyContactFields({
  company,
  contact,
  onCompanyChange,
  onContactChange,
}: CustomerCompanyContactFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <EntityCombobox
        label="Company"
        placeholder="Link a company..."
        value={company}
        onChange={onCompanyChange}
        searchEndpoint="/companies"
      />
      <EntityCombobox
        label="Contact"
        placeholder="Link a contact..."
        value={contact}
        onChange={onContactChange}
        searchEndpoint="/contacts"
      />
    </div>
  );
}