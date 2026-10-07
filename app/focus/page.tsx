// app/focus/page.tsx
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Play, Pause, RotateCcw, Trophy, CheckCircle2, Clock, ArrowLeft, Loader2, PlusCircle, Trash2, Repeat } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  estimated_minutes: number;
  points: number;
  status: string;
  is_periodic?: boolean;
}

function FocusTimerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const taskId = searchParams.get('taskId');

  const [task, setTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(!!taskId);
  const [completing, setCompleting] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Cargar tarea desde Supabase
  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .single();

        if (error) throw error;

        if (data) {
          setTask(data as Task);
          setTimeLeft(data.estimated_minutes * 60);
        }
      } catch (err) {
        console.error('Error al cargar la tarea:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, supabase]);

  // 2. Control del temporizador
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleFinishTask();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // 3. Extender tiempo
  const handleExtend = (minutes: number) => {
    setTimeLeft((prev) => prev + minutes * 60);
    if (!isRunning) setIsRunning(true);
  };

  // 4. Concluir tarea y sumar puntos
  const handleFinishTask = async () => {
    if (!task) {
      setIsCompleted(true);
      return;
    }

    setCompleting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase.rpc('complete_task_and_award_points', {
        p_task_id: task.id,
        p_user_id: user.id,
        p_points: Number(task.points),
      });

      if (error) throw error;

      setIsRunning(false);
      setIsCompleted(true);
      router.refresh();
    } catch (err: any) {
      console.error('Error al completar la tarea:', err.message || err);
      alert('Error al acreditar puntos: ' + (err.message || 'Verifica RLS'));
    } finally {
      setCompleting(false);
    }
  };

  // 5. Eliminar tarea definitivamente tras concluir
  const handleDeleteCurrentTask = async () => {
    if (!task) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);
      if (error) throw error;
      router.push('/dashboard/tasks');
    } catch (err: any) {
      console.error('Error al eliminar tarea:', err.message);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft((task ? task.estimated_minutes : 25) * 60);
    setIsCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
        <p className="text-sm">Cargando sesión de enfoque...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 text-center">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard/tasks')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Tareas</span>
        </button>
      </div>

      {/* Tarjeta de Tarea */}
      {task ? (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-2 shadow-xl relative">
          {task.is_periodic && (
            <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              <Repeat className="w-3 h-3" /> Periódica
            </span>
          )}
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 block">
            Enfoque Activo
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{task.title}</h1>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {task.estimated_minutes} min
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Trophy className="w-3.5 h-3.5" />
              +{task.points} pts
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-slate-100">Modo Enfoque Libre</h1>
          <p className="text-xs text-slate-400 mt-1">25 minutos de concentración libre.</p>
        </div>
      )}

      {/* Temporizador */}
      <div className="py-6">
        <div className="text-6xl sm:text-8xl font-mono font-bold text-slate-100 tracking-tight">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Botones para Extender Tiempo */}
      {!isCompleted && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleExtend(5)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 rounded-xl text-xs font-medium transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            +5 min
          </button>
          <button
            onClick={() => handleExtend(10)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 rounded-xl text-xs font-medium transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            +10 min
          </button>
        </div>
      )}

      {/* Pantalla de Finalización */}
      {isCompleted ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-4 animate-in fade-in">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-emerald-300">¡Tarea Concluida!</h2>
          <p className="text-xs text-slate-300">
            {task
              ? task.is_periodic
                ? `Puntos (+${task.points} pts) acreditados. Tu tarea periódica sigue disponible para el próximo ciclo.`
                : `Puntos (+${task.points} pts) acreditados.`
              : 'Has completado una sesión de enfoque libre.'}
          </p>
          
          <div className="flex justify-center items-center gap-3 pt-2">
            <button
              onClick={() => router.push('/dashboard/tasks')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition"
            >
              Ir a Tareas
            </button>

            {task && !task.is_periodic && (
              <button
                onClick={handleDeleteCurrentTask}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-medium transition border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Tarea
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Controles Principales + Botón de Concluir Directo */
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleTimer}
              disabled={completing}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition shadow-lg ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>{timeLeft === (task ? task.estimated_minutes * 60 : 25 * 60) ? 'Iniciar' : 'Reanudar'}</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              disabled={completing}
              className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition"
              title="Reiniciar temporizador"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Botón para marcar concluida manualmente si terminó antes de tiempo */}
          {task && (
            <div>
              <button
                onClick={handleFinishTask}
                disabled={completing}
                className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/20 transition disabled:opacity-50"
              >
                {completing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Marcar como Concluida y Cobrar Puntos</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FocusPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <FocusTimerContent />
    </Suspense>
  );
}