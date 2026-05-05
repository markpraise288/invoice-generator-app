"use client";

import { useMemo, useState, useEffect } from "react";
import ClientsTable from "@/components/clientsUI/ClientsTable";
import ClientsForm from "@/components/clientsUI/ClientsForm";
import { UserPlus, Search, SlidersHorizontal } from "lucide-react";
import { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const locations = useMemo(() => {
    const unique = new Set(clients.map((c) => c.address).filter((a): a is string => !!a));
    return ["all", ...Array.from(unique)];
  }, [clients]);

  const filteredClients = useMemo(() => {
    let data = [...clients];

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.phone.toLowerCase().includes(s),
      );
    }

    if (locationFilter !== "all") {
      data = data.filter((c) => c.address === locationFilter);
    }

    if (statusFilter === "active") {
      data = data.filter((c) => !c.isDeletedAt);
    } else if (statusFilter === "deleted") {
      data = data.filter((c) => !!c.isDeletedAt);
    }

    if (sort === "asc") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "desc") {
      data.sort((a, b) => b.name.localeCompare(a.name));
    }

    return data;
  }, [clients, search, sort, locationFilter, statusFilter]);

  const handleEdit = (client: Client) => {
    setNewClient(client);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setNewClient({ name: "", email: "", phone: "", address: "" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate(newClient as Client, {
      onSuccess: () => {
        setIsAddingClient(false);
        resetForm();
      }
    });
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient._id) return;
    updateMutation.mutate({
      id: newClient._id,
      data: newClient as Client
    }, {
      onSuccess: () => {
        setIsEditing(false);
        resetForm();
      }
    });
  };

  const resetFilters = () => {
    setSearch("");
    setSort("none");
    setLocationFilter("all");
    setStatusFilter("active");
  };

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your clients here.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsAddingClient(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-blue-950 dark:text-gray-50 dark:hover:bg-blue-800"
        >
          <UserPlus size={18} className="mr-2" />
          Add Client
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 w-full sm:w-64 bg-gray-50 dark:bg-gray-900">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search clients..."
            className="outline-none w-full bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="border rounded-xl px-3 py-2 bg-white dark:bg-gray-900">
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc === "all" ? "All Locations" : loc}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-xl px-3 py-2 bg-white dark:bg-gray-900">
          <option value="active">Active</option>
          <option value="deleted">Deleted</option>
          <option value="all">All</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="border rounded-xl px-3 py-2 bg-white dark:bg-gray-900">
          <option value="none">Sort</option>
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>

        <Button variant="outline" onClick={resetFilters}>
          <SlidersHorizontal size={16} className="mr-2" />
          Reset
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <ClientsTable clients={filteredClients} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {(isAddingClient || isEditing) && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <ClientsForm
            isAddingClient={isAddingClient}
            setIsAddingClient={setIsAddingClient}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            saveEdit={saveEdit}
            client={newClient}
          />
        </div>
      )}
    </div>
  );
}
