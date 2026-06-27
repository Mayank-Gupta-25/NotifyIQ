# Smart Notification Triage 🧠🔔

A full-stack, real-time notification triage system that uses static rules, keyword heuristics, and **behavioral learning** to classify incoming notifications into four priority tiers. It filters out the noise, so you can focus on what matters.

## 🚀 Features
- **Real-Time Delivery**: Sockets push `Critical` and `Important` notifications instantly. `Low` and `Noise` are queued.
- **Classification Engine (3 Layers)**:
  - **Layer 1: Static Rules**: User-defined routing (e.g. "All Security alerts are Critical").
  - **Layer 2: Content Analysis**: Keyword and category matching.
  - **Layer 3: Behavioral Learning**: Analyzes how you interact with apps (opens, dismisses, archives) and dynamically upgrades or downgrades future notifications from those apps based on engagement score.
- **Interactive Simulator**: Generate notifications at adjustable speeds, run burst modes, and watch the system classify them in real-time.
- **Analytics Dashboard**: View detailed charts mapping priority breakdown, top noisy apps, time saved, and 24-hour trends.
- **Daily Digest**: Summarizes `Low` and `Noise` notifications that didn't interrupt you.

## 💻 Tech Stack
- **Frontend**: React (Vite), React Router, Recharts, standard modern CSS with glassmorphism UI.
- **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB).

## 🛠️ How to Run

1. **Install dependencies**:
   Run `npm install` in the root, `client`, and `server` folders.

2. **Environment Variables**:
   In `server/`, create a `.env` file containing your MongoDB URI:
   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/notifications
   PORT=5000
   ```

3. **Seed Database (First Time Only)**:
   In `server/`, run:
   ```bash
   npm run seed
   ```
   This populates your test user and rules.

4. **Start Development Server**:
   From the project root:
   ```bash
   npm run dev
   ```
   This launches both the Vite frontend (port 5173) and the Express backend (port 5000) concurrently.

## 📱 How to Use
1. Go to the **Simulator** page and click `🎬 Demo Mode` or `▶ Start Auto`.
2. Open the **Live Feed** to see notifications arriving and being triaged in real time.
3. Hover over a notification and click `Dismiss` or `Archive`.
4. The **BehaviorTracker** watches your actions. If you ignore or dismiss notifications from an app frequently, future notifications from that app will be downgraded to `Noise`. If you open them, they get upgraded.
5. Check the **Analytics** page to see how much time the system saved you by suppressing low-priority noise!

---
*Built as a showcase for Advanced Agentic AI Coding.*
