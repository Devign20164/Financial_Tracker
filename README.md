# Finance Tracker

A modern, full-featured personal finance management application built with React and TypeScript. Track your income, expenses, accounts, and credit cards with real-time updates and beautiful analytics.

## Features

### 💰 Financial Management
- **Income & Expense Tracking**: Add and categorize your income and expenses with detailed descriptions
- **Multiple Account Types**: Support for bank accounts, cash, digital wallets, and credit cards
- **Credit Card Management**: Track credit limits, statement dates, and payment due dates
- **Real-time Updates**: Automatic synchronization across all devices using Supabase Realtime

### 📊 Analytics & Insights
- **Spending Analysis**: Visual breakdown of expenses by category
- **Income vs Expenses Chart**: Compare your income and expenses over time
- **Total Balance Overview**: Quick view of your financial status across all accounts
- **Transaction History**: Complete transaction log with search and filtering

### 🔐 Security
- **Secure Authentication**: Email/password authentication via Supabase
- **SQL Injection Protection**: Input validation and sanitization
- **Protected Routes**: Secure access to authenticated pages only
- **Password Management**: Change password functionality with visibility toggles

### 🎨 User Experience
- **Responsive Design**: Optimized for both mobile and desktop views
- **Modern UI**: Beautiful gradient designs with dark mode support
- **Currency Formatting**: Automatic PHP (₱) currency formatting with thousand separators
- **Confirmation Dialogs**: Styled confirmation dialogs for edits and deletions
- **Toast Notifications**: User-friendly success and error notifications

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend & Services
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Realtime subscriptions
- **Vercel** - Deployment platform

### State Management
- **React Context API** - Global state (authentication)
- **Custom Hooks** - Data fetching and state management
- **TanStack Query** - Server state management

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Supabase account and project


## Security Features

- SQL injection pattern detection on login/signup
- Protected routes with authentication checks
- Secure password handling with visibility toggles
- Row-level security policies in Supabase (recommended)

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

© 2025 All rights reserved

## Version

Finance Tracker v1.0.0
