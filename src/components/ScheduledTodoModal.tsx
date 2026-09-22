import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Calendar, Clock, Plus, CheckCircle2, Circle, Trash2, 
  Sparkles, Check, AlertTriangle, ListTodo
} from "lucide-react";
import { ScheduledTodo, TodoPriority } from "../lib/types";

interface ScheduledTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todos: ScheduledTodo[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (todo: Omit<ScheduledTodo, "id" | "createdAt">) => void;
  onDeleteTodo: (id: string) => void;
  onAiExtractTasks?: () => void;
  isExtractingAi?: boolean;
}

export default function ScheduledTodoModal({
  isOpen,
  onClose,
  todos,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onAiExtractTasks,
  isExtractingAi = false,
}: ScheduledTodoModalProps) {
  const [filter, setFilter] = useState<"all" | "today" | "upcoming" | "completed">("all");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const todayStr = new Date().toISOString().split("T")[0];
  const [dueDate, setDueDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState("14:00");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [category, setCategory] = useState("Development");

  const today = new Date().toISOString().split("T")[0];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTodo({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      completed: false,
      category,
    });

    setTitle("");
    setDescription("");
    setShowAddForm(false);
  };

  const setQuickDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split("T")[0]);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.length - completedCount;
  const todayTodos = todos.filter(t => !t.completed && t.dueDate === today);
  const overdueTodos = todos.filter(t => !t.completed && t.dueDate < today);

  const filtered = useMemo(() => {
    return todos.filter(t => {
      if (filter === "completed") return t.completed;
      if (filter === "today") return !t.completed && t.dueDate === today;
      if (filter === "upcoming") return !t.completed && t.dueDate > today;
      return true;
    });
  }, [todos, filter, today]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className="relative w-full max-w-3xl bg-surface border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[88vh]"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-black shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                  <Calendar size={22} />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl uppercase tracking-tight text-white flex items-center gap-2">
                    <span>Scheduled To-Do Manager</span>
                    {todayTodos.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {todayTodos.length} Due Today
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Plan, organize, and execute scheduled tasks with neural AI integration.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-white/5 text-text-secondary hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 sm:px-8 sm:py-4 border-b border-white/5 bg-white/[0.01]">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Total Scheduled</div>
                <div className="text-xl font-bold font-display text-white mt-0.5">{todos.length}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Due Today</div>
                <div className="text-xl font-bold font-display text-amber-300 mt-0.5">{todayTodos.length}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Pending</div>
                <div className="text-xl font-bold font-display text-white mt-0.5">{pendingCount}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Completed</div>
                <div className="text-xl font-bold font-display text-emerald-400 mt-0.5">{completedCount}</div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 custom-scrollbar">
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                  {(["all", "today", "upcoming", "completed"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        filter === f ? "bg-white text-black shadow-md" : "text-text-secondary hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {onAiExtractTasks && (
                    <button
                      type="button"
                      onClick={onAiExtractTasks}
                      disabled={isExtractingAi}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Sparkles size={14} className={isExtractingAi ? "animate-spin text-emerald-400" : "text-emerald-400"} />
                      <span>AI Extract from Chat</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg"
                  >
                    <Plus size={14} />
                    <span>Schedule Task</span>
                  </button>
                </div>
              </div>

              {/* Add Task Form Collapsible */}
              {showAddForm && (
                <form
                  onSubmit={handleAddSubmit}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-3 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Create Scheduled To-Do
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-text-secondary hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task name (e.g. Conduct neural safety evaluation)..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-emerald-400"
                  />

                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Notes or operational instructions (optional)..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-emerald-400 resize-none"
                  />

                  {/* Date, Time, Category, Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        required
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                        Scheduled Time
                      </label>
                      <input
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TodoPriority)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="low" className="bg-surface text-white">Low Priority</option>
                        <option value="medium" className="bg-surface text-white">Medium Priority</option>
                        <option value="high" className="bg-surface text-white">High Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Development" className="bg-surface text-white">Development</option>
                        <option value="Research" className="bg-surface text-white">Research</option>
                        <option value="Architecture" className="bg-surface text-white">Architecture</option>
                        <option value="Review" className="bg-surface text-white">Review</option>
                        <option value="Operations" className="bg-surface text-white">Operations</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-text-secondary font-bold uppercase">Quick Date:</span>
                      <button
                        type="button"
                        onClick={() => setQuickDate(0)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDate(1)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold"
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDate(7)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold"
                      >
                        In 1 Week
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Check size={14} />
                      <span>Save Scheduled Task</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Overdue Alert Banner if any */}
              {overdueTodos.length > 0 && filter !== "completed" && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                    <span>
                      You have <strong>{overdueTodos.length} overdue task{overdueTodos.length > 1 ? "s" : ""}</strong> requiring attention.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilter("today")}
                    className="font-bold underline uppercase text-[10px]"
                  >
                    View
                  </button>
                </div>
              )}

              {/* Task Cards List */}
              <div className="space-y-2.5">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-2 rounded-2xl border border-white/5 bg-white/[0.01]">
                    <ListTodo size={32} className="mx-auto text-text-secondary/40" />
                    <p className="text-xs text-text-secondary">
                      {filter === "completed"
                        ? "No completed tasks yet."
                        : filter === "today"
                        ? "No tasks scheduled for today."
                        : "No scheduled tasks in this view."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(true)}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      + Create your first scheduled task
                    </button>
                  </div>
                ) : (
                  filtered.map((todo) => {
                    const isOverdue = !todo.completed && todo.dueDate < today;
                    const isToday = !todo.completed && todo.dueDate === today;

                    return (
                      <div
                        key={todo.id}
                        className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 group ${
                          todo.completed
                            ? "bg-white/[0.01] border-white/5 opacity-60"
                            : isOverdue
                            ? "bg-rose-500/[0.04] border-rose-500/25"
                            : isToday
                            ? "bg-amber-500/[0.04] border-amber-500/25"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onToggleTodo(todo.id)}
                          className="mt-0.5 text-text-secondary hover:text-emerald-400 transition-colors shrink-0"
                        >
                          {todo.completed ? (
                            <CheckCircle2 size={18} className="text-emerald-400 fill-emerald-500/20" />
                          ) : (
                            <Circle size={18} className="text-white/40 hover:text-emerald-400" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                todo.completed ? "line-through text-text-secondary" : "text-white"
                              }`}
                            >
                              {todo.title}
                            </span>

                            <button
                              type="button"
                              onClick={() => onDeleteTodo(todo.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-rose-400 rounded-lg hover:bg-white/5 transition-all"
                              title="Delete task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {todo.description && (
                            <p className="text-xs text-text-secondary mt-1">{todo.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[10px] font-mono">
                            {/* Date Badge */}
                            <span
                              className={`px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                                todo.completed
                                  ? "bg-white/5 border-white/5 text-text-secondary"
                                  : isOverdue
                                  ? "bg-rose-500/20 border-rose-500/30 text-rose-300 font-bold"
                                  : isToday
                                  ? "bg-amber-500/20 border-amber-500/30 text-amber-300 font-bold"
                                  : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                              }`}
                            >
                              <Calendar size={11} />
                              <span>{todo.dueDate}</span>
                              {todo.dueTime && (
                                <>
                                  <span>•</span>
                                  <Clock size={11} />
                                  <span>{todo.dueTime}</span>
                                </>
                              )}
                              {isOverdue && <span>(Overdue)</span>}
                            </span>

                            {/* Priority */}
                            <span
                              className={`px-2 py-0.5 rounded-md uppercase font-bold tracking-wider border ${
                                todo.priority === "high"
                                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                                  : todo.priority === "medium"
                                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                              }`}
                            >
                              {todo.priority}
                            </span>

                            {todo.category && (
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-text-secondary">
                                {todo.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-text-secondary">
              <span>All scheduled to-dos automatically persist to your browser profile.</span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
