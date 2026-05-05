"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";

export default function GlobalSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const ref = useRef<HTMLDivElement>(null);

  // 🔥 CLOSE ON OUTSIDE CLICK (FIXED BUG)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 🔥 FETCH SEARCH RESULTS (DEBOUNCED)
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const res = await apiFetch(`/search?q=${query}`);
        setResults(res);
        setOpen(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  // 🔥 LOAD HISTORY
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await apiFetch("/search/history");
        setHistory(res);
      } catch {}
    };
    loadHistory();
  }, []);

  // 🔥 SAVE SEARCH
  const handleSelect = async (item: any) => {
    if (query) {
      await apiFetch("/search/history", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
    }

    if (item.type === "invoice") {
      router.push(`/invoices/${item.data._id}`);
    } else if (item.type === "client") {
      router.push(`/clients/${item.data._id}`);
    }

    setOpen(false);
    setQuery("");
  };

  // 🔥 KEYBOARD NAVIGATION
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }

    if (e.key === "Enter" && results[activeIndex]) {
      handleSelect(results[activeIndex]);
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      {/* INPUT */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl px-3 py-2">
        <Search size={18} className="text-gray-400" />

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search invoices, clients..."
          className="bg-transparent border-none focus-visible:ring-0"
        />

        {query && (
          <button onClick={() => setQuery("")}>
            <X size={16} className="text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 border rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">

          {/* 🔹 RESULTS */}
          {results.length > 0 ? (
            results.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelect(item)}
                className={`px-4 py-2 cursor-pointer text-sm flex justify-between ${
                  index === activeIndex
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span>
                  {item.type === "invoice"
                    ? `Invoice #${item.data.invoiceNumber}`
                    : item.data.name}
                </span>

                <span className="text-xs text-gray-400 uppercase">
                  {item.type}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-500">
              No results found
            </div>
          )}

          {/* 🔹 HISTORY */}
          {!query && history.length > 0 && (
            <div className="border-t p-3">
              <p className="text-xs text-gray-400 mb-2">Recent</p>
              {history.map((h) => (
                <div
                  key={h._id}
                  onClick={() => setQuery(h.query)}
                  className="text-sm cursor-pointer hover:text-blue-500"
                >
                  {h.query}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}