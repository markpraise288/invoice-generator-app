import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { Expense, Sale, FinanceStats, MonthlyFinanceData } from "@/types/finance";
import toast from "react-hot-toast";

export const useFinanceStats = () => {
  return useQuery({
    queryKey: ["finance-stats"],
    queryFn: async (): Promise<FinanceStats> => {
      const res = await apiFetch("/finance/stats");
      return res.data;
    },
  });
};

export const useMonthlyFinanceData = () => {
  return useQuery({
    queryKey: ["monthly-finance-data"],
    queryFn: async (): Promise<MonthlyFinanceData[]> => {
      const res = await apiFetch("/finance/monthly");
      return res.data;
    },
  });
};

export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async (): Promise<Expense[]> => {
      const res = await apiFetch("/expenses");
      return res.data.data;
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
      const res = await apiFetch("/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-finance-data"] });
      toast.success("Expense created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Expense) => {
      const res = await apiFetch(`/expenses/${data._id}`, {
        method: "PUT",
        body: JSON.stringify({title: data.title, amount: data.amount, category: data.category, date: data.date, notes: data.notes}),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-finance-data"] });
      toast.success("Expense updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/expenses/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-finance-data"] });
      toast.success("Expense deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async (): Promise<Sale[]> => {
      const res = await apiFetch("/sales");
      const data = res.data.data;
      return data;
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Sale, "id" | "createdAt" | "updatedAt">) => {
      const res = await apiFetch("/sales", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-finance-data"] });
      toast.success("Sale recorded successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Sale) => {
      const res = await apiFetch(`/sales/${data._id}`, {
        method: "PUT",
        body: JSON.stringify({client: data.client, amount: data.amount, status: data.status, date: data.date}),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-finance-data"] });
      toast.success("Sale updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/sales/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-finance-data"] });
      toast.success("Sale deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};
