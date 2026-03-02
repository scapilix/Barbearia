const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ezszubyrfnnyzydufyzu.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6c3p1YnlyZm5ueXp5ZHVmeXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTQ3ODMsImV4cCI6MjA4Nzk3MDc4M30.0nuzQEsi9CFa7UGxNPofnr4YC14Z7v9Lrm8drCyl7IQ'
);

async function purgeAll() {
  console.log('Purging existing data...');
  // Apagar tudo de forma bruta para limpar os testes!
  await supabase.from('commissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

// Generate random date between ranges
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function reseed() {
  await purgeAll();

  console.log('Fetching team, clients, and services...');
  const { data: team } = await supabase.from('team_members').select('*');
  const { data: clients } = await supabase.from('clients').select('*');
  const { data: services } = await supabase.from('services').select('*');

  if (!team?.length || !clients?.length || !services?.length) {
    console.error('Missing core data to seed bookings!');
    return;
  }

  // Configuration - Force bookings to the "current week" of March 2 - March 7
  const periods = [
    { start: new Date('2026-03-02'), end: new Date('2026-03-07'), count: 12 }, // Concentrating heavily on THIS week
    { start: new Date('2026-02-15'), end: new Date('2026-02-28'), count: 5 }
  ];

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:45', '13:00', '14:30', '15:15', '16:00', '17:30', '18:15', '19:00'];
  
  // Weights: Many completed, some confirmed, a few pending/cancelled
  const getStatus = () => {
    const r = Math.random();
    if (r < 0.6) return 'concluido';
    if (r < 0.8) return 'confirmado';
    if (r < 0.95) return 'pendente';
    return 'cancelado';
  };

  console.log('Generating structured mock data (concentrated on this week)...');
  for (const member of team) {
    for (const period of periods) {
      for (let i = 0; i < period.count; i++) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        
        const bDate = randomDate(period.start, period.end).toISOString().split('T')[0];
        const bTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const status = getStatus();

        // 1. Create Booking
        const booking = {
          client_id: client.id,
          service_id: service.id,
          team_member_id: member.id,
          booking_date: bDate,
          booking_time: `${bTime}:00`,
          status,
          notes: Math.random() > 0.7 ? 'Cliente VIP' : ''
        };
        
        const { data: insertedBooking, error: bErr } = await supabase.from('bookings').insert([booking]).select().single();
        if (bErr) console.error("Error inserting booking:", bErr);

        if (insertedBooking) {
          // Se a marcação foi efectuada, e não está cancelada, gera comanda aberta ou fechada.
          // Igualzinho a salvar do painel.
          if (status !== 'cancelado') {
            const isClosed = status === 'concluido';
            const { data: insertedOrder, error: oErr } = await supabase.from('orders').insert([{
              client_name: client.name,
              team_member_id: member.id,
              total_amount: service.price,
              status: isClosed ? 'fechada' : 'aberta',
              payment_method: Math.random() > 0.5 ? 'dinheiro' : 'cartao',
              notes: `Agendamento Automático: ${bDate} ${bTime}`
            }]).select().single();

            if (oErr) console.error("Error inserting order:", oErr);

            // Se for concluida/fechada, gera os valores das comissões
            if (insertedOrder && isClosed) {
              const rate = member.commission_rate || 40;
              const calc = (Number(service.price) * rate) / 100;
              
              await supabase.from('commissions').insert([{
                team_member_id: member.id,
                member_name: member.name, // The script in components reads `team_member_id`, but we also add `member_name` just in case
                amount: calc,
                rate,
                date: bDate,
                status: 'pendente'
              }]);
            }
          }
        }
      }
    }
  }

  console.log('Finished perfectly seeding: Agendas -> Comandas -> Comissoes !');
}

reseed().catch(console.error);
