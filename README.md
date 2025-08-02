
QuickDesk is a modern, role-based helpdesk application that streamlines customer support operations. Built with React, TypeScript, and Firebase, it offers a seamless experience for end users, support agents, and administrators.

## 🌟 Features

### 🎯 Role-Based Access Control
- **End Users**: Submit and track support tickets
- **Agents**: Manage and resolve tickets, communicate with users
- **Admins**: Full system control and user management

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark/Light theme support
- Intuitive navigation and clean interface
- Built with Radix UI and TailwindCSS

### 🔐 Authentication & Security
- Email/Password authentication
- Secure session management
- Role-based route protection
- Environment-based configuration

### 🎫 Ticket Management
- Create, view, and update tickets
- Real-time status updates
- Rich text support for ticket descriptions
- File attachments

### 🔔 Notifications
- Real-time updates
- In-app notifications
- Email alerts (configurable)

### 📊 Admin Dashboard
- User management
- Analytics and reporting
- System configuration
- Audit logs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quickdesk.git
   cd quickdesk
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Set up Firestore Database
   - Create a web app in Firebase Console

4. **Configure environment variables**
   Copy `.env.example` to `.env` and update with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 📂 Project Structure

```
quickdesk/
├── public/              # Static files
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable UI components
│   ├── config/          # App configuration
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Helper functions
│   ├── App.tsx          # Main App component
│   └── main.tsx         # App entry point
├── .env.example        # Example environment variables
├── .eslintrc.js        # ESLint configuration
├── .gitignore          # Git ignore file
├── package.json        # Project dependencies
├── tailwind.config.js  # TailwindCSS configuration
└── tsconfig.json      # TypeScript configuration
```
## 📸 Sample UI Images
![Screenshot_2-8-2025_17240_localhost](https://github.com/user-attachments/assets/3fd0cae5-95dc-4b97-8463-08330e039125)
![Screenshot_2-8-2025_17622_localhost](https://github.com/user-attachments/assets/3c7fb168-39a1-4c0f-99c1-6030834ccc86)
![Screenshot_2-8-2025_17659_localhost](https://github.com/user-attachments/assets/22aac9ac-4832-420f-9a53-66abb1b48b31)
![Screenshot_2-8-2025_17721_localhost](https://github.com/user-attachments/assets/bde9142a-e9e9-435d-8b68-21ae35aa16d3)
![Screenshot_2-8-2025_17739_localhost](https://github.com/user-attachments/assets/0a821f75-8df2-4629-b3cf-39254049c2ce)
![Screenshot_2-8-2025_17757_localhost](https://github.com/user-attachments/assets/ef1b11b5-4fc6-42b6-9f12-a7377cbeeb64)
![Screenshot_2-8-2025_17117_localhost](https://github.com/user-attachments/assets/da787ca6-f7cc-4e46-8728-dc5407c4a2f6)
![Screenshot_2-8-2025_171217_localhost](https://github.com/user-attachments/assets/098d2e49-62ce-40c0-9d87-8da8a6df6bd8)


## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the amazing build tool
- [React](https://reactjs.org/) for the UI library
- [Firebase](https://firebase.google.com/) for backend services
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [TailwindCSS](https://tailwindcss.com/) for styling
