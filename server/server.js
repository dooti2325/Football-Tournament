require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Warning: Missing SUPABASE_URL or SUPABASE_KEY. Please check your .env file.");
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

app.use(cors());
app.use(express.json({ limit: '10mb' })); // allow photo uploads

app.get('/', (req, res) => {
  res.send('Netaji Sports Club Backend API is running.');
});

// API to get stats
app.get('/api/stats', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    res.json({ totalRegistrations: count || 0 });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// API to register
app.post('/api/register', async (req, res) => {
  const { name, dob, positions, role, phone, photo } = req.body;
  
  if (!name || !dob || !positions || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([{ name, dob, positions, role, phone, photo }])
      .select('id');
      
    if (error) throw error;
    
    const insertedId = data[0].id;
    const serialStr = 'AC-' + String(insertedId).padStart(4, '0');
    
    res.json({ success: true, serial: serialStr });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Database write error' });
  }
});

// API to Export CSV ("Backend Excel")
app.get('/api/export-csv', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    let csv = 'Serial,Name,DOB,Positions,Role,Phone,Registered At\n';
    
    const escapeCsv = (str) => {
      if (!str) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    data.forEach(row => {
      const serial = 'AC-' + String(row.id).padStart(4, '0');
      const positions = Array.isArray(row.positions) ? row.positions.join(', ') : row.positions;
      csv += [
        serial, row.name, row.dob, positions, row.role, row.phone, row.created_at
      ].map(escapeCsv).join(',') + '\n';
    });
    
    res.header('Content-Type', 'text/csv');
    res.attachment('registrations.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
