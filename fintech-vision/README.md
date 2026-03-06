```markdown
# 🎨 Vault Bank - Frontend (Fintech Vision)

This is the React-based banking dashboard for the Vault Bank Simulator. It provides a real-time interface for account management, transaction tracking, and financial reporting.

---

## 🛠️ Tech Stack
- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [npm](https://www.npmjs.com/)

### Setup Instructions
1. Navigate to the directory:
   ```sh
   cd fintech-vision
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

The app will typically be available at `http://localhost:8080` (configured in `vite.config.ts`).

---

## 📜 Scripts
- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run preview` – Preview production build

---

## 🏗️ Key Modules
- **`src/pages/Dashboard.tsx`**: Main overview with balance charts and account status.
- **`src/pages/Payments.tsx`**: Unified interface for Deposits, Withdrawals, and Transfers.
- **`src/pages/Reports.tsx`**: Hub for generating and downloading PDF statements.
- **`src/lib/api.ts`**: Centralized Axios/Fetch configuration for backend communication.

---

## 🔗 API Integration
The frontend communicates with the Spring Boot backend at `http://localhost:8081/api`.  
⚠️ Ensure the backend is running before performing transactions.
---
```
