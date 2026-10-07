// app/dashboard/tasks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, CheckSquare, Clock, Trophy, Trash2, Play, Calendar, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  estimated_minutes: number;
  points: number;
  due_date?: string | null;
  status: 'pending' | 'completed';
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [points, setPoints] = useState(50);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setTasks(data as Task[]);
      } catch (err) {
        console.error('Error al obtener tareas:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchTasks();
  }, [supabase]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuario no autenticado');

      const payload = {
        title: title.trim(),
        estimated_minutes: Number(estimatedMinutes),
        points: Number(points),
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        user_id: user.id,
        status: 'pending',
      };

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (newTask) {
        setTasks((prev) => [newTask as Task, ...prev]);
      }

      setTitle('');
      setEstimatedMinutes(25);
      setPoints(50);
      setDueDate('');

      router.refresh();
    } catch (err: any) {
      console.error('Error al guardar la tarea:', err.message || err);
      alert('Error al guardar la tarea: ' + (err.message || 'Verifica la conexión'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== id));
      router.refresh();
    } catch (err: any) {
      console.error('Error al eliminar tarea:', err.message || err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-indigo-400" />
          <span>Gestión de Tareas</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Divide tus pendientes en micro-objetivos claros y asigna tiempos alcanzables.
        </p>
      </div>

      <form
        onSubmit={handleCreateTask}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl"
      >
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Nombre de la Tarea
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Escribir reporte o responder correos"
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Minutos Estimados</span>
            </label>
            <input
              type="number"
              min={5}
              max={180}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Puntos Recompensa</span>
            </label>
            <input
              type="number"
              min={10}
              max={500}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>Fecha Límite (Opcional)</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition [color-scheme:dark]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Agregar Tarea</span>
            </>
          )}
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Tus Pendientes</h2>

        {fetching ? (
          <div className="flex justify-center items-center py-12 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando tareas...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">No tienes tareas pendientes.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-700"
              >
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-100 text-sm sm:text-base">
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {task.estimated_minutes} min
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Trophy className="w-3.5 h-3.5" />
                      +{task.points} pts
                    </span>
                    {task.due_date && (
                      <span className="flex items-center gap-1 text-rose-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(task.due_date).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => router.push(`/focus?taskId=${task.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-medium transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Enfocar</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}