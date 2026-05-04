"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

export default function ProblemFilters({ categories, currentFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentFilters.search || "");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (currentFilters.search || "")) {
        updateFilter("search", search);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-5 border-b border-border/50">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-foreground">Problems</h1>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
      
      <div className="flex gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50 focus:border-primary/50 rounded-lg"
          />
        </div>
        
        <Select 
          value={currentFilters.category || "all"} 
          onValueChange={(v) => updateFilter("category", v)}
        >
          <SelectTrigger className="w-36 bg-secondary/50 border-border/50 rounded-lg">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={currentFilters.difficulty || "all"} 
          onValueChange={(v) => updateFilter("difficulty", v)}
        >
          <SelectTrigger className="w-32 bg-secondary/50 border-border/50 rounded-lg">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
