// store/useTaskStore.ts
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  due_date?: string | null;
  estimated_minutes?: number;
  points_reward?: number;
  status: 'pending' | 'completed';
  created_at?: string;
}

export interface Reward {
  id: string;
  user_id?: string;
  title: string;
  cost: number;
  created_at?: string;
}

interface TaskState {
  tasks: Task[];
  rewards: Reward[];
  points: number;
  totalPomodoros: number;
  isLoading: boolean;

  // Acciones
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  fetchRewards: () => Promise<void>;
  addReward: (reward: Omit<Reward, 'id'>) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<boolean>;
  fetchUserProfile: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  rewards: [],
  points: 0,
  totalPomodoros: 0,
  isLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      set({ tasks: data });
    }
    set({ isLoading: false });
  },

  addTask: async (newTask) => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...newTask, user_id: userData.user.id }])
      .select()
      .single();

    if (!error && data) {
      set((state) => ({ tasks: [data, ...state.tasks] }));
    }
  },

  deleteTask: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (!error) {
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    }
  },

  fetchRewards: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .order('cost', { ascending: true });

    if (!error && data) {
      set({ rewards: data });
    }
    set({ isLoading: false });
  },

  addReward: async (newReward) => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from('rewards')
      .insert([{ ...newReward, user_id: userData.user.id }])
      .select()
      .single();

    if (!error && data) {
      set((state) => ({ rewards: [...state.rewards, data] }));
    }
  },

  redeemReward: async (rewardId) => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('redeem_reward', {
      reward_id_input: rewardId,
    });

    if (!error && data) {
      // Recargar el perfil para actualizar saldo de puntos
      await get().fetchUserProfile();
      return true;
    }
    return false;
  },

  fetchUserProfile: async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('points, total_pomodoros')
      .eq('id', userData.user.id)
      .single();

    if (!error && data) {
      set({ points: data.points, totalPomodoros: data.total_pomodoros });
    }
  },
}));