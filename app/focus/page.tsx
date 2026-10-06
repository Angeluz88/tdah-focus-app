'use client';

import React from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { Play, Pause, RotateCcw, Plus, CheckCircle2, Zap, Coffee } from 'lucide-react';

export default function FocusPage() {
  const {
    activeTaskTitle,
    mode,
    isRunning,
    pointsPerPomodoro,
    startTimer,
    pauseTimer,
    resetTimer,
    extendBreak,
  } = useTimerStore();

  const { formattedTime, progressPercentage } = usePomodoroTimer();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6">
      {/* Top Bar: Puntos y Modo Actual */}
      <header className="w-full max-w-xl flex items-center justify-between bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-sm font-medium text-slate-400">
            {mode === 'work' ? 'Modo Enfoque' : 'Tiempo de Descanso'}
          </span>
        </div>
        <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-sm font-semibold">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>+{pointsPerPomodoro} Pts / bloque</span>
        </div>
      </header>

      {/* Contenedor Principal: Tarea Única */}
      <main className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden my-auto">
        {/* Barra de progreso superior */}
        <div
          className="absolute top-0 left-0 h-1.5 bg-indigo-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Indicador de Micro-Paso */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-slate-700">
          {mode === 'work' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
          {mode === 'work' ? 'Paso Activo' : 'Pausa Recomendada'}
        </div>

        {/* Título de la Tarea Actual */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
          {activeTaskTitle}
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          {mode === 'work'
            ? 'Céntrate solo en este bloque. Todo lo demás puede esperar.'
            : 'Desconecta la vista y estira las piernas.'}
        </p>

        {/* Temporizador Relajado */}
        <div className="my-6">
          <span className="text-7xl md:text-8xl font-mono font-black tracking-tight text-indigo-300">
            {formattedTime}
          </span>
        </div>

        {/* Botonera Principal de Control */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg px-8 py-4 rounded-2xl transition shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>{mode === 'work' ? 'Empezar Bloque' : 'Iniciar Descanso'}</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg px-8 py-4 rounded-2xl transition shadow-lg shadow-amber-600/30 active:scale-95"
            >
              <Pause className="w-6 h-6 fill-current" />
              <span>Pausar</span>
            </button>
          )}

          <button
            onClick={resetTimer}
            title="Reiniciar Bloque"
            className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition border border-slate-700 active:scale-95"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          {mode === 'break' && (
            <button
              onClick={() => extendBreak(5)}
              className="flex items-center gap-1 px-4 py-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-2xl transition border border-slate-700 font-semibold text-sm"
            >
              <Plus className="w-4 h-4" /> 5m Descanso
            </button>
          )}
        </div>
      </main>

      {/* Footer Motivacional */}
      <footer className="w-full max-w-xl text-center py-2">
        <p className="text-xs text-slate-500 italic">
          "No necesitas tener ganas para empezar. La resistencia inicial dura solo 3 minutos."
        </p>
      </footer>
    </div>
  );
}