# 📁 LuxuryStay Project Structure

## Full Directory Tree

```
LuxuryStay/
│
├── 📄 CHATBOT_SETUP.md                          (Complete setup guide)
├── 📄 CHATBOT_QUICK_START.md                    (30-second quick reference)
├── 📄 CHATBOT_EXAMPLES.md                       (Code snippets & examples)
├── 📄 CHATBOT_IMPLEMENTATION_SUMMARY.md         (What was built)
├── 📄 PROJECT_STRUCTURE.md                      (This file)
│
├── 📁 Back-End/
│   ├── 📄 app.mjs                               (Express app - MODIFIED ✨)
│   ├── 📄 package.json                          (Dependencies)
│   │
│   ├── 📁 Config/
│   │   ├── cloudinary.config.mjs
│   │   └── emailConfig.mjs
│   │
│   ├── 📁 DB/
│   │   └── db.mjs                               (MongoDB connection)
│   │
│   ├── 📁 Models/
│   │   ├── Booking.mjs
│   │   ├── Contact.mjs
│   │   ├── Reservation.js
│   │   ├── Restaurant.mjs
│   │   ├── Room.mjs
│   │   ├── Task.mjs
│   │   ├── payment.mjs
│   │   └── users.mjs
│   │
│   ├── 📁 Controller/
│   │   ├── RatingController.mjs
│   │   ├── RegistrationController.mjs
│   │   ├── RoomController.mjs
│   │   ├── UserController.mjs
│   │   ├── bookingController.mjs
│   │   ├── contactController.mjs
│   │   ├── dashboardController.mjs
│   │   ├── paymentController.mjs
│   │   ├── reportController.mjs
│   │   ├── reservationController.mjs
│   │   ├── restaurantController.mjs
│   │   ├── taskController.mjs
│   │   └── ChatbotController.mjs                🤖 NEW CHATBOT!
│   │
│   ├── 📁 Routers/
│   │   ├── RegistrationRoute.mjs
│   │   ├── RoomRoute.mjs
│   │   ├── UserRoute.mjs
│   │   ├── bookingRoutes.mjs
│   │   ├── contactRoutes.mjs
│   │   ├── dashboardRoutes.mjs
│   │   ├── paymentRoutes.mjs
│   │   ├── ratingRoutes.mjs
│   │   ├── reportRoutes.mjs
│   │   ├── reservations.mjs
│   │   ├── restaurants.mjs
│   │   ├── taskRoutes.mjs
│   │   └── chatbotRoutes.mjs                    🤖 NEW CHATBOT ROUTES!
│   │
│   ├── 📁 Services/
│   │   ├── emailService.mjs
│   │   ├── otpService.mjs
│   │   └── redisService.mjs
│   │
│   └── 📁 middleware/
│       └── auth.mjs
│
└── 📁 Front-End/
    ├── 📄 package.json                          (Dependencies)
    ├── 📄 vite.config.js
    ├── 📄 tailwind.config.js
    ├── 📄 postcss.config.js
    ├── 📄 eslint.config.js
    │
    ├── 📁 public/
    │   └── (assets & static files)
    │
    └── 📁 src/
        ├── 📄 App.jsx                           (Main app - MODIFIED ✨)
        ├── 📄 main.jsx                          (Entry point)
        │
        ├── 📁 context/
        │   └── AuthContext.jsx
        │
        ├── 📁 hooks/
        │   ├── useDebounce.js
        │   └── (custom hooks)
        │
        ├── 📁 lib/
        │   └── utils.js
        │
        ├── 📁 utils/
        │   └── socket.mjs
        │
        ├── 📁 components/
        │   ├── Footer.jsx
        │   ├── Navbar.jsx
        │   ├── RatingSection.jsx
        │   ├── ChatbotWidget.jsx                 🤖 NEW CHATBOT WIDGET!
        │   ├── ChatbotWidget.css                 🤖 NEW CHATBOT STYLES!
        │   │
        │   ├── 📁 admin/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── AdminHeader.jsx
        │   │   ├── AdminSidebar.jsx
        │   │   ├── BillingPayments.jsx
        │   │   ├── BookingsManagement.jsx
        │   │   ├── GuestsManagement.jsx
        │   │   ├── ReportsPage.jsx
        │   │   ├── ReservationsManagement.jsx
        │   │   ├── RestaurantsManagement.jsx
        │   │   ├── RoomsManagement.jsx
        │   │   ├── SettingsPage.jsx
        │   │   ├── StaffManagement.jsx
        │   │   └── TasksManagement.jsx
        │   │
        │   ├── 📁 layout/
        │   │   ├── dashboard-layout.jsx
        │   │   ├── navbar.jsx
        │   │   └── sidebar.jsx
        │   │
        │   ├── 📁 sections/
        │   │   ├── AboutSection.jsx
        │   │   ├── CTASection.jsx
        │   │   ├── FacilitiesSection.jsx
        │   │   ├── FeaturesSection.jsx
        │   │   ├── GallerySection.jsx
        │   │   ├── HeroSection.jsx
        │   │   ├── ReviewsSection.jsx
        │   │   └── RoomHighlights.jsx
        │   │
        │   └── 📁 ui/
        │       ├── bookings-table.jsx
        │       ├── button.jsx
        │       ├── summary-card.jsx
        │       └── 📁 charts/
        │           ├── occupancy-chart.jsx
        │           └── revenue-chart.jsx
        │
        └── 📁 pages/
            ├── Booking.jsx
            ├── BookingConfirmation.jsx
            ├── BookingDetails.jsx
            ├── Contact.jsx
            ├── Dining.jsx
            ├── Facilities.jsx
            ├── Gallery.jsx
            ├── Home.jsx
            ├── Reservations.jsx
            ├── RestaurantDetail.jsx
            ├── RestaurantDetailsPage.jsx
            ├── RoomDetail.jsx
            ├── Rooms.jsx
            ├── SplashScreen.jsx
            ├── UserLogin.jsx
            ├── UserRegister.jsx
            ├── UserReservations.jsx
            │
            └── 📁 admin/
                ├── AdminBookings.jsx
                ├── AdminDashboard.jsx
                ├── AdminLogin.jsx
                └── AdminPanel.jsx
```

