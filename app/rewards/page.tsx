// app/rewards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Gift, Trophy, Plus, ShoppingBag, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  cost: number;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(100);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener puntos del perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      if (profile) setPoints(profile.points || 0);

      // Obtener recompensas disponibles
      const { data: rewardList, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('cost', { ascending: true });

      if (!error && rewardList) setRewards(rewardList as Reward[]);
    } catch (err) {
      console.error('Error al cargar la tienda:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: newReward, error } = await supabase
        .from('rewards')
        .insert([{ title: title.trim(), cost: Number(cost), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      if (newReward) setRewards((prev) => [...prev, newReward as Reward]);
      setTitle('');
      setCost(100);
    } catch (err: any) {
      alert('Error al guardar recompensa: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (points < reward.cost) return;

    setRedeemingId(reward.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase.rpc('redeem_reward', {
        p_reward_id: reward.id,
        p_user_id: user.id,
        p_reward_title: reward.title,
        p_cost: reward.cost,
      });

      if (error) throw error;

      setPoints((prev) => prev - reward.cost);
      alert(`¡Felicidades! Canjeaste "${reward.title}".`);
      router.refresh();
    } catch (err: any) {
      alert('Error al canjear: ' + err.message);
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Encabezado con Saldo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            <span>Tienda de Recompensas</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Canjea los puntos acumulados en tus sesiones de enfoque.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-bold text-lg">
          <Trophy className="w-5 h-5" />
          <span>{points} Puntos</span>
        </div>
      </div>

      {/* Formulario de Nueva Recompensa */}
      <form onSubmit={handleCreateReward} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Crear Nueva Recompensa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: 30 min de videojuego, Ver un capítulo de serie"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <input
              type="number"
              min={10}
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition"
              placeholder="Costo en pts"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Agregar a la Tienda</span>
        </button>
      </form>

      {/* Lista de Recompensas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Recompensas Disponibles</h2>

        {fetching ? (
          <div className="flex justify-center py-12 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando tienda...
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-slate-400 text-sm">
            No has agregado recompensas aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map((reward) => {
              const canAfford = points >= reward.cost;
              return (
                <div
                  key={reward.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-medium text-slate-100 text-sm">{reward.title}</h3>
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 mt-1">
                      <Trophy className="w-3.5 h-3.5" /> {reward.cost} pts
                    </span>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || redeemingId === reward.id}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {redeemingId === reward.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                    <span>{canAfford ? 'Canjear' : 'Faltan pts'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}