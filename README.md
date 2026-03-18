# Snippo Booking - Full-Stack Booking Management System

A comprehensive, full-stack web application designed for managing service bookings, staff schedules, and administrative operations.

## 🚀 Existing Functionality

### 👤 Client / User Features
- **Interactive Booking Flow**: Seamless process for selecting services, preferred staff/guards, and scheduling dates/times.
- **Secure Payments**: Integrated with **Stripe** for reliable and secure transaction processing.
- **Client Dashboard**: Personalized area to view booking history, manage profiles, and track appointment statuses.
- **Review System**: Ability for clients to provide feedback and rate their experience with staff members.

### 🛡️ Staff / Guard Features
- **Dedicated Staff Portal**: Secure login for personnel to manage their work life.
- **Schedule Management**: Staff can update their bio, profile picture, and general availability.
- **Assignment Tracking**: Real-time view of all assigned bookings and past service history.

### ⚙️ Administrative Features
- **Comprehensive Dashboard**: High-level overview of system activity, including professional booking stats.
- **Staff Management**: Full CRUD operations for managing staff members, including performance oversight.
- **Booking Oversight**: Ability to view, modify, and monitor all client bookings.
- **System Configuration**: Manage global settings, including service types and pricing.
- **Communication Management**: Advanced interface for customizing and managing automated email templates.

---

## 🛠️ Tech Stack

- **Frontend**: React.js with Vite, Vanilla CSS for premium styling.
- **Backend**: Node.js & Express.js API.
- **Database**: JSON-file persistence (`server/data/db.json`) for lightweight and fast data handling.
- **Integrations**: Stripe API (Payments), NodeMailer (Email notifications).

---

## 🚧 Future Roadmap: Security Guard System
> [!IMPORTANT]
> **Status: Not Implemented**

The upcoming **Security Guard System** will introduce enhanced operational capabilities:
1. **Automated Guard Provisioning**: dedicated user account creation for all security personnel.
2. **Administrative Availability Control**: Admins will be able to set and override guard availability directly.
3. **Availability-Based Booking**: Clients will only see and book guards who are confirmed as available for the selected slot.
4. **Context-Aware Data Access**: Once a guard is assigned to a specific booking, they will automatically gain secure access to the client’s relevant data for that session.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- npm 9+

### Quick Start
```bash
# Install dependencies for both client and server
npm install

# Setup initial database and environment
npm run setup
```

### Run in Development
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **API**: `http://localhost:4000`

### Environment Variables
1. `server/.env.example` -> `server/.env`
2. `client/.env.example` -> `client/.env`

*Note: Ensure `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` are set for initial access.*

---

## 📦 Deployment
For Hostinger Business deployment instructions, please refer to [HOSTINGER_DEPLOY.md](file:///d:/Download/Snippo%20Booking/HOSTINGER_DEPLOY.md).