---

## 🤖 Chatbot Files Summary

### New Files Added

```
✨ CHATBOT FILES (4 core files + 4 docs)

Backend:
├── Controller/ChatbotController.mjs          (124 lines)
└── Routers/chatbotRoutes.mjs                 (17 lines)

Frontend:
├── components/ChatbotWidget.jsx              (186 lines)
└── components/ChatbotWidget.css              (329 lines)

Documentation:
├── CHATBOT_SETUP.md                          (327 lines)
├── CHATBOT_QUICK_START.md                    (117 lines)
├── CHATBOT_EXAMPLES.md                       (396 lines)
├── CHATBOT_IMPLEMENTATION_SUMMARY.md         (404 lines)
└── PROJECT_STRUCTURE.md                      (This file)

Total: 656 lines of code + 840+ lines of docs
```

---

## 📊 File Categories

### Backend Architecture

```
Back-End/
├── Entry Point
│   └── app.mjs                    Main Express server

├── API Layer
│   ├── Controller/ChatbotController.mjs      Business logic
│   └── Routers/chatbotRoutes.mjs             Endpoint mapping

├── Data Layer
│   ├── Models/                    Database schemas
│   ├── DB/db.mjs                  MongoDB connection
│   └── Services/                  Reusable services

├── Supporting
│   ├── middleware/                Request middleware
│   ├── Config/                    Configuration
│   └── package.json               Dependencies
```

### Frontend Architecture

```
Front-End/
├── Entry Point
│   ├── main.jsx                   React entry
│   └── App.jsx                    Main app wrapper

├── UI Components
│   ├── components/ChatbotWidget.jsx    🤖 Chatbot!
│   ├── components/ChatbotWidget.css    🤖 Styles!
│   ├── components/admin/              Admin pages
│   ├── components/layout/             Layout structure
│   ├── components/sections/           Landing sections
│   └── components/ui/                 UI elements

├── Pages
│   ├── pages/                    Route pages
│   └── pages/admin/              Admin pages

├── Logic
│   ├── context/                  State management
│   ├── hooks/                    Custom React hooks
│   └── lib/                      Utilities

└── Supporting
    ├── utils/                    Utility functions
    ├── package.json              Dependencies
    └── Config files              Vite, Tailwind, etc.
```

---

## 🔄 Data Flow

### Chatbot Request Flow

