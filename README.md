# NAVI — Signal-to-Health: Lead Detection Platform

A public health web platform built at the **Columbia University BMES Healthcare Hackathon (February 2026)** that translates electrochemical signals into actionable lead contamination data.

## Overview

NAVI connects to a low-cost hardware sensor ($25 prototype using an Arduino Uno and custom 3D-printed electrode) to detect lead levels in water samples via Square Wave Voltammetry (SWV). Results are classified against CDC blood lead level thresholds and GPS-tagged to a live community contamination map, enabling real-time public health surveillance.

## Features

- **Live Electrochemical Simulation** — Visualizes voltage sweep scans (−1.0V to 0V) in real time with an interactive current/potential graph
- **Lead Level Classification** — Automatically categorizes results using CDC reference thresholds (Safe / Elevated / High / Critical)
- **AI Health Advisor** — Powered by Google Gemini AI; provides context-aware health guidance based on scan results and user location
- **Hot Zone Map** — GPS-tags detections and plots color-coded contamination markers on a community map for public health officials
- **Scan History** — Logs past test runs locally for reference

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, Framer Motion
- **Data Visualization:** Recharts
- **AI Integration:** Google Gemini AI (`@google/genai`)
- **Icons:** Lucide React

## Hardware (Physical Prototype)

The software interfaces with a $25 hardware prototype built during the hackathon:
- Arduino Uno (microcontroller)
- L293D motor driver chip (repurposed to apply controlled voltage sweep to electrodes)
- Custom 3D-printed electrode holder

## Getting Started

**Prerequisites:** Node.js

1. Clone the repository:
```bash
   git clone https://github.com/allenchen-dev/navi-signal-to-health.git
   cd navi-signal-to-health
```

2. Install dependencies:
```bash
   npm install
```

3. Set up your Gemini API key:
```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY to .env.local
```

4. Run the app:
```bash
   npm run dev
```

## Screenshots

<img width="686" height="386" alt="image" src="https://github.com/user-attachments/assets/c588de76-00c0-4159-8ccb-2cf8583b1886" />
> <img width="664" height="342" alt="image" src="https://github.com/user-attachments/assets/92c0a379-7133-40f7-9574-639b1a1898db" />
<img width="664" height="342" alt="image" src="https://github.com/user-attachments/assets/97a4c46e-ab21-4b7a-a774-7a4977577718" />
<img width="654" height="370" alt="image" src="https://github.com/user-attachments/assets/8d825a27-0833-4c48-80d8-2f0d83053806" />
<img width="671" height="409" alt="image" src="https://github.com/user-attachments/assets/d73cc5d0-1da2-47b8-92e7-59564dc0b700" />
<img width="671" height="409" alt="image" src="https://github.com/user-attachments/assets/758c1b49-ced4-431f-8f5b-a02e0f7a97aa" />





## Built With

This project was built with the assistance of Google AI Studio. Developed in 24 hours by a team of 5 at the 3rd Annual Columbia University BMES Healthcare Hackathon, sponsored by the Biomedical Engineering Society.

## License

MIT
