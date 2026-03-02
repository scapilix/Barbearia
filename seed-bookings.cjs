const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezszubyrfnnyzydufyzu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6c3p1YnlyZm5ueXp5ZHVmeXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTQ3ODMsImV4cCI6MjA4Nzk3MDc4M30.0nuzQEsi9CFa7UGxNPofnr4YC14Z7v9Lrm8drCyl7IQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MOCK_CLIENTS = [
  { name: 'Ricardo Marques', email: 'ricardo@mail.com', phone: '912345678' },
  { name: 'João Silva', email: 'joao@mail.com', phone: '923456789' },
  { name: 'Tiago Santos', email: 'tiago@mail.com', phone: '934567890' },
  { name: 'Miguel Oliveira', email: 'miguel@mail.com', phone: '911222333' },
  { name: 'Pedro Costa', email: 'pedro@mail.com', phone: '966777888' },
  { name: 'Gonçalo Almeida', email: 'goncalo@mail.com', phone: '933444555' },
  { name: 'Bruno Mendes', email: 'bruno@mail.com', phone: '919888777' },
  { name: 'Carlos Ferreira', email: 'carlos@mail.com', phone: '921112223' },
  { name: 'Rui Fernandes', email: 'rui@mail.com', phone: '967888999' },
  { name: 'Nuno Alves', email: 'nuno@mail.com', phone: '938999111' },
];

const STATUSES = ['pendente', 'confirmado', 'concluído', 'em_curso', 'cancelado'];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Random date between Feb 1 2026 and March 31 2026
const getRandomDate = () => {
  const start = new Date(2026, 1, 1).getTime(); // Feb 1 2026
  const end = new Date(2026, 2, 31).getTime(); // Mar 31 2026
  return new Date(start + Math.random() * (end - start));
};

async function populateDB() {
  console.log('--- Starting Data Population ---');

  // 1. Assign Colors to Team Members
  console.log('1. Fetching Team Members...');
  const { data: team, error: teamErr } = await supabase.from('team_members').select('*');
  if (teamErr) return console.error('Error fetching team:', teamErr);

  const colors = ['#E1AE2D', '#3B82F6', '#10B981']; // Gold, Blue, Green
  
  console.log('Assigning generic colors to the team...');
  for (let i = 0; i < team.length; i++) {
    await supabase.from('team_members').update({ color: colors[i % colors.length] }).eq('id', team[i].id);
  }
  console.log('Team colors updated!');

  // 2. Setup Clients
  console.log('2. Populating Mock Clients...');
  for (const c of MOCK_CLIENTS) {
    // Check if client exists
    const { data: exists } = await supabase.from('clients').select('id').eq('email', c.email).maybeSingle();
    if (!exists) {
        await supabase.from('clients').insert([c]);
    }
  }
  const { data: clients } = await supabase.from('clients').select('id');
  console.log(`Clients ready: ${clients.length}`);

  // 3. Fetch Services
  console.log('3. Fetching Services...');
  const { data: services, error: servErr } = await supabase.from('services').select('*');
  if (servErr) return console.error('Error fetching services:', servErr);
  if (!services || services.length === 0) return console.log('NO SERVICES FOUND!');

  // 4. Generate Bookings
  console.log('4. Generating Bookings (30 per team member)...');
  
  // Clear old test bookings from Feb/Mar to avoid massive overlap
  await supabase.from('bookings').delete().gte('booking_date', '2026-02-01').lte('booking_date', '2026-03-31');

  const newBookings = [];

  for (const barber of team) {
    for (let i = 0; i < 30; i++) {
      const dateObj = getRandomDate();
      const dateStr = dateObj.toISOString().split('T')[0]; // "2026-02-15"
      const hour = getRandomInt(9, 18);
      const min = Math.random() > 0.5 ? '00' : '30';
      const timeStr = `${hour.toString().padStart(2, '0')}:${min}:00`;

      const service = getRandomElement(services);
      const client = getRandomElement(clients);
      
      // Determine status based on if date is in past vs future (roughly)
      // Since it's March 2026 now, mostly early Feb are completed, late Mar are pending
      let status = getRandomElement(['pendente', 'confirmado', 'concluido', 'em_curso', 'cancelado']);
      if (dateObj.getMonth() === 1) status = 'concluido'; // Feb - highly likely completed
      if (dateObj.getMonth() === 2 && dateObj.getDate() > 10) status = getRandomElement(['pendente', 'confirmado']); // Late March - mostly upcoming

      newBookings.push({
        client_id: client.id,
        service_id: service.id,
        team_member_id: barber.id,
        booking_date: dateStr,
        booking_time: timeStr,
        status: status,
        notes: Math.random() > 0.8 ? 'Corte com estilo fade' : null
      });
    }
  }

  const { error: insertErr } = await supabase.from('bookings').insert(newBookings);
  if (insertErr) {
    console.error('Error inserting bookings:', insertErr);
  } else {
    console.log(`Successfully generated ${newBookings.length} bookings!`);
  }
  console.log('--- Done! ---');
}

populateDB();
