# 🚦 Traffic Violation Reporting App

A full-stack civic tech application for reporting and tracking traffic violations in real time.

## 📱 Overview

Built as a competition project, this app allows citizens to report traffic violations through a mobile interface backed by a Node.js/Express API. Reports are visualized on a map dashboard with leaderboard gamification to encourage community participation.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo) |
| Frontend Web | React.js |
| Backend | Node.js, Express |
| Auth | JWT / Context API |
| Maps | Geolocation + Map View |

## 📂 Project Structure

```
Traffic Violation Reporting/
├── mobile/          # React Native app
│   └── src/
│       ├── screens/ # Dashboard, Login, Report
│       ├── context/ # Auth context
│       └── services/# API integration
├── frontend/        # React web dashboard
│   └── src/
│       ├── pages/   # Dashboard, Map, Stats, Admin
│       └── components/
└── backend/         # Express API server
```

## 🚀 Getting Started

### Backend
```bash
cd backend
npm install
node server.js
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## ✨ Features

- Submit traffic violation reports with location
- Real-time map view of reported violations
- Leaderboard for top reporters
- Admin dashboard for moderation
- JWT-based authentication
- Statistics and analytics page

## 👨‍💻 Team

Built by Punit Saini & Ranveer Patil — VIT Mumbai, Computer Engineering
