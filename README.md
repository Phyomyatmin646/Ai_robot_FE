# Aether & Voice Next OS — Frontend Web Console

High-performance, ultra-low latency operational frontend for the **AI Voice Assistant Robot Platform** (matching `/Users/phyomyatmin/Desktop/Ai Robot_BE`).

---

## 🛠 Tech Stack
- **Framework:** React 18 + TypeScript + Vite 6
- **Design System:** Aether & Voice Next OS (Glassmorphism & Soft UI, Kinetic Violet `#7562F6`, Aether Cyan `#53B7E8`)
- **Styling:** Tailwind CSS v3 with custom design tokens
- **Routing:** React Router v7 with protected routes & session restoration
- **Data Caching:** TanStack Query v5 (React Query)
- **HTTP Client:** Axios with JWT token refresh rotation queue
- **Real-Time:** Socket.IO Client for robot telemetry, speech streaming, and BullMQ reminder alarms
- **Icons:** Lucide React

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Accessible at: **http://localhost:5173**

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 📂 Modules & Architecture

| Module | Route | Backend Connection | Description |
|---|---|---|---|
| **Dashboard** | `/` | `GET /analytics/stats`, Socket.IO | Real-time battery, RSSI, AI latency, live waveform, alarms |
| **Device Hub** | `/devices` | `/devices/*` | ESP32-S3 provisioning, API Key generation with copy-to-clipboard |
| **Device Detail** | `/devices/:id` | `/settings/device/:id` | Volume, brightness, NeoPixel LED, capacitive touch diagnostics |
| **AI Voice & Chat**| `/conversations` | `/conversations/*`, `/audio/stop-on-device` | Multimodal speech streaming, live transcription, barge-in interrupt |
| **Audio Library** | `/audio` | `/audio/*`, `/audio/:id/play-on-device` | GridFS chunk playback directly on robot speaker (<50ms latency) |
| **Todo Tasks** | `/todo` | `/todo/*` | Priority tasks with automated Redis BullMQ delayed alarms |
| **Reminders** | `/reminders` | `/reminders/*` | Asia/Yangon timezone scheduling, physical robot chime ("ထမြည်ရမယ်") |
| **Notifications** | `/notifications` | `/notifications/*` | Real-time alerts, mark read, Socket.IO live notifications |
| **Knowledge Base** | `/knowledge` | `/knowledge/*` | RAG vector chunks, interactive semantic vector search tester |
| **MCP Tools** | `/mcp` | `/mcp/*` | Model Context Protocol tool schemas, live execution console, audit logs |
| **Analytics** | `/analytics` | `/analytics/stats` | End-to-end speech latency breakdown (STT + LLM + TTS + Network) |
| **Settings** | `/settings` | `/settings/user`, `/users/telegram/link` | Gemini models routing, thinking level, Telegram bot link, password |
| **System Health** | `/health` | `/health` | Fastify, MongoDB Atlas, Redis BullMQ, MQTT, Voice Engine probes |
| **Auth** | `/login`, `/register` | `/auth/*` | Secure JWT authentication with demo preview fallback |

