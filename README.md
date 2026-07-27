# Football Tournament Registration System

## Overview
This project is a Football Tournament Player Registration System designed for an Independence Day (15th August) tournament. It provides a user-friendly interface for players to register, generates official ID cards, and stores all registration data securely.

## Architecture
This project has been upgraded to a production-ready **Full-Stack Cloud Architecture**:
- **Frontend (Vercel)**: Vanilla HTML/CSS/JS located in the `/client` directory.
- **Backend (Render)**: Node.js/Express.js server located in the `/server` directory.
- **Database (Supabase)**: PostgreSQL database for live, persistent storage.

## Features
- **Player Registration**: Collects player details including Name, Date of Birth, Positions, Role preference, and Contact Number.
- **ID Card Generation**: Automatically generates a professional-looking ID card for each registered player with a unique serial number (e.g., `AC-0001`).
- **Payment & QR Code**: Embeds UPI payment details and a dynamically generated QR code on each ID card.
- **Data Persistence**: Uses a Supabase PostgreSQL database.
- **Export to Excel**: Admin endpoint to instantly download all registrations as a `.csv` file.
- **Deadline Enforcer**: Automatically closes registration after a specified date.

## Tech Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript
- **Backend**: Node.js, Express, `dotenv`
- **Database**: Supabase (`@supabase/supabase-js`)
- **Libraries**:
  - `html2canvas`: For rendering the ID card as an image for download.
  - `qrcode.js`: For generating QR codes.
  - `vanilla-tilt.js`: For 3D hover effects on the ID card.

## Project Structure
```text
Football-Tournament/
├── client/                 # Frontend deployed to Vercel
│   ├── index.html          # Main registration interface
│   ├── styles.css          # Styling
│   ├── app.js              # Logic and API integration
│   └── images/             # Logos and assets
├── server/                 # Backend deployed to Render
│   ├── server.js           # Express API and Supabase logic
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variable template
└── supabase_schema.sql     # SQL script to create the database table
```

## Getting Started

### Prerequisites
- Node.js installed locally.
- A Supabase account and project.

### 1. Database Setup (Supabase)
1. Go to your Supabase Project > SQL Editor.
2. Run the queries inside `supabase_schema.sql` to create the `registrations` table.
3. Note your `Project URL` and `anon public` key.

### 2. Backend Setup (Render / Local)
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```env
   PORT=3000
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   ```
4. Start the server: `npm start`
5. The API will be available at `http://localhost:3000` (or your Render URL).

### 3. Frontend Setup (Vercel / Local)
1. Open `client/app.js`.
2. Update the `CONFIG.API_URL` at the top of the file to point to your backend (e.g., `http://localhost:3000/api` for local or `https://your-api.onrender.com/api` for production).
3. Open `client/index.html` in your browser (or deploy the `client` folder to Vercel).

## Usage
1. Enter the player's details in the form.
2. Select desired positions and role.
3. The ID card preview will update in real-time.
4. Click **Register & generate card**.
5. The data will be saved to Supabase and a success message will appear.
6. Click **Download card** to save the ID as an image.
7. Use the "DOWNLOAD EXCEL (CSV)" link to export the database.
