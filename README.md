# 🏦 Vault Bank - Full Stack Simulator

A professional-grade Banking Transaction Simulator built with **Spring Boot** and **React (Vite)**. This project features transfers, persistent data storage, and automated PDF report generation.

---

## 📁 Project Structure

- **`banking-simulator/`**: The Backend (Java, Spring Boot, JPA, iText7).
- **`fintech-vision/`**: The Frontend (React, TypeScript, TailwindCSS, Recharts).
- **`data/`**: Local database storage (H2 File-based).
- **`reports/`**: Generated PDF Account Statements and Bank Summaries.

---

## 🚀 Getting Started

### 1. Backend (Spring Boot)
- Open the `banking-simulator` folder in IntelliJ IDEA.
- Ensure **Maven** dependencies are loaded (specifically `itextpdf`).
- Run `BankingSimulatorApplication.java`.
- Server starts at: `http://localhost:8081`

### 2. Frontend (React)
- Open the `fintech-vision` folder in VS Code.
- Run `npm install` to install dependencies.
- Run `npm run dev` to start the development server.
- Dashboard accessible at: `http://localhost:8080` (or `5173`)

---

## ✨ Key Features

- **Universal Transfers**: Send money to any account number (external or internal).
- **Persistent Storage**: Data is saved to local files—no more losing accounts on restart.
- **PDF Reporting**: Generate professional account statements and bank summaries using iText7.
- **Live Dashboard**: Visualized balance trends and transaction analytics.
- **Account Management**: Activate/Deactivate accounts with real-time status updates.

---

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3, Spring Data JPA, H2 Database, iText7.
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Shadcn/UI, Lucide Icons.

---
**Developed by Team 4 (Batch 13 from Infosys Virtual Internship 6.0)**