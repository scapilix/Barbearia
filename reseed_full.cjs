const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ezszubyrfnnyzydufyzu.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6c3p1YnlyZm5ueXp5ZHVmeXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTQ3ODMsImV4cCI6MjA4Nzk3MDc4M30.0nuzQEsi9CFa7UGxNPofnr4YC14Z7v9Lrm8drCyl7IQ'
);

async function purgeAll() {
  console.log('Purging existing data...');
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

  // Configuration
  const months = [
    { start: new Date('2026-02-01'), end: new Date('2026-02-28') },
    { start: new Date('2026-03-01'), end: new Date('2026-03-31') }
  ];

  let bookings = [];
  let orders = [];
  let commissions = [];

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:45', '13:00', '14:30', '15:15', '16:00', '17:30', '18:15', '19:00'];
  const possibleStatuses = ['pendente', 'confirmado', 'concluido', 'cancelado'];
  
  // Weights: Many completed, some confirmed, a few pending/cancelled
  const getStatus = () => {
    const r = Math.random();
    if (r < 0.6) return 'concluido';
    if (r < 0.8) return 'confirmado';
    if (r < 0.95) return 'pendente';
    return 'cancelado';
  };

  console.log('Generating structured mock data...');
  for (const member of team) {
    // Approx 10 per month = 20 total per member
    for (const month of months) {
      for (let i = 0; i < 10; i++) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        
        const bDate = randomDate(month.start, month.end).toISOString().split('T')[0];
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
          notes: Math.random() > 0.7 ? 'Cliente VIP' : null
        };
        
        // Let DB auto-generate the ID, but since we are inserting arrays we need to insert to generate IDs 
        // Or we can just insert everything sequentially which is slower but safe
        const { data: insertedBooking, error: bErr } = await supabase.from('bookings').insert([booking]).select().single();
        if (bErr) console.error("Error inserting booking:", bErr);

        if (insertedBooking) {
          // If booking is not cancelled, create a Comanda
          if (status !== 'cancelado' && status !== 'pendente') {
            const isClosed = status === 'concluido';
            const { data: insertedOrder, error: oErr } = await supabase.from('orders').insert([{
              client_name: client.name,
              team_member_id: member.id,
              total_amount: service.price,
              status: isClosed ? 'fechada' : 'aberta',
              payment_method: Math.random() > 0.5 ? 'dinheiro' : 'cartao',
              notes: `Ref: Agendamento ${bDate}`
            }]).select().single();

            if (oErr) console.error("Error inserting order:", oErr);

            // If the Order is closed, generate the Commission
            if (insertedOrder && isClosed) {
              const rate = member.commission_rate || 40;
              const calc = (Number(service.price) * rate) / 100;
              
              await supabase.from('commissions').insert([{
                team_member_id: member.id,
                member_name: member.name,
                amount: calc,
                rate,
                date: bDate,
                status: Math.random() > 0.5 ? 'pago' : 'pendente'
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
