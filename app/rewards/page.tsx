'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/supabase/client';
import confetti from 'canvas-confetti';
import { Gift, Zap, Check } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Obtener perfil (puntos)
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', user.id)
      .single();

    if (profile) setUserPoints(profile.total_points);

    // Obtener catálogo de premios
    const { data: rewardsData } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true);

    if (rewardsData) setRewards(rewardsData);
    setLoading(false);
  }

  async function handleRedeem(rewardId: string, cost: number) {
    if (userPoints < cost) {
      alert('Aún no tienes suficientes puntos. ¡Completa un par de bloques más!');
      return;
    }

    const { data, error } = await supabase.rpc('redeem_reward', {
      p_reward_id: rewardId,
    });

    if (error) {
      alert(error.message);
    } else {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setUserPoints(data.remaining_points);
      alert(`🎉 ¡Premio canjeado: ${data.reward_title}! Disfruta tu recompensa.`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Cargando tienda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-4xl mx-auto">
      {/* Header con Saldo de Puntos */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Gift className="w-8 h-8 text-indigo-400" />
            Tienda de Recompensas
          </h1>
          <p className="text-slate-400 text-sm">Premia a tu cerebro por el trabajo realizado.</p>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-xl">
          <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
          <div>
            <p className="text-xs text-amber-300 font-semibold uppercase">Saldo Disponible</p>
            <p className="text-2xl font-black text-amber-400">{userPoints} Pts</p>
          </div>
        </div>
      </header>

      {/* Grid de Premios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rewards.length === 0 ? (
          <p className="text-slate-400 col-span-2 text-center py-12">
            Aún no has agregado recompensas. Configura incentivos como "30 min de videojuegos" o "Tomar un café".
          </p>
        ) : (
          rewards.map((reward) => {
            const canAfford = userPoints >= reward.cost;
            return (
              <div
                key={reward.id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{reward.title}</h3>
                    <span className="bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-full text-sm border border-amber-500/20">
                      {reward.cost} Pts
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">{reward.description}</p>
                </div>

                <button
                  onClick={() => handleRedeem(reward.id, reward.cost)}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                    canAfford
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  {canAfford ? 'Canjear Premia' : 'Puntos Insuficientes'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}