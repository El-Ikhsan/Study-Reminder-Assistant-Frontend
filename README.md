<h1 align="center">Study Reminder Assistant - Frontend</h1>

<div align="center">
  <p><em>Other repositories in this project:</em></p>
  <h4>
    <a href="https://github.com/El-Ikhsan/Study-Reminder-Assistant">Backend</a>
    <br>
    <a href="https://github.com/El-Ikhsan/Study-Reminder-Assistant-IoT">Firmware IoT</a>
  </h4>
</div> 

<div align="center">
  <a href="#what-is">About</a>
  <span> • </span>
  <a href="#features">Features</a>
  <span> • </span>
  <a href="#tech-stack">Tech Stack</a>
  <span> • </span>
  <a href="#requirements">Requirements</a>
  <span> • </span>
  <a href="#local-installation">Installation</a>
  <span> • </span>
  <a href="#license">License</a>
  <p></p>
</div> 

<div align="center">
 
[![Repo Size](https://img.shields.io/github/repo-size/El-Ikhsan/Study-Reminder-Assistant-Frontend?style=flat-square&color=blue)](https://github.com/El-Ikhsan/Study-Reminder-Assistant-Frontend)
[![GitHub Issues](https://img.shields.io/github/issues/El-Ikhsan/Study-Reminder-Assistant-Frontend?style=flat-square&color=orange)](https://github.com/El-Ikhsan/Study-Reminder-Assistant-Frontend/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
![React](https://img.shields.io/badge/React-61DAFB.svg?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%23006199.svg?style=flat-square&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000.svg?style=flat-square&logo=shadcnui&logoColor=white)

</div>

## Showcase

## What is

Study Reminder Assistant (Rinchan) is an intelligent study companion system combining Pomodoro time management, environmental IoT sensor monitoring (temperature, light, and noise), and AI-driven interactions. This repository serves as the **Frontend Web Application**, providing an intuitive dashboard for managing Pomodoro sessions, visualizing real-time environmental telemetry from IoT devices, tracking learning progress, and managing user preferences.

## Features

- Interactive Pomodoro timer with start, pause, resume, and stop controls synchronized across devices.
- Real-time IoT environmental telemetry dashboard (temperature, light lux, noise) with live charts and historical logs.
- IoT device management and pairing with status monitoring.
- User authentication (login, registration) and profile management.
- Comprehensive study statistics, graphs, and performance analytics using Recharts.
- Responsive modern UI with Dark and Light mode support using Tailwind CSS and Radix UI.

## Tech Stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS v4
- Radix UI & shadcn/ui components
- Lucide React Icons
- Recharts
- Axios & React Router DOM
- Bun / Node.js

## Requirements

Make sure your system has the following tools installed:

- Node.js 20+ or [Bun](https://bun.sh/) (recommended)

## Local Installation

1. Clone the repository and enter the project directory.

```bash
git clone https://github.com/El-Ikhsan/Study-Reminder-Assistant-Frontend.git
cd Study-Reminder-Assistant-Frontend
```

2. Install dependencies.

```bash
bun install
# or: npm install
```

3. Create the environment configuration file.

```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to your backend server:

```ini
VITE_API_BASE_URL=http://localhost:8787/api
```

4. Start the development server.

```bash
bun run dev
# or: npm run dev
```

The application will be accessible at `http://localhost:5173`.

5. (Optional) Build for production.

```bash
bun run build
```

## License

This project is licensed under the MIT License.
