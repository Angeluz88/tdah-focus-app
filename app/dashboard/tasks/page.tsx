// app/dashboard/tasks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import {
  Calendar,
  Clock,
  Coins,
  Plus,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Play,
} from 'lucide-react';
import Link from 'next/link';

export default function TasksManagementPage() {
  const { tasks, fetchTasks, addTask, deleteTask, isLoading } = useTaskStore();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [pointsReward, setPointsReward] = useState(50);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addTask({
      title: title.trim(),
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      estimated_minutes: Number(estimatedMinutes),
      points_reward: Number(pointsReward),
      status: 'pending',
    });

    setTitle('');
    setDueDate('');
    setEstimatedMinutes(25);
    setPointsReward(50);
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Cabecera */}
      <header className="flex items-center justify-between bg-slate-900/80 backdrop-blur p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white">Panel de Tareas</h1>
          <p className="text-xs text-slate-400">Organiza tus actividades con tiempos y recompensas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs md:text-sm rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cerrar' : 'Nueva Tarea'}</span>
        </button>
      </header>

      {/* Formulario de Creación */}
      {showForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-slate-900 border border-indigo-500/30 p-5 rounded-2xl space-y-4 shadow-xl"
        >
          <h2 className="text-sm font-semibold text-indigo-300">Planificar Tarea</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Título de la Tarea</label>
              <input
                type="text"
                required
                placeholder="Ej. Revisar informe de ventas..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Fecha y Hora Límite</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Duración (min)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Premio (Puntos)</label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={pointsReward}
                  onChange={(e) => setPointsReward(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition"
          >
            Guardar Tarea
          </button>
        </form>
      )}

      {/* Lista de Tareas Pendientes */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Tareas Programadas
        </h2>

        {isLoading && tasks.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">Cargando tareas...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No hay tareas creadas aún</p>
            <p className="text-xs text-slate-500 mt-1">
              Agrega tu primera tarea asignándole fecha, estimación de minutos y puntos.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 transition hover:border-slate-700"
              >
                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-semibold text-slate-200 text-sm truncate">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{new Date(task.due_date).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>{task.estimated_minutes || 25} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-medium">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+{task.points_reward || 50} pts</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/focus?taskId=${task.id}`}
                    className="p-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl transition flex items-center gap-1 text-xs font-medium"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Enfocar</span>
                  </Link>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2.5 bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition"
                    title="Eliminar Tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}