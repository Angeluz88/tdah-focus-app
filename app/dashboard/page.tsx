// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart3,
  CheckCircle2,
  Trophy,
  ShoppingBag,
  Loader2,
  CalendarDays,
  CalendarRange,
  Zap,
} from 'lucide-react';

interface TimeframeStats {
  completedTasks: number;
  pointsEarned: number;
}

interface ProductiveRecords {
  today: TimeframeStats;
  week: TimeframeStats;
  month: TimeframeStats;
  totalPointsAvailable: number;
}

interface Redemption {
  id: string;
  reward_title: string;
  points_spent: number;
  created_at: string;
}

export default function DashboardPage() {
  const [records, setRecords] = useState<ProductiveRecords>({
    today: { completedTasks: 0, pointsEarned: 0 },
    week: { completedTasks: 0, pointsEarned: 0 },
    month: { completedTasks: 0, pointsEarned: 0 },
    totalPointsAvailable: 0,
  });

  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchRecordsData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Obtener puntos actuales del perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();

        // 2. Obtener todas las tareas del usuario
        const { data: tasks } = await supabase
          .from('tasks')
          .select('status, points, created_at')
          .eq('user_id', user.id);

        // Definir límites de tiempo
        const now = new Date();
        
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(now.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Inicializar contadores
        let todayTasks = 0, todayPoints = 0;
        let weekTasks = 0, weekPoints = 0;
        let monthTasks = 0, monthPoints = 0;

        if (tasks) {
          tasks.forEach((task) => {
            if (task.status === 'completed' && task.created_at) {
              const taskDate = new Date(task.created_at);
              const taskPts = Number(task.points) || 0;

              if (taskDate >= startOfToday) {
                todayTasks++;
                todayPoints += taskPts;
              }
              if (taskDate >= startOfWeek) {
                weekTasks++;
                weekPoints += taskPts;
              }
              if (taskDate >= startOfMonth) {
                monthTasks++;
                monthPoints += taskPts;
              }
            }
          });
        }

        setRecords({
          today: { completedTasks: todayTasks, pointsEarned: todayPoints },
          week: { completedTasks: weekTasks, pointsEarned: weekPoints },
          month: { completedTasks: monthTasks, pointsEarned: monthPoints },
          totalPointsAvailable: profile?.points || 0,
        });

        // 3. Cargar historial de canjes
        const { data: history } = await supabase
          .from('redemptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (history) setRedemptions(history as Redemption[]);
      } catch (err) {
        console.error('Error al cargar datos del panel de récords:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordsData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mr-2" />
        <span>Calculando récords de productividad...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Récords de Productividad</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Resumen diario, semanal y mensual de tu enfoque y tareas.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-bold text-base">
          <Trophy className="w-5 h-5" />
          <span>{records.totalPointsAvailable} Pts Disponibles</span>
        </div>
      </div>

      {/* Récords Diarios, Semanales y Mensuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hoy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Hoy
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Completadas</span>
              <p className="text-xl font-bold text-slate-100 mt-0.5">
                {records.today.completedTasks}
              </p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Puntos</span>
              <p className="text-xl font-bold text-amber-400 mt-0.5">
                +{records.today.pointsEarned}
              </p>
            </div>
          </div>
        </div>

        {/* Esta Semana */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" /> Esta Semana
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Completadas</span>
              <p className="text-xl font-bold text-slate-100 mt-0.5">
                {records.week.completedTasks}
              </p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Puntos</span>
              <p className="text-xl font-bold text-amber-400 mt-0.5">
                +{records.week.pointsEarned}
              </p>
            </div>
          </div>
        </div>

        {/* Este Mes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4" /> Este Mes
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Completadas</span>
              <p className="text-xl font-bold text-slate-100 mt-0.5">
                {records.month.completedTasks}
              </p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Puntos</span>
              <p className="text-xl font-bold text-amber-400 mt-0.5">
                +{records.month.pointsEarned}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Recompensas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <span>Últimos Canjes Reclamados</span>
        </h2>

        {redemptions.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-slate-400 text-sm">
            Aún no has canjeado recompensas.
          </div>
        ) : (
          <div className="grid gap-3">
            {redemptions.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-slate-100 text-sm">{item.reward_title}</h3>
                  <span className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg">
                  -{item.points_spent} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}