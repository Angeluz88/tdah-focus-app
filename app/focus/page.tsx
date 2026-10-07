// app/focus/page.tsx
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Play, Pause, RotateCcw, Trophy, CheckCircle2, Clock, ArrowLeft, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  estimated_minutes: number;
  points: number;
  status: string;
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

  // 1. Obtener los datos de la tarea desde Supabase si existe taskId en la URL
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
          // Ajustar el temporizador según los minutos estimados de la tarea
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

  // 2. Control del temporizador regresivo
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

  // 3. Otorgar puntos y completar la tarea al finalizar el tiempo
  const handleFinishTask = async () => {
    if (!task) {
      setIsCompleted(true);
      return;
    }

    setCompleting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Invocar la función almacenada en Supabase
      const { error } = await supabase.rpc('complete_task_and_award_points', {
        p_task_id: task.id,
        p_user_id: user.id,
        p_points: task.points,
      });

      if (error) throw error;

      setIsCompleted(true);
      router.refresh();
    } catch (err: any) {
      console.error('Error al completar la tarea:', err.message || err);
    } finally {
      setCompleting(false);
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
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8 text-center">
      
      {/* Botón Volver */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard/tasks')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Tareas</span>
        </button>
      </div>

      {/* Información de la Tarea Activa */}
      {task ? (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-2 shadow-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
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
              +{task.points} pts al finalizar
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-slate-100">Modo Enfoque Libre</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sesión estándar de 25 minutos sin tarea específica.
          </p>
        </div>
      )}

      {/* Temporizador Visual */}
      <div className="relative py-8">
        <div className="text-6xl sm:text-8xl font-mono font-bold text-slate-100 tracking-tight">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Pantalla de Éxito al Finalizar */}
      {isCompleted ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-4 animate-in fade-in">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-emerald-300">¡Sesión Completada!</h2>
          <p className="text-xs text-slate-300">
            {task
              ? `Has completado "${task.title}" y ganado +${task.points} puntos.`
              : 'Has completado una sesión de enfoque libre.'}
          </p>
          <button
            onClick={() => router.push('/dashboard/tasks')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition"
          >
            Ir a Tareas
          </button>
        </div>
      ) : (
        /* Botones de Control */
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