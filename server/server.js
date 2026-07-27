require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase (with fallbacks to prevent Vercel crash if env vars are missing)
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // allow larger payload if needed

// Helper to generate the next Serial ID
async function getNextSerial() {
  try {
    // Query the latest serial
    const { data, error } = await supabase
      .from('registrations')
      .select('serial')
      .order('serial', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest serial:', error);
      return 'AC-' + String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    }

    if (data && data.length > 0 && data[0].serial) {
      const match = data[0].serial.match(/^AC-(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return 'AC-' + String(nextNum).padStart(4, '0');
      }
    }
    // Default starting serial
    return 'AC-0001';
  } catch (err) {
    console.error(err);
    return 'AC-' + String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  }
}

// API to get stats
app.get(['/stats', '/api/stats'], async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;

    res.json({ totalRegistrations: count || 0 });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// API to register
app.post(['/register', '/api/register'], async (req, res) => {
  const { id, name, dob, positions, role, phone, registeredAt } = req.body;
  
  if (!name || !dob || !positions || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const serial = await getNextSerial();
  const posString = Array.isArray(positions) ? positions.join(', ') : positions;

  const row = {
    id: id || `reg_${Date.now()}`,
    serial: serial,
    name: name,
    dob: dob,
    positions: posString,
    role: role || 'PLAYER',
    phone: phone,
    registered_at: registeredAt || new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([row]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Database write error', details: error.message });
    }

    res.json({ success: true, serial });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Root route for testing Vercel deployment
app.get('/', (req, res) => {
  res.send('Backend Server is running on Vercel!');
});

// API to export all registrations as CSV
app.get(['/export.csv', '/api/export-csv'], async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('serial', { ascending: true });

    if (error) throw error;

    const headers = "Serial,ID,Name,DOB,Positions,Role,Phone,RegisteredAt\n";
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = data.map(r => {
      return [
        r.serial, r.id, r.name, r.dob, r.positions, r.role, r.phone, r.registered_at
      ].map(escapeCsv).join(',');
    }).join('\n');

    const csvContent = headers + (rows ? rows + '\n' : '');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).send('Error generating CSV');
  }
});

// Export for Vercel serverless, or listen locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
    console.log(`Connected to Supabase: ${supabaseUrl}`);
  });
}

module.exports = app;
