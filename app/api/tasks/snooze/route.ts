import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/client';

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();
    const supabase = createClient();

    if (taskId) {
      // Reagendar la fecha de vencimiento 10 minutos más tarde
      const newDueDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await supabase
        .from('tasks')
        .update({ due_date: newDueDate, updated_at: newDueDate })
        .eq('id', taskId);
    }

    return NextResponse.json({ success: true, message: 'Tarea pospuesta 10 minutos.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}