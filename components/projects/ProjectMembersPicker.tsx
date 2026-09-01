"use client";

import { useQuery } from "@tanstack/react-query";
import { X, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { apiFetch } from "@/lib/apiFetch";
import { useTeam } from "@/hooks/useSettings";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
}

interface ProjectMembersPickerProps {
  selectedMemberIds: string[];
  onChange: (memberIds: string[]) => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function ProjectMembersPicker({
  selectedMemberIds,
  onChange,
}: ProjectMembersPickerProps) {
  const { data: allMembers } = useTeam();

  const selected = (allMembers ?? []).filter((m) =>
    selectedMemberIds.includes(m._id)
  );
  const available = (allMembers ?? []).filter(
    (m) => !selectedMemberIds.includes(m._id)
  );

  const addMember = (id: string) => {
    onChange([...selectedMemberIds, id]);
  };

  const removeMember = (id: string) => {
    onChange(selectedMemberIds.filter((m) => m !== id));
  };

  return (
    <div className="grid gap-2">
      <Label>Team Members</Label>

      <div className="flex flex-wrap items-center gap-2">
        {selected.map((member) => (
          <div
            key={member._id}
            className="flex items-center gap-1.5 rounded-full border bg-muted/50 py-1 pl-1 pr-2"
          >
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-foreground">{member.name}</span>
            <button
              type="button"
              onClick={() => removeMember(member._id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-full">
              <UserPlus className="h-3.5 w-3.5" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search team members..." />
              <CommandList>
                <CommandEmpty>No members found.</CommandEmpty>
                <CommandGroup>
                  {available.map((member) => (
                    <CommandItem
                      key={member._id}
                      value={member.name}
                      onSelect={() => addMember(member._id)}
                    >
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm">{member.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {member.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}