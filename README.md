# 15th August Football Tournament 2026

**Organised by:** Netaji Sports Club  
**Venue:** Netaji Subhash Chandra Bose Stadium, Netaji Bengali Colony, Bhadrawati  
**Date:** 15th August 2026  
**Entry Fee:** ₹150  
**Registration Deadline:** 5th August 2026  

---

## 🌐 Live Site

[https://football-tournament-zj6v.onrender.com](https://football-tournament-zj6v.onrender.com)

## 📋 Admin — Export Registrations

Download all player registrations as a spreadsheet:  
[https://football-tournament-zj6v.onrender.com/api/export-csv](https://football-tournament-zj6v.onrender.com/api/export-csv)

---

## 📁 Project Structure

```
15 Aug/
├── index.html          # Main frontend page
├── style.css           # All styles
├── script.js           # Frontend logic
├── client/
│   └── images/         # Club logo & Bose portrait
└── server/
    ├── server.js       # Express backend (Node.js)
    ├── package.json
    └── .env            # Local env vars (not committed)
```

## 🚀 Deployment (Render)

- **Build Command:** `cd server && npm install`
- **Start Command:** `cd server && npm start`
- **Environment Variables:** Set `SUPABASE_URL` and `SUPABASE_KEY` in Render Dashboard → Environment.

## 🛠 Local Development

```bash
cd server
npm install
# Create a .env file with SUPABASE_URL and SUPABASE_KEY
npm start
```

Then open `http://localhost:3000` in your browser.
