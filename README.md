# RESQ-AI
> **Tagline:** Every journey deserves a safe alternative.
> **Team:** Token Titans

RESQ-AI is a rural alternative transportation and student safety platform. Its purpose is to help students discover safe alternative transportation when their regular commute is unavailable, and provide an instant, one-tap Emergency Safety Alert with live GPS coordinates to their parents and college authorities if no transport is available.

---
**Deployed Link** - https://spry-jade-yqs7u1a.tmp.now
**Note :** The is two different Interface Student and Agent , open url in two different browser
## 🚀 Quick Start (How to Run)

### 1. Prerequisites
- **Node.js** (v18 or higher recommended, Node v24 installed)
- **npm** (comes with Node.js)

### 2. Install Dependencies
Open your terminal (PowerShell, Command Prompt, or bash) in the project folder `d:\PromptBattel\PromptBattel` and run:

```bash
npm install
```

*(Note: If you run this inside an isolated sandbox without internet access, run `npm install` directly in your normal PowerShell/Command Prompt window outside the sandbox).*

### 3. Start Development Server
Once dependencies are installed, start the Vite development server:

```bash
npm run dev
```

The terminal will display the local development URL, usually:
```
  VITE v5.1.0  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open **http://localhost:5173** in your web browser.

---

## ⚡ Interactive Demo Mode (No Setup Required)

If Supabase credentials are not configured in `.env`, **RESQ-AI automatically runs in full interactive Demo Mode** with realistic sample data from rural Ratnagiri district:

Use the language selector in the top navigation to switch between English, Hindi, Marathi, Kannada, Tamil, and Telugu. Your choice is saved in this browser.

1. **Landing Page:** Navigate features, "How It Works", and safety protocols.
2. **Student Portal (1-Click Demo Login):**
   - Click **Student Login** -> Click **⚡ Fast Demo Login (Ananya Joshi)**
   - View your location status and registered emergency contacts
   - Click **Find Alternative Transport** and enter the bus's presence, last known location, and estimated arrival time
   - Set your maximum wait and search radius (2 km, 5 km, 10 km, 15 km, 20 km); choose an alternative if the bus is absent or late
   - Notify nearby agents with one request and follow its status; the first agent to accept claims the trip
   - Experience the **Empty State / No Transport Found** by testing large or small radiuses
   - Click **Activate Emergency Alert** -> Review GPS coordinates -> Confirm alert -> View delivery status to parent & college
3. **Transport Agent Portal (1-Click Demo Login):**
   - Click **Agent Login** -> Click **⚡ Fast Demo Login (Ramesh Patil - Auto-Rickshaw)**
   - Toggle **Available for Rides / Unavailable** switch in real-time
   - Start / Stop Live GPS broadcasting
   - See open requests in your area, including requests grouped near the same pickup, and accept a request to claim it
   - Manage registered vehicle specifications and view trip history

---

## 🗄️ Production Backend Setup (Supabase & Resend)

To connect real cloud database, authentication, and live emergency email dispatch:

### Step 1: Configure Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the file `supabase/schema.sql` located in this project repository, copy all contents, paste into the SQL Editor, and click **Run**.
   - This creates all 7 tables (`students`, `emergency_contacts`, `transport_agents`, `vehicles`, `transport_requests`, `emergency_alerts`, `notification_logs`).
   - Configures geospatial distance functions (Haversine) and Row Level Security (RLS) policies.
   - For an existing Supabase project, run `supabase/migrations/20261113_broadcast_transport_requests.sql` to enable broadcast requests and bus/ETA details.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your project keys from **Supabase Project Settings -> API**:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

### Step 3: Deploy Emergency Email Edge Function (Resend API)
1. Sign up at [resend.com](https://resend.com) and generate an API key.
2. In Supabase Dashboard -> **Edge Functions** -> Secrets, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `FROM_EMAIL=alerts@yourdomain.com` (or Resend onboarding address)
3. Deploy the function in `supabase/functions/send-emergency-alert/`.

---

## 📁 Project Architecture & Key Files

```
├── src/
│   ├── components/
│   │   ├── common/          # ProtectedRoute, LoadingSpinner
│   │   ├── layout/          # Navbar, DemoBanner
│   │   ├── map/             # AgentMap (Leaflet + OpenStreetMap)
│   │   ├── transport/       # AgentCard, LocationDenied fallback
│   │   └── ui/              # Button, Card, Badge, Alert, Input, etc.
│   ├── contexts/
│   │   ├── AuthContext.tsx  # Dual role authentication (Student & Agent)
│   │   └── LocationContext.tsx # Browser Geolocation API & manual fallback
│   ├── lib/
│   │   ├── demoData.ts      # Fictional verified agents & rural test data
│   │   ├── supabase.ts      # Supabase client & connection validator
│   │   └── utils.ts         # Haversine distance, time formatting, map links
│   ├── pages/
│   │   ├── LandingPage.tsx  # Public landing page with startup design
│   │   ├── student/         # Login, Register, Dashboard, FindTransport,
│   │   │                    # RequestStatus, EmergencyConfirm, EmergencyStatus, Profile
│   │   └── agent/           # Login, Register, Dashboard, Vehicle, Requests, Location
│   ├── types/               # Complete TypeScript database & model definitions
│   ├── App.tsx              # React Router route registry
│   └── main.tsx             # Entry point
├── supabase/
│   ├── schema.sql           # PostgreSQL tables, functions, RLS policies
│   └── functions/
│       └── send-emergency-alert/ # Edge function for Resend email dispatch
└── package.json
```

---

## 🛡️ Student Safety & Privacy Guarantees
- **No Continuous Live Tracking by Default:** Coordinates are only fetched and transmitted when explicitly requested by the student or broadcasted by available agents.
- **Explicit Emergency Confirmation:** Emergency emails are never triggered accidentally; the student must confirm the alert with displayed GPS coordinates.
- **Isolated Recipient Lists:** Parent and college emails are kept isolated and securely protected via database Row Level Security (RLS).
