'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Gift, Coins, Plus, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function RewardsPage() {
  const {
    points,
    rewards,
    fetchUserProfile,
    fetchRewards,
    redeemReward,
    addReward,
    isLoading,
  } = useTaskStore();

  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(100);
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    // Sincronizar saldo de puntos y catálogo de recompensas desde Supabase / Dexie.js
    fetchUserProfile();
    fetchRewards();
  }, [fetchUserProfile, fetchRewards]);

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || cost <= 0) return;

    await addReward({
      title: title.trim(),
      cost: Number(cost),
    });

    setTitle('');
    setCost(100);
    setShowAddForm(false);
    showFeedback('¡Recompensa creada con éxito!', 'success');
  };

  const handleRedeem = async (rewardId: string, rewardCost: number, rewardTitle: string) => {
    if ((points ?? 0) < rewardCost) {
      showFeedback('No tienes suficientes puntos para esta recompensa.', 'error');
      return;
    }

    const success = await redeemReward(rewardId);
    if (success) {
      showFeedback(`¡Disfruta tu premio: "${rewardTitle}"! 🥳`, 'success');
    } else {
      showFeedback('Error al procesar el canje. Inténtalo de nuevo.', 'error');
    }
  };

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Encabezado con Saldo de Puntos */}
      <header className="flex items-center justify-between bg-slate-900/80 backdrop-blur p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Tienda de Recompensas</h1>
            <p className="text-xs text-slate-400">Canjea tu esfuerzo sin culpa ni fricción</p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-amber-300 font-bold text-lg">{points ?? 0}</span>
          <span className="text-amber-500/80 text-xs font-medium">pts</span>
        </div>
      </header>

      {/* Retroalimentación Flotante */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Botón / Formulario para Agregar Recompensas */}
      <section className="space-y-4">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 border-dashed rounded-xl text-slate-300 hover:text-white font-medium text-sm flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Crear Recompensa Personalizada</span>
          </button>
        ) : (
          <form
            onSubmit={handleCreateReward}
            className="bg-slate-900 border border-indigo-500/30 p-5 rounded-2xl space-y-4 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Nueva Recompensa
              </h2>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Cancelar
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Premio / Incentivo</label>
                <input
                  type="text"
                  placeholder="Ej: Ver 1 episodio de serie, 15 min de redes..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Costo en Puntos</label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition"
            >
              Guardar Recompensa
            </button>
          </form>
        )}
      </section>

      {/* Catálogo de Recompensas */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Premios Disponibles
        </h2>

        {isLoading && rewards.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Cargando catálogo de recompensas...
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <Gift className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">Aún no hay premios configurados</p>
            <p className="text-xs text-slate-500 mt-1">
              Agrega recompensas sencillas para motivar la finalización de tus micro-bloques.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map((reward) => {
              const canAfford = (points ?? 0) >= reward.cost;

              return (
                <div
                  key={reward.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 transition ${
                    canAfford
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-900/40 border-slate-800/50 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-200 text-sm">{reward.title}</h3>
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{reward.cost} pts</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward.id, reward.cost, reward.title)}
                    disabled={!canAfford}
                    className={`w-full py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>{canAfford ? 'Canjear Premio' : 'Puntos Insuficientes'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}