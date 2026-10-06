'use client';

import { useEffect } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { createClient } from '@/supabase/client'; // Ajusta la ruta a tu cliente
import confetti from 'canvas-confetti';

export function usePomodoroTimer() {
  const supabase = createClient();
  const {
    activeTaskId,
    activeTaskTitle,
    mode,
    isRunning,
    timeLeft,
    pointsPerPomodoro,
    workDuration,
    tick,
    setMode,
  } = useTimerStore();

  // 1. Manejo del intervalo en segundo plano
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  // 2. Manejo de finalización de intervalo (Trabajo o Descanso)
  useEffect(() => {
    if (timeLeft === 0) {
      if (mode === 'work') {
        handleWorkSessionComplete();
      } else {
        handleBreakComplete();
      }
    }
  }, [timeLeft]);

  const handleWorkSessionComplete = async () => {
    // A. Disparar celebración visual de dopamina
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // B. Llamada atómica a Supabase para registrar puntos y sesión
    try {
      const { data, error } = await supabase.rpc('complete_pomodoro_session', {
        p_task_id: activeTaskId,
        p_duration_minutes: Math.round(workDuration / 60),
        p_points_earned: pointsPerPomodoro,
      });

      if (error) {
        console.error('Error al guardar sesión en la nube:', error.message);
        // Aquí se puede encolar en Dexie para sync posterior si está offline
      }
    } catch (err) {
      console.error('Fallo de red:', err);
    }

    // C. Transición automática a descanso
    setMode('break');
  };

  const handleBreakComplete = () => {
    // Retornar a modo trabajo
    setMode('work');
  };

  return {
    formattedTime: formatTime(timeLeft),
    progressPercentage:
      mode === 'work'
        ? ((workDuration - timeLeft) / workDuration) * 100
        : 100,
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}