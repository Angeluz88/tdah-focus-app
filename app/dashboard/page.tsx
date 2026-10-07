// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, CheckCircle2, Trophy, ShoppingBag, Loader2, Clock } from 'lucide-react';

interface Stats {
  points: number;
  completedTasks: number;
  pendingTasks: number;
}

interface Redemption {
  id: string;
  reward_title: string;
  points_spent: number;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ points: 0, completedTasks: 0, pendingTasks: 0 });
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Obtener puntos del perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();

        // 2. Obtener conteo de tareas completadas y pendientes
        const { data: tasks } = await supabase
          .from('tasks')
          .select('status')
          .eq('user_id', user.id);

        const completed = tasks?.filter((t) => t.status === 'completed').length || 0;
        const pending = tasks?.filter((t) => t.status === 'pending').length || 0;

        setStats({
          points: profile?.points || 0,
          completedTasks: completed,
          pendingTasks: pending,
        });

        // 3. Obtener historial de canjes
        const { data: history } = await supabase
          .from('redemptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (history) setRedemptions(history as Redemption[]);
      } catch (err) {
        console.error('Error al cargar datos de récords:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mr-2" />
        <span>Cargando récords...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Panel de Récords</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Visualiza tu progreso de enfoque, tareas concluidas y recompensas reclamadas.
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Puntos Disponibles</span>
            <p className="text-2xl font-bold text-slate-100">{stats.points}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Tareas Concluidas</span>
            <p className="text-2xl font-bold text-slate-100">{stats.completedTasks}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Tareas Pendientes</span>
            <p className="text-2xl font-bold text-slate-100">{stats.pendingTasks}</p>
          </div>
        </div>
      </div>

      {/* Historial de Canjes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <span>Historial de Recompensas Reclamadas</span>
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