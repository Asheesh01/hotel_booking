# 🏨 Grand Royal Hotel — Booking Platform

A premium hotel booking system built for a high-stakes hackathon. Features secure bookings, advanced search filters, HTML email confirmations, and a dual-faceted reward system (Promo Codes + Loyalty Points).

## 🚀 Key Features

- **Advanced Search**: Filter by check-in/out dates, amenities keyword, and price range.
- **Rewards System**:
  - ✨ **Loyalty Points**: Earn 10% of your booking value in points!
  - 🎟️ **Promo Codes**: Apply codes like `WELCOME10` or `SAVE20` at checkout.
- **Dashboards**:
  - 💼 **Reception**: Track bookings, stats, and daily revenue.
  - ⚙️ **Admin**: Manage room categories and promotion campaigns.
- **Confirmations**: Professional HTML emails with branded hotel header and detailed breakdown.

---

## 🛠️ Setup Instructions

### 1. Backend (Spring Boot)
1.  Navigate to `/hotel-booking-backend`.
2.  Update `src/main/resources/application.properties` with:
    - MySQL credentials.
    - Gmail SMTP username/password (for real emails).
3.  Run the app: `mvn spring-boot:run`.
    - **Note**: The database will auto-seed with 5 room types and 3 promo codes on first run.

### 2. Frontend (React)
1.  Navigate to `/hotel-booking-frontend`.
2.  Install dependencies: `npm install`.
3.  Start development server: `npm run dev`.
4.  Open `http://localhost:5173`.

---

## 🔑 Demo Credentials (Seeded)

| Role | Username (Email) | Password |
|---|---|---|
| **Admin** | `admin@grandroyal.com` | `admin123` |
| **Reception** | `reception@grandroyal.com` | `recep123` |
| **User** | Register a new account | (your choice) |

---

## 📧 Email Setup (Optional)
To receive real emails:
1.  Enable **2-Step Verification** on your Google Account.
2.  Generate an **App Password** for "Mail".
3.  Set `spring.mail.username` and `spring.mail.password` in application properties.
4.  Ensure `app.email.mock=false`.

## 📬 API Patterns (Postman)
- **Login**: `POST /api/auth/login` -> returns JWT.
- **Filter**: `GET /api/rooms/filter?checkIn=2024-03-01&checkOut=2024-03-05`.
- **Profiles**: `GET /api/users/me` (requires Bearer token).
- **Admin**: All routes under `/api/admin/` or `/api/promotions/admin/` require ADMIN role.
