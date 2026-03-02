const { createClient } = require('@supabase/supabase-js');

// Create standard client for queries
const supabase = createClient('https://ezszubyrfnnyzydufyzu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6c3p1YnlyZm5ueXp5ZHVmeXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTQ3ODMsImV4cCI6MjA4Nzk3MDc4M30.0nuzQEsi9CFa7UGxNPofnr4YC14Z7v9Lrm8drCyl7IQ');

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6c3p1YnlyZm5ueXp5ZHVmeXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM5NDc4MywiZXhwIjoyMDg3OTcwNzgzfQ.8n3RzNn0m5R76Xo9W8d6qYx05rV3kQv-320S-u6X9Qo'; 

const adminSupabase = createClient('https://ezszubyrfnnyzydufyzu.supabase.co', SUPABASE_SERVICE_ROLE_KEY);

async function injectFix() {
  console.log("Starting DB Schema Fix Injection...");
  
  // NOTE: PostgREST (the API backend of Supabase) caches the schema. 
  // If we changed it in the dashboard, sometimes the API doesn't know about it immediately.
  // One trick to force a cache reload is making a dummy request or relying on the 'reload schema' notify.

  // 1. We will use raw PostgreSQL via node-postgres (pg) to execute the ALTER TABLE commands directly since Supabase JS client doesn't support DDL natively unless through an RPC we didn't create.
  
  const { Client } = require('pg');
  const client = new Client({
    connectionString: "postgresql://postgres.ezszubyrfnnyzydufyzu:Verisure1234@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully.");

    // Fix Bookings Foreign Keys
    console.log("Applying Bookings FKs...");
    await client.query(`
      ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS fk_client;
      ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS fk_service;
      ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS fk_team;
      
      ALTER TABLE public.bookings
        ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
        ADD CONSTRAINT fk_service FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL,
        ADD CONSTRAINT fk_team FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE SET NULL;
    `);

    // Fix Orders Foreign Keys
    console.log("Applying Orders FKs...");
    await client.query(`
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS team_member_id UUID;
      ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS fk_orders_team;
      ALTER TABLE public.orders ADD CONSTRAINT fk_orders_team FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE SET NULL;
    `);

    // Force Schema Reload
    console.log("Forcing PostgREST Schema Reload...");
    await client.query(`NOTIFY pgrst, 'reload schema';`);

    console.log("Applying changes successfully! Verifying API...");
  } catch (err) {
    console.error("Failed executing SQL:", err);
  } finally {
    await client.end();
  }
}

injectFix();
