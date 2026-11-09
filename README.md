# 🦐 ShrimpGuard – Shrimp Farm Management, Pond Monitoring & Risk Alert System

A modern, responsive, full-stack web application designed for aquaculture farmers and farm administrators to manage multiple shrimp ponds, record daily feed consumption, monitor water quality without physical sensor hardware via realistic telemetry simulation, evaluate pond environmental health scores, and receive automated risk alerts.

---

## 🌟 Key Features

### 1. 🛡️ User Roles & Authentication
- **Admin**:
  - Secure login with JWT and bcrypt.
  - Supervise all registered farmers and toggle account active/suspended status.
  - Platform-wide monitoring of all ponds with water parameters and health scores.
  - Live system alert stream for warning and critical conditions across all farms.
- **Farmer**:
  - Registration (Full name, mobile number, email, password, farm location).
  - Personal farm dashboard with summary metrics, active ponds, and recent alerts.
  - Full CRUD pond management (Pond name/number, size in hectares/acres, stocking date, shrimp count, species, initial feed details).
  - Multilingual support: **English** and **Telugu (తెలుగు)**.

### 2. 🥣 Daily Feed Management
- Record daily rations divided into: **Morning**, **Afternoon**, and **Evening** quantities.
- **Automated calculations**:
  - Real-time Total Daily Feed (kg)
  - Weekly Feed Consumption (last 7 days sum)
  - Monthly Feed Consumption (last 30 days sum)
  - Cumulative Total Feed Consumption per pond
  - 14-day stacked feed progression chart.

### 3. 🧪 Water Quality Monitoring & Telemetry Simulation (Hardware-Free)
- Real-time telemetry parameters:
  - **Temperature (°C)** [Ideal: 26.0 - 32.0 °C]
  - **pH Level** [Ideal: 7.5 - 8.5]
  - **Dissolved Oxygen (DO mg/L)** [Ideal: &ge; 5.0 mg/L]
  - **Turbidity (NTU)** [Ideal: 25.0 - 45.0 NTU]
- **Dual Operating Modes**:
  1. **Manual Mode**: Farmers record measurements taken with physical test kits or probes.
  2. **Simulation Mode**: Hardware-free telemetry generation with 1-click presets:
     - 🟢 **Normal Scenario**: Optimal tropical aquaculture conditions.
     - 🟡 **Warning Scenario**: Thermal peak and mild DO drop.
     - 🔴 **Critical Scenario**: Severe hypoxia (DO < 3.0 mg/L) and alkaline shock.
     - ⚡ Optional **Live Telemetry Loop** (auto-generates periodic telemetry for demonstration).
- Clear UI tags identifying whether a reading was **SIMULATED** or **MANUAL OPERATOR ENTRY**.

### 4. 🧠 Rule-Based Pond Health Analysis
- Configurable rule thresholds evaluating parameter deviations.
- Health Score (0 - 100) and condition classification:
  - **NORMAL** (85 - 100): Optimal aquaculture comfort.
  - **WARNING** (60 - 84): Suboptimal stress, preventative adjustments required.
  - **CRITICAL** (< 60): Immediate danger of mortality (e.g. oxygen depletion).
- Actionable, prioritized recommendations (e.g. paddlewheel aerator engagement, feeding reduction, lime application, water exchange).
- *Clear non-clinical agricultural disclaimer included on all views.*

### 5. 🚨 Automated Risk Alert System
- Generates in-app notifications whenever a pond enters **WARNING** or **CRITICAL** state.
- Displays: Pond name/identifier, severity badge, condition detected, timestamp, threshold comparison, and recommended farmer action.
- Mark as read, mark all read, and filter by severity.
- Architecture prepared with webhook fields for future SMS & SMTP email gateway integration.

