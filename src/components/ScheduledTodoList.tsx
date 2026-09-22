import { useState, useMemo } from "react";
import { 
  CheckCircle2, Circle, Calendar, Clock, Plus, Trash2, 
  Sparkles, Check
} from "lucide-react";
import { ScheduledTodo, TodoPriority } from "../lib/types";

interface ScheduledTodoListProps {
  todos: ScheduledTodo[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (todo: Omit<ScheduledTodo, "id" | "createdAt">) => void;
  onDeleteTodo: (id: string) => void;
  onAiExtractTasks?: () => void;
  isExtractingAi?: boolean;
  compact?: boolean;
}

export default function ScheduledTodoList({
  todos,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onAiExtractTasks,
  isExtractingAi = false,
  compact = false,
}: ScheduledTodoListProps) {
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "completed">("all");
  const [isAdding, setIsAdding] = useState(false);
  
  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const todayStr = new Date().toISOString().split("T")[0];
  const [newDueDate, setNewDueDate] = useState(todayStr);
  const [newDueTime, setNewDueTime] = useState("14:00");
  const [newPriority, setNewPriority] = useState<TodoPriority>("medium");
  const [newCategory, setNewCategory] = useState("Development");

  const today = new Date().toISOString().split("T")[0];

  // Helper to format scheduled date nicely
  const formatScheduledDate = (dueDate?: string, dueTime?: string) => {
    if (!dueDate) {
      return {
        dateLabel: "No date",
        timeLabel: "",
        isToday: false,
        isTomorrow: false,
        isOverdue: false,
      };
    }
    const isToday = dueDate === today;
    
    // Check if tomorrow
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const tomStr = tom.toISOString().split("T")[0];
    const isTomorrow = dueDate === tomStr;

    // Check if overdue
    const isOverdue = dueDate < today;

    let dateLabel = dueDate;
    if (isToday) dateLabel = "Today";
    else if (isTomorrow) dateLabel = "Tomorrow";
    else {
      const parts = dueDate.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        dateLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      }
    }

    let timeLabel = "";
    if (dueTime) {
      const [h, m] = dueTime.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      timeLabel = `${displayHour}:${m} ${ampm}`;
    }

    return {
      dateLabel,
      timeLabel,
      isToday,
      isTomorrow,
      isOverdue,
    };
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTodo({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      dueDate: newDueDate,
      dueTime: newDueTime || undefined,
      priority: newPriority,
      completed: false,
      category: newCategory,
    });

    setNewTitle("");
    setNewDescription("");
    setIsAdding(false);
  };

  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setNewDueDate(d.toISOString().split("T")[0]);
  };

  // Filtered tasks
  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      if (filter === "completed") return item.completed;
      if (filter === "today") return !item.completed && item.dueDate === today;
      if (filter === "upcoming") return !item.completed && item.dueDate > today;
      return true; // "all"
    });
  }, [todos, filter, today]);

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.length - completedCount;
  const todayCount = todos.filter(t => !t.completed && t.dueDate === today).length;
  const completionPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className={`flex-1 flex flex-col min-h-0 ${compact ? "p-0" : ""}`}>
      {/* Header & Quick Stats */}
      <div className="px-5 pt-3 pb-2 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
            <Calendar size={13} className="text-emerald-400" />
            <span>Scheduled Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            {todayCount > 0 && (
              <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                {todayCount} Today
              </span>
            )}
            <span className="text-[9px] font-mono text-text-secondary">
              {pendingCount} Pending · {completedCount} Done
            </span>
          </div>
        </div>

        {/* Action Buttons: Add Task & AI Extractor */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all group shadow-sm"
          >
            <Plus size={14} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
            <span>Schedule Task</span>
          </button>

          {onAiExtractTasks && (
            <button
              type="button"
              onClick={onAiExtractTasks}
              disabled={isExtractingAi}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              title="Extract action items from current conversation"
            >
              <Sparkles size={13} className={isExtractingAi ? "animate-spin" : "text-emerald-400"} />
              <span className="hidden sm:inline">AI Tasks</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/5">
          {(["all", "today", "upcoming", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? "bg-white text-black shadow-sm"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        {todos.length > 0 && (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Inline Quick Add Task Form */}
      {isAdding && (
        <form onSubmit={handleCreateTask} className="mx-4 my-2 p-3.5 rounded-2xl bg-white/[0.04] border border-emerald-500/30 space-y-2.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <span>New Scheduled Task</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-text-secondary hover:text-white"
            >
              Cancel
            </button>
          </div>

          <input
            type="text"
            autoFocus
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task title (e.g., Deploy benchmark tests)..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-emerald-400"
          />

          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Details or notes (optional)..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-emerald-400"
          />

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-text-secondary text-[9px] uppercase font-bold">Quick Date:</span>
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase transition-all ${
                newDueDate === today ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/10 text-white/70 hover:text-white"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-[9px] font-bold uppercase"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(7)}
              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-[9px] font-bold uppercase"
            >
              Next Week
            </button>
          </div>

          {/* Date and Time Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                Due Time
              </label>
              <input
                type="time"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Priority & Category */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1">
              {(["low", "medium", "high"] as TodoPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                    newPriority === p
                      ? p === "high"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                        : p === "medium"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-white/5 border-white/5 text-text-secondary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Development">Dev</option>
                <option value="Research">Research</option>
                <option value="Operations">Ops</option>
                <option value="Review">Review</option>
              </select>

              <button
                type="submit"
                className="py-1.5 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-[11px] font-extrabold uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center gap-1 transition-all"
              >
                <Check size={13} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2">
            <Calendar size={28} className="mx-auto text-text-secondary/40" />
            <p className="text-xs text-text-secondary">
              {filter === "completed"
                ? "No completed tasks yet."
                : filter === "today"
                ? "No tasks due today. All caught up!"
                : "No scheduled tasks found."}
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="text-[11px] text-emerald-400 hover:underline font-semibold"
            >
              + Add a new scheduled task
            </button>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const dateMeta = formatScheduledDate(todo.dueDate, todo.dueTime);

            return (
              <div
                key={todo.id}
                className={`group p-3 rounded-2xl border transition-all ${
                  todo.completed
                    ? "bg-white/[0.02] border-white/5 opacity-60"
                    : dateMeta.isOverdue
                    ? "bg-rose-500/[0.04] border-rose-500/25 shadow-sm"
                    : dateMeta.isToday
                    ? "bg-amber-500/[0.04] border-amber-500/25"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Toggle Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleTodo(todo.id)}
                    className="mt-0.5 text-text-secondary hover:text-emerald-400 transition-colors shrink-0"
                    title={todo.completed ? "Mark as pending" : "Mark as completed"}
                  >
                    {todo.completed ? (
                      <CheckCircle2 size={16} className="text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle size={16} className="text-white/40 hover:text-emerald-400" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`text-xs font-semibold leading-snug break-words ${
                          todo.completed
                            ? "line-through text-text-secondary"
                            : "text-white"
                        }`}
                      >
                        {todo.title}
                      </span>

                      {/* Delete button on hover */}
                      <button
                        type="button"
                        onClick={() => onDeleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-rose-400 rounded transition-all shrink-0"
                        title="Delete task"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {todo.description && (
                      <p className="text-[11px] text-text-secondary/80 mt-0.5 line-clamp-2">
                        {todo.description}
                      </p>
                    )}

                    {/* Metadata Badges: Due Date, Time, Priority, Category */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[9px] font-mono">
                      {/* Scheduled Date/Time Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold border ${
                          todo.completed
                            ? "bg-white/5 border-white/5 text-text-secondary"
                            : dateMeta.isOverdue
                            ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                            : dateMeta.isToday
                            ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                            : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                        }`}
                      >
                        <Calendar size={10} />
                        <span>{dateMeta.dateLabel}</span>
                        {dateMeta.timeLabel && (
                          <>
                            <span>•</span>
                            <Clock size={9} />
                            <span>{dateMeta.timeLabel}</span>
                          </>
                        )}
                        {!todo.completed && dateMeta.isOverdue && (
                          <span className="text-[8px] uppercase tracking-wider font-bold text-rose-400">
                            (Overdue)
                          </span>
                        )}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                          todo.priority === "high"
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                            : todo.priority === "medium"
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {todo.priority}
                      </span>

                      {/* Category */}
                      {todo.category && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-text-secondary">
                          {todo.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
