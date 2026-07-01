# 🍽️ MyDinner – Digital Dining Suite

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google AI" />
</div>

<div align="center">
  <h3>Elevating Digital Dining through Modern Design and Smart Technology.</h3>
  <p>A modern, AMOLED-inspired dining experience platform offering seamless meal coordination, user interaction, and billing — all in one unified system. Built for elegance, responsiveness, and everyday convenience. Designed to deliver a refined digital dining experience that connects users and administrators effortlessly.</p>
</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Tech Stack](#-tech-stack)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [📁 Project Structure](#-project-structure)
- [📄 License](#-license)

---

## ✨ Features

### 👨‍💼 Admin Portal
- Mess Registration & Management
- Student Management
- Meal Menu Scheduling
- Billing & Payments
- Announcements
- Holiday Management
- Analytics Dashboard

### 👨‍🎓 Student Portal
- Dashboard Overview
- Leave Management
- Attendance Tracking
- Bill Viewing
- Notifications
- Mess Selection
- Settings Management

### 🤖 AI-Powered Features
- Smart Menu Suggestions
- Automated Notifications
- Predictive Analytics

### 🔐 Security & Authentication
- Role-Based Access Control
- Firebase Authentication
- Firestore Security Rules
- Real-time Data Sync

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) - Modern component library
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icon set

### Backend & Database
- **Backend-as-a-Service**: [Firebase](https://firebase.google.com/)
  - Authentication
  - Firestore NoSQL database
  - Security Rules
  - Hosting

### AI & Analytics
- **AI Framework**: [Genkit](https://genkit.dev/) - Google's generative AI toolkit
- **Charts**: [Recharts](https://recharts.org/) - Composable charting library

### Development Tools
- Package Manager: npm/yarn
- Build Tool: Next.js built-in
- Linting: ESLint
- Type Checking: TypeScript
- Version Control: Git

---

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Firebase project with Firestore enabled
- Google AI API key (for AI features)

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mydinner.git
   cd mydinner
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Copy your Firebase config to `.env.local`

5. **Configure Google AI**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to your `.env.local`

---

## 🚀 Usage

### Development
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### Admin Workflow
1. Sign Up/Login as Admin
2. Create Mess with unique join code
3. Manage Students - Approve registrations
4. Schedule Menus - Plan daily meals
5. Handle Billing - Generate and confirm payments
6. Send Announcements - Communicate with students

### Student Workflow
1. Sign Up with mess join code
2. View Dashboard - Check meals and attendance
3. Apply for Leave - Request time off
4. View Bills - Check payment status
5. Stay Updated - Read announcements

---

## 📁 Project Structure

```
mydinner/
├── src/
│   ├── ai/                    # AI integration (Genkit)
│   ├── app/                   # Next.js App Router
│   │   ├── admin/            # Admin portal pages
│   │   ├── auth/             # Authentication actions
│   │   ├── student/          # Student portal pages
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable UI components
│   │   ├── admin/           # Admin-specific components
│   │   ├── student/         # Student-specific components
│   │   ├── shared/          # Shared components
│   │   └── ui/              # Shadcn/ui components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   │   ├── actions/         # Server actions
│   │   ├── listeners/       # Firestore listeners
│   │   └── services/        # Business logic
│   └── types/               # TypeScript definitions
├── docs/                    # Documentation
├── public/                  # Static assets
├── firebase.json            # Firebase configuration
├── firestore.rules          # Database security rules
├── firestore.indexes.json   # Database indexes
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details...

---

<div align="center">
  <p><strong>Eat Smart, Live Better – Revolutionizing Meal Dining</strong></p>
</div>
