import { createClient } from 'npm:@supabase/supabase-js@2';

const MOTIVATIONAL_PHRASES = [
  "Solo dale 2 minutos. Si luego quieres parar, lo dejamos.",
  "Hecho es infinitamente mejor que perfecto.",
  "No necesitas tener ganas para empezar; las ganas vienen después.",
  "Solo ocúpate del micro-paso actual. Lo demás no existe ahora.",
  "Un tropiezo en tu plan no arruina tu día. Reagendamos sin culpa."
];

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const now = new Date();
  const windowStart = new Date(now.getTime() - 1 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

  const { data: upcomingTasks } = await supabase
    .from('tasks')
    .select('id, title, user_id, due_date')
    .eq('status', 'pending')
    .gte('due_date', windowStart)
    .lte('due_date', windowEnd);

  if (upcomingTasks) {
    for (const task of upcomingTasks) {
      const phrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
      console.log(`Notificación enviada para tarea ${task.title}: "${phrase}"`);
    }
  }

  return new Response(
    JSON.stringify({ processed: upcomingTasks?.length || 0 }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});