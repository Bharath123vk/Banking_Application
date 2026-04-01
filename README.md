# 🏦 Vault Bank - Full Stack Simulator

A professional-grade Banking Transaction Simulator built with **Spring Boot** and **React (Vite)**. This project features secure authentication, transfers, persistent data storage with MySQL (planned migration to PostgreSQL), and automated PDF report generation.

---

## 📁 Project Structure

- **`banking-simulator/`**: The Backend (Java, Spring Boot, Spring Security, JPA, iText7, Swagger).
- **`fintech-vision/`**: The Frontend (React, TypeScript, TailwindCSS, Recharts).
- **`reports/`**: Generated PDF Account Statements and Bank Summaries.

---

## 🚀 Getting Started

### 1. Backend (Spring Boot)
- Open the `banking-simulator` folder in IntelliJ IDEA or your preferred IDE.
- Ensure **Maven** dependencies are loaded (including `itextpdf`, `spring-security`, `springdoc-openapi`, and database connectors).
- Configure your local MySQL database in the `application.properties` or `application.yml` file.
- Run `BankingSimulatorApplication.java`.
- Server starts at: `http://localhost:8081` (Swagger UI available at `/swagger-ui.html`)

### 2. Frontend (React)
- Open the `fintech-vision` folder in VS Code.
- Run `npm install` to install dependencies.
- Run `npm run dev` to start the development server.
- Dashboard accessible at: `http://localhost:8080` (or `5173`)

---

## ✨ Key Features

- **Secure Authentication**: Implemented Spring Security with JWT (JSON Web Tokens) for safe registration, login, and protected routes.
- **Universal Transfers**: Send money to any account number (external or internal) with automated balance validation.
- **Persistent Storage**: Data is saved securely in a relational database (currently MySQL, with PostgreSQL planned for the future).
- **PDF Reporting**: Generate professional account statements and bank summaries using iText7.
- **API Documentation**: Fully documented and testable REST APIs via Swagger/OpenAPI.
- **Live Dashboard**: Visualized balance trends, transaction analytics, and paginated transaction history.
- **Account Management**: Activate/Deactivate accounts with real-time status updates and customized business rules.

---

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, MySQL Connector, iText7, Swagger/OpenAPI. *(Note: PostgreSQL integration is planned for future releases).*
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Shadcn/UI, Lucide Icons.

---
**Developed by Team 4 (Batch 13 from Infosys Virtual Internship 6.0)**