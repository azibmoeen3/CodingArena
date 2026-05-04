"use client";

import { useMemo } from "react";
import { format, subDays, startOfToday, isSameDay, eachDayOfInterval } from "date-fns";

export default function ContributionGraph({ submissions }) {
  const days = useMemo(() => {
    const today = startOfToday();
    const interval = eachDayOfInterval({
      start: subDays(today, 104), // Show last 15 weeks
      end: today,
    });

    return interval.map((date) => {
      const count = submissions.filter((s) => 
        isSameDay(new Date(s.createdAt), date)
      ).length;
      
      let level = 0;
      if (count > 0) level = 1;
      if (count > 2) level = 2;
      if (count > 4) level = 3;
      if (count > 7) level = 4;

      return {
        date,
        count,
        level,
      };
    });
  }, [submissions]);

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Activity</h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Last 15 Weeks</span>
      </div>
      
      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
        {days.map((day, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-[2px] transition-colors cursor-pointer relative group ${
              day.level === 0 ? "bg-white/5" :
              day.level === 1 ? "bg-primary/30" :
              day.level === 2 ? "bg-primary/50" :
              day.level === 3 ? "bg-primary/70" :
              "bg-primary"
            }`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-[10px] rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-xl">
              {day.count} submissions on {format(day.date, "MMM d, yyyy")}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-[1px] bg-white/5" />
          <div className="w-2 h-2 rounded-[1px] bg-primary/30" />
          <div className="w-2 h-2 rounded-[1px] bg-primary/50" />
          <div className="w-2 h-2 rounded-[1px] bg-primary/70" />
          <div className="w-2 h-2 rounded-[1px] bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
