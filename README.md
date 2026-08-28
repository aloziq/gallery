# Offline-First University Project Exhibition Platform

This is a production-quality web application designed specifically for a university computer college project exhibition. Visitors can scan QR codes on project tables to open project pages and leave ratings instantly, without needing accounts, internet access, or downloading apps.

## Features

- **Offline-First**: Can run entirely on a local network (LAN) without external internet access.
- **Fast Evaluation**: Visitors can scan and rate in under 15 seconds.
- **Arabic UI**: Full RTL layout and Arabic language support by default.
- **QR Code Management**: Automatically generates printable SVG QR codes for all projects.
- **Anonymous Voting**: Uses secure random UUIDs to track visitors and prevent duplicate voting per project.
- **Admin Dashboard**: Secure authentication to manage projects, upload images, and view the live leaderboard.
- **Backup Support**: Simple command to back up the local database anytime.

---

## 💻 Server Deployment Guide (Windows Laptop)

The application is designed to run on a single Windows laptop acting as the local server on the exhibition's dedicated Wi-Fi network.

### 1. Requirements
Ensure the following are installed on your Windows laptop:
- [PHP 8.2+](https://windows.php.net/download/) (Or use [Laravel Herd for Windows](https://herd.laravel.com/windows))
- [Composer](https://getcomposer.org/)
- [Node.js (v20+)](https://nodejs.org/)

*Recommendation: Using **Laravel Herd** on Windows is the absolute easiest way to serve the application locally without configuring Nginx or PHP-FPM manually.*

### 2. Finding the Server's LAN IP
To allow visitors to connect to the laptop via Wi-Fi:
1. Connect your laptop to the Exhibition Wi-Fi router.
2. Open PowerShell or Command Prompt.
3. Type `ipconfig` and press Enter.
4. Look for the `IPv4 Address` under your Wi-Fi adapter (e.g., `192.168.1.100`). **This is your Server IP.**

### 3. Setup and Installation
Open your terminal (PowerShell) and navigate to the project directory:

```bash
# 1. Install PHP dependencies
composer install

# 2. Setup Environment
cp .env.example .env
php artisan key:generate

# 3. Configure .env for LAN
# Edit .env and change APP_URL to your Server IP
# Example: APP_URL=http://192.168.1.100:8000

# 4. Run Migrations & Seed Demo Data
php artisan migrate --force
php artisan db:seed --class=DemoExhibitionSeeder

# 5. Install JS dependencies and Build Assets for Production
npm install
npm run build
```

### 4. Windows Firewall Configuration
You MUST allow PHP and the Web Server through the Windows Firewall, otherwise phones won't be able to connect:
1. Open **Windows Security** > **Firewall & network protection**.
2. Click **Allow an app through firewall**.
3. Click **Change settings**, then **Allow another app**.
4. Browse and select your `php.exe` (if using Herd, it's usually inside `C:\Users\%USERNAME%\.config\herd\bin\php...`).
5. Ensure both **Private** and **Public** are checked.

### 5. Starting the Exhibition Server
To start the server, you have two simple options:

**Option A (Built-in Artisan Server - Recommended for simplicity):**
```bash
php artisan serve --host=0.0.0.0 --port=8000
```
*(The `--host=0.0.0.0` flag tells PHP to accept connections from any device on the network, not just localhost).*
Visitors will access the app at: `http://192.168.1.100:8000` (Replace with your actual IP).

**Option B (Laravel Herd):**
If using Herd, the site is automatically served. To make it accessible across the LAN, you can use Herd's sharing features or Ngrok if internet is available, but for offline LAN, you may need to configure Herd's Nginx to listen on your LAN IP, or just stick to Option A.

### 6. Prevent Laptop Sleep
During the exhibition, the server laptop MUST stay awake:
- Plug in the power adapter.
- Go to Windows Settings > **Power & sleep**.
- Set **Screen** and **Sleep** to **Never**.

---

## 🖨️ Generating QR Codes

1. Go to `http://127.0.0.1:8000/admin` (or your LAN IP) and log in with the admin credentials:
   - Email: `admin@example.com`
   - Password: `password`
2. Navigate to **Projects (المشاريع)**.
3. Click the **QR Code** button next to any project.
4. A printable page will appear. Use `Ctrl + P` to print it directly, or save it as a PDF. Place it on the student's exhibition table.

---

## 💾 Backing up the Database

Since this uses SQLite, the database is a single file (`database/database.sqlite`).
We have provided a command to safely back it up during the event:

```bash
php artisan exhibition:backup
```
This will copy the database to `storage/app/backups/` with a timestamp. Run this command periodically during the exhibition.

---

## 🛑 Stopping the System Safely
1. In the terminal running `php artisan serve`, press `Ctrl + C`.
2. Run `php artisan exhibition:backup` one last time to ensure you have a final copy.
3. Export the final evaluation results from the admin dashboard (if implemented) or manually copy the SQLite database.
