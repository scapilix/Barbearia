import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ezszubyrfnnyzydufyzu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6c3p1YnlyZm5ueXp5ZHVmeXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTQ3ODMsImV4cCI6MjA4Nzk3MDc4M30.0nuzQEsi9CFa7UGxNPofnr4YC14Z7v9Lrm8drCyl7IQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadData() {
    console.log("Deleting remaining Nail team members...");
    await supabase.from('team').delete().eq('name', 'Rita Costa');

    console.log("Team:");
    const { data: team } = await supabase.from('team').select('name, role, photo_url');
    console.log(team);

    console.log("Services:");
    const { data: services } = await supabase.from('services').select('name, category, price');
    console.log(services);
    
    console.log("Products:");
    const { data: products } = await supabase.from('products').select('name, category, photo_url');
    console.log(products);
}

loadData();
