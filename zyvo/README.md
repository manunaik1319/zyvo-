# 🌌 ZYVO — Premium Focus Spaces & Library Booking

A premium, state-of-the-art mobile application designed to simplify booking study spaces, library desks, and private study hubs. Built with **React Native**, **Expo SDK 51**, and **Expo Router**, ZYVO delivers a fluid, micro-animated, and accessible interface that feels as premium as Airbnb or Notion.

---

## 📱 Feature Overview

ZYVO empowers students, researchers, and remote professionals to find and book their ideal study environments:

- **Elegant Dynamic Greeting Header**: Greets users dynamically based on their local time with a weather widget for smart study planning.
- **Interactive Search & Advanced Filters**: Instantly search for nearby study halls, libraries, and workspaces with filters for price, rating, distance, and amenities.
- **Premium Hero Banner**: Interactive card showing current trending spaces with custom CTA actions.
- **Active Booking Trackers**: Floating premium cards displaying booking date, seat number, remaining duration, and real-time circular progress.
- **Quick Action Center**: Quick tap shortcuts for Booking Seats, finding Libraries, accessing Favorites, and reviewing My Bookings.
- **Nearby Spaces (Carousels & Recommendations)**: Media-rich cards displaying space availability, ratings, distance, and direct booking actions.
- **Live Occupancy Widget**: Real-time study hall occupancy percentages with animated progress meters and color-coded status badges (green/amber/red).
- **Favorites & Booking Management**: Seamless tracking of current, upcoming, and past reservations using Zustand store persistence.
- **Bottom Glassmorphism Tab Bar**: A premium, floating navigation bar featuring glassmorphic blur effects and micro-interactions.

---

## ⚙️ Tech Stack & Libraries

- **Framework**: [Expo SDK 51](https://expo.dev/) (React Native)
- **Routing**: [Expo Router v3](https://docs.expo.dev/router/introduction/) (File-system based routing)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Lightweight, hook-based global state)
- **Animations**: [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/) (High-performance native-thread animations)
- **Styling**: Vanilla React Native StyleSheet with standard 8px spacing, custom shadows, and dynamic glassmorphism properties.
- **Gradients**: [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- **Icons**: Expo Vector Icons (`Ionicons`, `Feather`, `MaterialCommunityIcons`)
- **Typography**: [Inter Font Family](https://fonts.google.com/specimen/Inter) via `@expo-google-fonts/inter`

---

## 📁 Repository Structure

```tree
zyvo/
├── assets/                  # App images, logos, and custom illustrations
├── src/
│   ├── app/                 # Expo Router file-system routes
│   │   ├── (auth)/          # Authentication flow (Register, OTP, Profile Setup)
│   │   ├── (tabs)/          # Tab navigation screens (Home, Discover, Bookings, Profile)
│   │   ├── booking/         # Space booking wizard (Seat selection, Success)
│   │   ├── favorites/       # Favorite spaces screen
│   │   └── space/           # Detailed Space pages (Ratings, Reviews, Gallery)
│   ├── components/          # Reusable shared components
│   │   ├── cards/           # Space cards, booking cards, category cards
│   │   ├── common/          # Common components (Buttons, Inputs, Loaders)
│   │   └── ui/              # Glassmorphic views, custom badges, floating tabs
│   ├── constants/           # Global colors, typography, routes, and config
│   ├── features/            # Feature-specific components and business logic
│   ├── hooks/               # Custom React hooks (Theme, debounce, animations)
│   ├── services/            # Mock services, location APIs, weather API integrations
│   ├── store/               # Zustand global stores (authStore, bookingStore, spaceStore)
│   ├── theme/               # Global Design System config & theme values
│   ├── types/               # TypeScript type definitions and interfaces
│   └── utils/               # Formatting, time helpers, and validation utilities
```

---

## 🎨 Premium Design System

ZYVO is built with a custom design system centered around accessibility, visual hierarchy, and polished aesthetics:

| Property | Token Value | Description |
| :--- | :--- | :--- |
| **Primary Color** | `#3B82F6` / `#2563EB` | Royal Blue accent |
| **Secondary Color**| `#6366F1` / `#60A5FA` | Indigo-violet highlight |
| **Success Color** | `#22C55E` / `#10B981` | Emerald green status indicator |
| **Background** | `#F8FAFC` | Slate 50 ultra-clean background |
| **Surface (Cards)**| `#FFFFFF` / Alpha White | Crisp white with soft glassmorphism |
| **Text Primary** | `#0F172A` | Slate 900 high contrast text |
| **Text Secondary**| `#64748B` | Slate 500 readable secondary text |
| **Border Radius** | `20px` to `24px` | Soft, friendly corners for premium widgets |
| **Spacing System** | `8px` Base Grid | Spacing increments: 8, 16, 24, 32, 40, 48 |
| **Tap Targets** | `Min 44x44 px` | Standard size for easy mobile interactions |

---

## 🚀 Getting Started

Follow these steps to run ZYVO locally in your development environment:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (LTS version recommended) and a package manager (npm or yarn).

### Installation

1. Clone the repository and navigate into the root directory:
   ```bash
   cd zyvo
   ```

2. Install the node packages:
   ```bash
   npm install
   ```

### Running the App

To run the development server, run:
```bash
npm run start
```

This starts Expo CLI. You can then:
- Press `a` to open in an **Android Emulator** or device.
- Press `i` to open in an **iOS Simulator** or device.
- Press `w` to run the app as a **Web Application** in your default browser.
- Scan the QR code with the **Expo Go** app on your physical iOS or Android device.

---

## 🛠️ Diagnostics & Code Quality

Verify TypeScript configuration and code compilation with:
```bash
npm run ts:check
```
