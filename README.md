Football Tournament Registration System
Overview
This project is a Football Tournament Player Registration System designed for an Independence Day (15th August) tournament. It provides a user-friendly interface for players to register, generates official ID cards, and stores all registration data in a CSV file.

Features
Player Registration: Collects player details including Name, Date of Birth, Positions, Role preference (Attacker/Defender), and Contact Number.
ID Card Generation: Automatically generates a professional-looking ID card for each registered player with a unique serial number.
QR Code Integration: Embeds a QR code on each ID card containing the player's details.
Data Persistence: All registration data is saved to a CSV file (registrations.csv) for record-keeping.
Validation: Ensures all required fields are filled before submission.
Tech Stack
Frontend: Vanilla HTML, CSS, and JavaScript
Backend: Node.js and Express.js
Data Storage: CSV (Comma Separated Values)
APIs Used:
html2canvas: For rendering the ID card as an image.
qrcode.js: For generating QR codes.
Vanilla-Tilt.js: For adding a 3D tilt effect to the ID card.
Project Structure
15_Aug.html: The main frontend registration page.
server.js: The backend server that handles data submission and storage.
registrations.csv: Stores all registration data (generated automatically).
package.json: Lists project dependencies.
Getting Started
Prerequisites
Node.js installed.
NPM (usually comes with Node.js) installed.
Installation
1. Clone the repository:

git clone <repository-url>
cd Football-Tournament

2. Install dependencies:

npm install

Running the Application
1. Start the backend server:

node server.js
The server will start on port 3000.

2. Open the frontend:

Open 15_Aug.html in your web browser.

Usage
Enter the player's details in the form.
Select the desired position and role.
The ID card preview will update in real-time.
Click "GENERATE ID CARD & REGISTER".
The data will be saved to registrations.csv and the ID card will be displayed.
Data Format
Each registration is stored in registrations.csv with the following columns:
Serial: Auto-generated serial number (e.g., AC-0001).
ID: Player's ID (e.g., ACF2003).
Name: Player's full name.
DOB: Date of Birth.
Positions: List of preferred positions.
Role: Attacker or Defender.
Phone: Contact number.
RegisteredAt: Timestamp of registration.
Screenshot
Dashboard Screenshot
ID Card Screenshot