### 6. ⚖️ Additional Modules
- **Pond Comparison**: Side-by-side matrix comparing DOC, stocking density, health scores, water parameters, and total feed across multiple ponds.
- **Expense Tracker**: Track input costs across Feed, Seed/PL, Electricity/Diesel, Labor, Chemicals/Probiotics with category breakdown chart.
- **Harvest Records**: Record harvest biomass (kg), size grade count/kg, sale price/kg, auto-calculated revenue, and survival rate (%).
- **Farmer Profile**: View and update contact details, farm location, and password.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing |
| **Internationalization** | Built-in bilingual engine (English & Telugu) |

---

## 🔑 Pre-Seeded Demonstration Accounts

The application automatically seeds sample accounts and realistic historical data on startup:

| Role | Email | Password | Pre-seeded Data |
|---|---|---|---|
| **Farmer** | `farmer@shrimpguard.com` | `farmer123` | 3 Sample Ponds (Normal, Warning, Critical), 7-day feed history, 12-hour telemetry history, active alerts, expenses, harvest records |
| **Admin** | `admin@shrimpguard.com` | `admin123` | Platform-wide supervisor privileges, farmer directory, all ponds, system alert stream |

*Note: The login screen also features 1-click **"Farmer Demo"** and **"Admin Demo"** quick-fill buttons for effortless instant evaluation.*

---

## 🚀 Terminal Commands to Run the Application

### 1. Start the Backend Server

Open a terminal in the project directory:

```bash
cd backend
node src/server.js
```

> **Backend Server runs on:** `http://localhost:5000`  
> *MongoDB connection note:* Connects to `mongodb://127.0.0.1:27017/shrimpguard`. If local MongoDB service is installed, it connects seamlessly and seeds sample data automatically.

---

### 2. Start the Frontend Development Server

Open a **separate** terminal in the project directory:

```bash
cd frontend
npm run dev
```

> **Frontend Application runs on:** `http://localhost:5173`  
> *The Vite dev server includes a reverse proxy that automatically routes all `/api` requests to `http://localhost:5000`.*

---

## 📁 Project Structure

```
shrimpguard web/
├── backend/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── db.js             # Resilient MongoDB connector
│       │   └── rules.js          # Configurable thresholds & disclaimer
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── alertController.js
│       │   ├── analyticsController.js
│       │   ├── authController.js
│       │   ├── expenseController.js
│       │   ├── feedController.js
│       │   ├── harvestController.js
│       │   ├── pondController.js
│       │   └── waterQualityController.js
│       ├── middleware/
│       │   └── auth.js           # JWT & role-based authorization
│       ├── models/
│       │   ├── Alert.js
│       │   ├── Expense.js
│       │   ├── FeedRecord.js
│       │   ├── Harvest.js
│       │   ├── Pond.js
│       │   ├── User.js
│       │   └── WaterQualityRecord.js
│       ├── routes/               # Express API routes
│       ├── utils/
│       │   ├── healthEvaluator.js # Rule-based risk engine
│       │   ├── seedData.js        # Automatic demo seed script
│       │   └── simulator.js       # Realistic hardware-free telemetry
│       └── server.js             # Express app entrypoint
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── components/
        │   ├── admin/
        │   │   └── AdminDashboard.jsx
        │   ├── common/
        │   │   ├── AuthView.jsx
        │   │   └── Navbar.jsx
        │   └── farmer/
        │       ├── AlertCenter.jsx
        │       ├── ExpenseTracker.jsx
        │       ├── FarmerDashboard.jsx
        │       ├── FarmerProfile.jsx
        │       ├── FeedManager.jsx
        │       ├── HarvestRecords.jsx
        │       ├── PondComparison.jsx
        │       ├── PondDetailsView.jsx
        │       ├── PondManager.jsx
        │       └── WaterMonitoringView.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── LanguageContext.jsx
        ├── services/
        │   └── api.js            # Axios client with JWT interceptor
        ├── utils/
        │   └── translations.js   # English & Telugu dictionaries
        ├── App.jsx
        └── main.jsx
```

---

## 🧪 Agri-Tech Disclaimer
*Demonstration threshold rule-based analysis. Water quality parameters indicate environmental stress and risk factors, but do NOT confirm clinical shrimp diseases or biological infection. Health score is a demonstrative risk indicator.*
