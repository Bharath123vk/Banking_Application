# 🏦 Vault Bank - Project Documentation

## 1. Problem Statement
The financial technology sector demands robust, secure, and user-friendly platforms for managing core banking operations. Existing legacy systems often lack intuitive interfaces, real-time analytics, and modern security protocols. Overhauling these systems without disrupting services is a major challenge for many institutions. Our project, **Vault Bank**, addresses this by providing a modernized, secure, and easily scalable digital banking simulator that demonstrates comprehensive banking operations (account management, complex transactions, PDF reporting) efficiently. It serves as a proof-of-concept for migrating from monolithic/legacy architectures to a decoupled, cloud-ready modern stack.

## 2. Abstraction
Vault Bank is a comprehensive Full Stack Banking Simulator divided into a decoupled client-server architecture. The backend (**banking-simulator**) acts as a centralized RESTful API gateway, built with Java and Spring Boot. It securely manages business logic, validations, user session state (via stateless JWTs), and persistent interactions with a PostgreSQL database. The frontend (**fintech-vision**), built using React, TypeScript, and Vite, acts as a highly interactive, responsive client. It interfaces with the backend services to present real-time dashboards, transaction processing forms, and account overviews to the user seamlessly, while utilizing modern data-fetching constraints (TanStack Query) to maintain synchronization with the backend.

## 3. Requirements

**Functional Requirements:**
- **User Management**: Secure user registration, authentication, and customized profile management.
- **Account Management**: Ability to create and manage multifaceted accounts, check real-time balances, and enforce custom business constraints (e.g., overdraft limits).
- **Transaction Processing**: Secure capabilities for making deposits, performing withdrawals, and transferring funds (internal and external) with strict ACID compliance.
- **Transaction History**: Comprehensive, viewable transaction history supported by pagination.
- **Reporting Features**: Real-time generation and export of verifiable account statements and reports in PDF format.
- **Notifications**: Email notifications for key alerts like low balances or account activities.

**Non-Functional Requirements:**
- **Security:** Implementation of enterprise-grade security utilizing Spring Security and standard JWT implementation for all stateful business operations.
- **Data Persistence:** Highly resilient and structured storage via PostgreSQL.
- **API Documentation:** Well-maintained Swagger/OpenAPI documentation (`springdoc-openapi`) exposing clear interaction contracts for consumers.
- **Performance & Usability:** Application must support fast loading via Vite bundler, responsive styling via TailwindCSS, and accessible interactions using Shadcn UI.
- **Maintenance & Scalability:** A modular feature-based architecture that is cloud-ready and straightforward to test/deploy.

## 4. System Design & Architecture

- **Frontend Application (Client Layer):** A React 18 single-page application (`fintech-vision`) bootstrapped with Vite. It incorporates Recharts for data visualization, React Hook Form/Zod for client-side validation, and Shadcn UI components for a premium interaction experience.
- **Backend Application (Server Layer):** A Spring Boot 3.5 application (`banking-simulator`) that exposes standard RESTful endpoints.
- **Security Layer:** Intercepts requests through specialized Spring Security filters to validate JWT signature and extract authorization claims before granting access to protected routes.
- **Service Layer (`@Service`):** Contains the core orchestration for domain logic—managing users, orchestrating inter-account transfers securely, processing transactions, and generating email alerts.
- **Data Access Layer (`@Repository`):** Uses Spring Data JPA (Hibernate) to interface programmatically with the database using object-relational mapping (ORM) techniques.
- **Database Layer (Storage):** A relational **PostgreSQL** database maintaining constrained tables (e.g., `Users`, `Accounts`, `Transactions`), ensuring data integrity and allowing for complex analytical querying.
