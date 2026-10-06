'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/supabase/client';
import { Flame, Trophy, Calendar, Award } from 'lucide-react';

interface MetricsSummary {
  today_pomodoros: number;
  today_points: number;
  week_pomodoros: number;
  week_points: number;
  month_pomodoros: number;
  month_points: number;
  best_day_pomodoros: number;
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadMetrics() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_user_performance_summary', {
        p_user_id: user.id,
      });

      if (!error && data && data.length > 0) {
        setMetrics(data[0]);
      }
      setLoading(false);
    }

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Panel de Récords</h1>
          <p className="text-slate-400 text-sm">Visualiza tu inercia y progreso acumulado.</p>
        </div>

        {/* Selector de Período */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              period === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Diario
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              period === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              period === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mensual
          </button>
        </div>
      </header>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400 font-bold">Bloques Completados</p>
            <p className="text-3xl font-black text-white">
              {period === 'daily' && (metrics?.today_pomodoros || 0)}
              {period === 'weekly' && (metrics?.week_pomodoros || 0)}
              {period === 'monthly' && (metrics?.month_pomodoros || 0)}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400 font-bold">Puntos de Dopamina</p>
            <p className="text-3xl font-black text-amber-400">
              {period === 'daily' && (metrics?.today_points || 0)}
              {period === 'weekly' && (metrics?.week_points || 0)}
              {period === 'monthly' && (metrics?.month_points || 0)}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400 font-bold">Mejor Día Histórico</p>
            <p className="text-3xl font-black text-emerald-400">
              {metrics?.best_day_pomodoros || 0} <span className="text-sm font-normal text-slate-400">bloques</span>
            </p>
          </div>
        </div>
      </div>

      {/* Banner de Validación Neurodivergente */}
      <div className="bg-indigo-950/40 border border-indigo-800/50 p-6 rounded-2xl flex items-center gap-4">
        <Award className="w-10 h-10 text-indigo-400 flex-shrink-0" />
        <p className="text-sm text-indigo-200">
          <strong>Recuerda:</strong> Tu progreso no se mide por tener jornadas perfectas, sino por volver a intentar cada vez que te distraes.
        </p>
      </div>
    </div>
  );
}