```
User Types Message
    ↓
ChatbotWidget.jsx (Frontend)
    ↓ fetch POST
http://localhost:3000/api/chatbot/chat
    ↓
chatbotRoutes.mjs
    ↓
ChatbotController.mjs
    ├─ Validate input
    ├─ Prepare request
    └─ Call Anthropic API
    ↓
Anthropic Claude API
    ↓
Return AI Response
    ↓
ChatbotController.mjs
    ├─ Format response
    ├─ Handle errors
    └─ Send JSON
    ↓
ChatbotWidget.jsx (Frontend)
    ├─ Parse response
    ├─ Update state
    └─ Display message
    ↓
User Sees Response
```

---

## 🔑 Key Technologies

### Backend

| Technology | Purpose | Files |
|------------|---------|-------|
| **Express.js** | Web framework | app.mjs, Routes |
| **Node.js** | Runtime | All .mjs files |
| **MongoDB** | Database | Models, DB |
| **Anthropic API** | AI responses | ChatbotController.mjs |
| **Dotenv** | Config management | app.mjs |
| **CORS** | Cross-origin requests | app.mjs |

### Frontend

| Technology | Purpose | Files |
|------------|---------|-------|
| **React** | UI library | All .jsx files |
| **React Router** | Navigation | App.jsx |
| **Vite** | Build tool | vite.config.js |
| **Tailwind CSS** | Styling | tailwind.config.js |
| **Framer Motion** | Animations | Various components |

---

## 🚀 Getting Started

### Quick Navigation

1. **First Time Setup?**
   → Read: `CHATBOT_QUICK_START.md`

2. **Need Full Details?**
   → Read: `CHATBOT_SETUP.md`

3. **Want Code Examples?**
   → Read: `CHATBOT_EXAMPLES.md`

4. **Want to Understand Everything?**
   → Read: `CHATBOT_IMPLEMENTATION_SUMMARY.md`

### File Access Guide

| I want to... | Open this file |
|-------------|----------------|
| Start the chatbot | `CHATBOT_QUICK_START.md` |
| Set up environment | `CHATBOT_SETUP.md` |
| Modify bot behavior | `Controller/ChatbotController.mjs` |
| Change widget colors | `components/ChatbotWidget.css` |
| See code examples | `CHATBOT_EXAMPLES.md` |
| Understand architecture | `CHATBOT_IMPLEMENTATION_SUMMARY.md` |
| Find files | `PROJECT_STRUCTURE.md` (this file) |

---

## 📋 Important Locations

```
🔧 Configuration
├── ANTHROPIC_API_KEY          → .env in Back-End/

🤖 Chatbot Logic
├── System Prompt              → Controller/ChatbotController.mjs:6
├── Fallback Responses         → Controller/ChatbotController.mjs:14
└── API Model                  → Controller/ChatbotController.mjs:70

🎨 Styling
├── Widget Colors              → components/ChatbotWidget.css:11-18
├── Window Size                → components/ChatbotWidget.css:36-44
└── Message Bubbles            → components/ChatbotWidget.css:144-186

⚙️ Integration
├── API Endpoint               → components/ChatbotWidget.jsx:63
├── Widget Position            → components/ChatbotWidget.css:10-11
└── App Integration            → App.jsx:37, 180

📱 Components
├── Main Widget                → components/ChatbotWidget.jsx
├── Widget Styles              → components/ChatbotWidget.css
├── Routes Definition          → Routers/chatbotRoutes.mjs
└── Controller Logic           → Controller/ChatbotController.mjs
```

---

## ✅ Verification Checklist

- [x] All chatbot files present
- [x] Backend controller implemented
- [x] Frontend widget created
- [x] Routes registered in app.mjs
- [x] Widget integrated into App.jsx
- [x] Documentation complete
- [x] Code properly commented
- [x] Error handling implemented
- [x] Ready for deployment

---

## 📞 Quick Links

| Need | Document |
|------|----------|
| Setup help | CHATBOT_SETUP.md |
| Quick start | CHATBOT_QUICK_START.md |
| Code examples | CHATBOT_EXAMPLES.md |
| Overview | CHATBOT_IMPLEMENTATION_SUMMARY.md |
| File locations | PROJECT_STRUCTURE.md (this file) |

---

## 🎯 Next Steps

1. **Set ANTHROPIC_API_KEY** in `.env`
2. **Run backend** with `npm run dev`
3. **Run frontend** with `npm run dev`
4. **Test chatbot** by clicking 💬 button
5. **Customize** as needed using CHATBOT_EXAMPLES.md

---

*Happy Coding! 🚀*
