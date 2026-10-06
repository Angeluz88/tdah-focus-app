import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TimerMode = 'work' | 'break';

interface TimerState {
  // Estado de la tarea activa
  activeTaskId: string | null;
  activeTaskTitle: string;
  pointsPerPomodoro: number;
  
  // Estado del temporizador
  mode: TimerMode;
  isRunning: boolean;
  timeLeft: number; // en segundos
  workDuration: number; // en segundos
  breakDuration: number; // en segundos
  
  // Acciones
  setActiveTask: (task: { id: string; title: string; workMin: number; breakMin: number; points: number }) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  extendBreak: (extraMinutes: number) => void;
  setMode: (mode: TimerMode) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      activeTaskId: null,
      activeTaskTitle: 'Enfoque Libre',
      pointsPerPomodoro: 50,
      
      mode: 'work',
      isRunning: false,
      timeLeft: 25 * 60,
      workDuration: 25 * 60,
      breakDuration: 5 * 60,

      setActiveTask: (task) =>
        set({
          activeTaskId: task.id,
          activeTaskTitle: task.title,
          workDuration: task.workMin * 60,
          breakDuration: task.breakMin * 60,
          timeLeft: task.workMin * 60,
          pointsPerPomodoro: task.points,
          isRunning: false,
          mode: 'work',
        }),

      startTimer: () => set({ isRunning: true }),
      pauseTimer: () => set({ isRunning: false }),
      resetTimer: () =>
        set((state) => ({
          isRunning: false,
          timeLeft: state.mode === 'work' ? state.workDuration : state.breakDuration,
        })),

      extendBreak: (extraMinutes) =>
        set((state) => ({
          timeLeft: state.timeLeft + extraMinutes * 60,
        })),

      setMode: (mode) =>
        set((state) => ({
          mode,
          isRunning: false,
          timeLeft: mode === 'work' ? state.workDuration : state.breakDuration,
        })),

      tick: () => {
        const { timeLeft, isRunning } = get();
        if (!isRunning) return;

        if (timeLeft > 1) {
          set({ timeLeft: timeLeft - 1 });
        } else {
          // El tiempo llegó a cero
          set({ timeLeft: 0, isRunning: false });
        }
      },
    }),
    {
      name: 'adhd-timer-storage', // Guarda el estado en localStorage automáticamente
      storage: createJSONStorage(() => localStorage),
    }
  )
);