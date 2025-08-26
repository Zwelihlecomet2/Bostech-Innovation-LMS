# Bostech Training - Online Examination System

A comprehensive, secure, and professional online quiz/examination platform built with React, TypeScript, and Tailwind CSS. Perfect for educational institutions, corporate training, and professional certifications.

![Bostech Training](https://img.shields.io/badge/Bostech-Training-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-blue?style=flat-square&logo=tailwindcss)

## 🌟 Features

### 👨‍💼 Admin Features
- **User Management**: Create, edit, and manage user accounts
- **Test Creation**: Build comprehensive tests with multiple-choice questions
- **Analytics Dashboard**: View detailed performance analytics and statistics
- **PDF Reports**: Generate professional test result reports
- **Security Controls**: Account activation/deactivation and access management

### 👨‍🎓 User Features
- **Interactive Test Taking**: Clean, intuitive test interface with real-time timer
- **Progress Tracking**: Visual progress indicators and question navigation
- **Result Analytics**: Detailed performance analysis and score tracking
- **Attempt Management**: Maximum 2 attempts per test with clear attempt tracking
- **Professional Reports**: Download detailed PDF certificates and results

### 🔒 Security Features
- **Account Lockout**: Automatic deactivation after 3 failed login attempts
- **Admin-Controlled Registration**: Only administrators can create user accounts
- **Session Management**: Secure authentication and session handling
- **Data Persistence**: Local storage with state management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bostech-training-quiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 🏗️ Tech Stack

### Frontend
- **React 18.2.0** - Modern React with hooks and functional components
- **TypeScript 5.3.3** - Type-safe development
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Vite 5.1.4** - Fast build tool and development server

### Key Libraries
- **Lucide React** - Beautiful, customizable icons
- **jsPDF** - Client-side PDF generation
- **jsPDF AutoTable** - Table generation for PDF reports

### Development Tools
- **ESLint** - Code linting and quality
- **TypeScript ESLint** - TypeScript-specific linting rules
- **PostCSS & Autoprefixer** - CSS processing

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/              # Admin-specific components
│   │   ├── AdminDashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── TestManagement.tsx
│   │   ├── TestForm.tsx
│   │   ├── UserForm.tsx
│   │   └── ResultsAnalytics.tsx
│   ├── user/               # User-specific components
│   │   ├── UserDashboard.tsx
│   │   ├── TakeTest.tsx
│   │   └── TestResults.tsx
│   ├── LandingPage.tsx     # Marketing/landing page
│   ├── Login.tsx           # Authentication component
│   └── Layout.tsx          # Main layout wrapper
├── context/
│   └── AppContext.tsx      # Global state management
├── types/
│   └── index.ts            # TypeScript type definitions
├── assets/                 # Static assets
└── main.tsx               # Application entry point
```

## 🎯 Usage Guide

### For Administrators

1. **Login** with admin credentials
2. **Create Users**: Navigate to User Management to add new users
3. **Create Tests**: Use Test Management to build comprehensive tests
4. **Monitor Results**: View analytics and generate PDF reports
5. **Manage Access**: Activate/deactivate users and tests as needed

### For Users

1. **Login** with provided credentials
2. **Browse Tests**: View available active tests
3. **Take Tests**: Complete tests within the time limit
4. **View Results**: Check scores and download certificates
5. **Track Progress**: Monitor performance across multiple attempts

## 🔧 Configuration

### Environment Setup
The application uses local storage for data persistence. No external database setup required for development.

### Customization
- **Branding**: Update logo and colors in the components
- **Styling**: Modify Tailwind classes for custom appearance
- **Features**: Extend functionality through the modular component structure

## 📊 Key Metrics

- **Security**: 3-attempt login limit with account lockout
- **Performance**: Real-time timer with auto-submission
- **Usability**: Maximum 2 attempts per test
- **Analytics**: Comprehensive scoring and time tracking
- **Reporting**: Professional PDF generation with detailed analysis

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Comprehensive linting rules
- **Component Architecture**: Modular, reusable components
- **State Management**: Centralized with React Context

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🎉 Acknowledgments

- Built with modern React and TypeScript best practices
- Designed for professional educational and corporate environments
- Focused on security, usability, and comprehensive analytics

---

**Bostech Training** - Empowering organizations with secure, reliable, and comprehensive online examination capabilities.