import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Tag,
  Volume2,
  Send,
} from 'lucide-react';
import { todoApi, CreateTodoParams } from '../../api/todo.api';
import { TodoPriority, TodoStatus } from '../../types';
import { formatDate } from '../../utils/cn';

export const TodoPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<CreateTodoParams>({
    title: '',
    description: '',
    priority: TodoPriority.MEDIUM,
    category: 'Robot Project',
    dueDate: '',
  });

  // Load todo list
  const { data: todoRes, isLoading } = useQuery({
    queryKey: ['todo'],
    queryFn: () => todoApi.getTodoList(),
  });
  const todos = todoRes?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (params: CreateTodoParams) => todoApi.createTodo(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo'] });
      setIsModalOpen(false);
      setForm({
        title: '',
        description: '',
        priority: TodoPriority.MEDIUM,
        category: 'Robot Project',
        dueDate: '',
      });
    },
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: (id: string) => todoApi.completeTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo'] });
    },
  });

  // Filter tasks
  const filteredTodos = todos.filter((t) => {
    if (filter === 'pending') return t.status === TodoStatus.PENDING;
    if (filter === 'completed') return t.status === TodoStatus.COMPLETED;
    if (filter === 'urgent') return t.priority === TodoPriority.URGENT || t.priority === TodoPriority.HIGH;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-void">
            Todo & Task Manager
          </h1>
          <p className="text-sm text-neutral-slate">
            Tasks with due dates automatically register BullMQ alarm jobs and ring the physical robot speaker.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl btn-primary text-sm font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-border/60 pb-3">
        {[
          { id: 'all', label: `All Tasks (${todos.length})` },
          { id: 'pending', label: `Pending (${todos.filter((t) => t.status === TodoStatus.PENDING).length})` },
          { id: 'completed', label: `Completed (${todos.filter((t) => t.status === TodoStatus.COMPLETED).length})` },
          { id: 'urgent', label: 'High / Urgent' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === tab.id
                ? 'bg-primary text-white font-semibold'
                : 'btn-glass text-neutral-slate hover:text-neutral-void'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List Card */}
      <div className="rounded-3xl glass-card overflow-hidden border border-neutral-border p-6 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-neutral-border/40 animate-pulse" />
            ))}
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-slate">
            No tasks found in this view.
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isCompleted = todo.status === TodoStatus.COMPLETED;
            return (
              <div
                key={todo.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isCompleted
                    ? 'bg-canvas-light/50 border-neutral-border opacity-70'
                    : 'bg-white border-neutral-border shadow-sm hover:border-primary/30'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => completeMutation.mutate(todo.id)}
                    className="mt-0.5 text-neutral-slate hover:text-primary transition-colors"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted ? 'line-through text-neutral-slate' : 'text-neutral-void'
                      }`}
                    >
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-xs text-neutral-slate line-clamp-1">{todo.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-neutral-slate">
                      {todo.dueDate && (
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due: {formatDate(todo.dueDate)}</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">
                            <Volume2 className="w-3 h-3" />
                            Alarm Armed
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                            <Send className="w-3 h-3" />
                            Telegram
                          </span>
                        </div>
                      )}
                      {todo.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{todo.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                      todo.priority === TodoPriority.URGENT
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : todo.priority === TodoPriority.HIGH
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-neutral-border/50 text-neutral-slate'
                    }`}
                  >
                    {todo.priority}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm('Delete this task?')) {
                        deleteMutation.mutate(todo.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-neutral-slate hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Todo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-void/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl glass-floating border border-neutral-border shadow-floating space-y-4">
            <h3 className="text-lg font-display font-bold text-neutral-void">
              Create Task & Armed Alarm
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(form);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl input-glass text-sm"
                  placeholder="e.g. Assemble robot chassis motors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl input-glass text-sm"
                  placeholder="Additional details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-void mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TodoPriority })}
                    className="w-full px-3 py-2 rounded-xl input-glass text-xs"
                  >
                    <option value={TodoPriority.LOW}>Low</option>
                    <option value={TodoPriority.MEDIUM}>Medium</option>
                    <option value={TodoPriority.HIGH}>High</option>
                    <option value={TodoPriority.URGENT}>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-void mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl input-glass text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-void mb-1">
                  Due Date & Chime Alarm Time
                </label>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl input-glass text-xs font-mono"
                />
                <span className="text-[10px] font-mono text-neutral-slate mt-1 block">
                  A delayed job will automatically be queued in Redis BullMQ.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl btn-glass text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl btn-primary text-sm font-semibold"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

