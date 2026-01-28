# MithilaCab: Your Ride-Hailing App for Mithilanchal

MithilaCab is a modern, feature-rich ride-hailing application built with Next.js and Firebase. It's designed to provide a seamless transportation experience for both passengers and drivers, with a special focus on the cultural context of the Mithila region.

[![MithilaCab Screenshot](https://picsum.photos/seed/mithilahero/1200/600.jpg)](https://picsum.photos/seed/mithilahero/1200/600.jpg)

## ✨ Key Features

### For Passengers:
- **Easy Booking:** Intuitive interface to book rides quickly.
- **Ride Options:** Choose from various ride types like Share, Standard, Premium, and SUV.
- **Real-time Tracking:** Track your driver's location in real-time.
- **Fare Estimation:** Get a fare estimate before confirming your ride.
- **Event Pooling:** Join shared rides to common destinations for events like weddings and festivals.
- **Local Offers:** Discover and book rides to local businesses with promotional deals.
- **Safety Features:** SOS button, ride tracking, and 24/7 support.
- **Wallet & Payments:** In-app wallet with transaction history and multiple payment options.
- **Ride History:** View details of all your past rides.
- **Rewards & Achievements:** Earn badges for milestones like taking shared rides.

### For Drivers:
- **Driver Dashboard:** Go online/offline, view available rides, and manage current trips.
- **Wellness Check:** A pre-drive check to ensure driver well-being.
- **Earnings & Performance:** Track earnings, view ride history, and monitor performance ratings.
- **Training Center:** Access modules to improve service and maximize earnings.
- **Document Management:** Upload and manage required documents directly in the app.

### For Admins:
- **Comprehensive Dashboard:** At-a-glance view of key platform metrics (revenue, rides, users, drivers).
- **User & Driver Management:** View profiles, suspend/un-suspend accounts, and manage details.
- **Verification Queue:** Approve or reject new driver applications.
- **Ride Monitoring:** A real-time overview of all rides on the platform.
- **Financial Management:** View financial reports, manage incentives, and process refunds.
- **Offer Management:** Create and manage promotional offers from local partners.
- **Notification Manager:** Send system-wide notifications to all users.

## 🤖 AI-Powered Features

- **Fare Prediction:** An AI agent that analyzes ride requests and suggests the best time to book for cheaper fares based on historical data patterns.
- **Carbon Footprint Tracking:** The system calculates and displays the estimated CO₂ saved when a user chooses a "Share" ride, promoting eco-friendly choices.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **UI:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Generative AI:** [Google's Genkit](https://firebase.google.com/docs/genkit)
- **Deployment:** Firebase App Hosting

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Firebase:**
    - This project is configured to work with Firebase. You will need to have a `firebaseConfig` object in `src/firebase/config.ts`.
    - The security rules are defined in `firestore.rules`.

4. **Environment Variables**
    - Create a `.env.local` file in the root directory for any environment-specific variables.

### Running the Development Server

To run the app in development mode, use the following command:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

The application has a separate process for running Genkit flows during development. Use this command in a separate terminal:

```bash
npm run genkit:watch
```

## 📁 Folder Structure

-   `src/app/`: Contains all the application routes, including the main landing page, user/driver/admin dashboards, and profile pages.
    -   `src/app/admin/`: Admin-only pages and components.
    -   `src/app/driver/`: Driver-specific pages and components.
    -   `src/app/profile/`: User profile management pages.
-   `src/components/`: Shared UI components used across the application.
    -   `src/components/auth/`: Components for login, signup, and OTP.
    -   `src/components/ride/`: Components related to the ride booking and tracking flow.
-   `src/firebase/`: Firebase configuration, providers, and custom hooks.
-   `src/ai/`: Contains Genkit flows for AI-powered features.
-   `src/lib/`: Utility functions and data type definitions.
-   `docs/`: Contains the backend data schema (`backend.json`).

## 🔑 Admin Credentials

To access the admin dashboard, you can use the super admin email defined in the `firestore.rules` file.

- **Email:** `mithila@cabadmingmail.com`

You can also create new staff members with specific roles and permissions directly from the "Manage Staff" section in the admin dashboard.

## ☁️ Deployment

This application is configured for easy deployment with [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). Connect your repository to a Firebase project to enable continuous deployment.
