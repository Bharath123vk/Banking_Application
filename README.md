# 🏦 Vault Bank - Full Stack Simulator

A professional-grade Banking Transaction Simulator built with **Spring Boot** and **React (Vite)**. This project provides a robust, modern banking experience featuring secure JWT authentication, diverse transaction processing, persistent data storage with **PostgreSQL**, and automated PDF report generation.

---

## 📁 Project Structure

- **`banking-simulator/`**: The Backend (Java 17, Spring Boot, Spring Security JWT, Spring Data JPA, iText7, Swagger/OpenAPI).
- **`fintech-vision/`**: The Frontend (React 18, TypeScript, Vite, TailwindCSS, Shadcn/UI, Recharts).
- **`reports/`**: Generated PDF Account Statements and Bank Summaries.

---

## 🚀 Getting Started

### 1. Backend (Spring Boot)
- Open the `banking-simulator` folder in IntelliJ IDEA or your preferred IDE.
- Ensure **Maven** dependencies are loaded.
- Configure your local **PostgreSQL** database in the `application.properties` file (default port `5432`).
- Build and run `BankingSimulatorApplication.java`.
- Server starts at: `http://localhost:8081` 
- API Documentation (Swagger UI) available at: `http://localhost:8081/swagger-ui.html`

### 2. Frontend (React)
- Open the `fintech-vision` folder in VS Code or your preferred editor.
- Run `npm install` to install all dependencies.
- Run `npm run dev` to start the development server.
- The dashboard is accessible at: `http://localhost:8080` (or `http://localhost:5173` depending on Vite binding).

---

## ✨ Key Features

- **Secure Authentication**: Robust Spring Security configuration using JWT (JSON Web Tokens) for safe user registration, login, and secured API endpoints.
- **Comprehensive Flow of Accounts**: Users can hold and manage multiple accounts with different types and customized profiles. 
- **Universal Transactions & Transfers**: Seamlessly process deposits, withdrawals, and money transfers to external/internal accounts with automated balance validations.
- **Persistent Relational Storage**: Data is saved securely in a robust **PostgreSQL** database managed by Spring Data JPA.
- **Reporting & Notifications**: Generate professional account statements in PDF format using iText7, and stay alerted via email notifications.
- **Live Dashboard Analytics**: Visually track balance trends, transaction analytics using Recharts, and review paginated transaction history.
- **Modern User Interface**: A responsive, accessible, and highly interactive UI built with Shadcn components, TailwindCSS, and TanStack React Query.

---

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, PostgreSQL Driver, JavaMailSender, iText7 (PDF), Swagger/OpenAPI.
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, React Hook Form, Zod, Shadcn/UI, TailwindCSS, Lucide Icons, Recharts, Embla Carousel.

---
**Developed by Team 4 (Batch 13 from Infosys Virtual Internship 6.0)**