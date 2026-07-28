# Booking System API

A scalable RESTful booking system backend built with **Node.js**, **Express.js**, **PostgreSQL**, **Sequelize**, **Redis**, and **BullMQ**.

The system allows mentors to define their weekly availability, users to book appointments, and processes bookings safely using database transactions to prevent double-booking. It also includes an asynchronous email notification system powered by BullMQ.

---

# Features

- User authentication
- Mentor availability management
- Booking creation and cancellation
- Weekly mentor schedules
- Schedule exception management (holidays, vacations, etc.)
- Transaction-safe booking process to prevent race conditions
- Asynchronous email notification system using BullMQ and Redis
- RESTful API
- Swagger API documentation

---

# Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- Redis
- BullMQ
- JWT Authentication
- Swagger (OpenAPI)

---

# Getting Started

## Prerequisites

Before running the project, make sure you have installed:

- Node.js (LTS recommended)
- PostgreSQL
- Redis
- npm or Yarn (Yarn recommended)

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd booking-system-api
```

### 2. Copy the environment file

```bash
cp .env.example .env
```

### 3. Configure environment variables

Open the `.env` file and update it with your own database credentials and other required configuration values.

### 4. Install dependencies

Using Yarn (recommended):

```bash
yarn
```

Or using npm:

```bash
npm install
```

### 5. Run database migrations

```bash
yarn migrate
```

### 6. Start the API server

Development mode:

```bash
yarn dev
```

Production mode:

```bash
yarn build
yarn start
```

### 7. Start the background worker

Development:

```bash
yarn worker:dev
```

Production:

```bash
yarn worker
```

### 8. API Documentation

Swagger documentation is available after starting the application:

```
http://localhost:<PORT>/api-docs
```

Replace `<PORT>` with the port configured in your `.env` file.

---

# Background Jobs

The project uses **BullMQ** with **Redis** to process asynchronous tasks.

After a booking is successfully created and the database transaction is committed, the API publishes an email notification job to the queue instead of sending emails during the HTTP request.

A dedicated worker consumes these jobs and sends notification emails to:

- The mentor
- The user

Using a job queue provides several advantages:

- Faster API response times
- Automatic retries for failed jobs
- Better scalability through multiple workers
- Separation of API and background processing
- Improved reliability

---

# Project Structure

```text
src/
├── config/
├── controllers/
├── handlers/
├── jobs/
├── middlewares/
├── migrations/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
├── validators/
├── workers/
└── app.js
```

---

# Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start the API server in development mode |
| `yarn build` | Build the application |
| `yarn start` | Start the API server in production mode |
| `yarn worker:dev` | Start the BullMQ worker in development mode |
| `yarn worker` | Start the BullMQ worker in production mode |
| `yarn migrate` | Run database migrations |
| `yarn test` | Run tests |

---

# API Documentation

Interactive API documentation is available via Swagger:

```
/api-docs
```

Once the application is running, visit:

```
http://localhost:<PORT>/api-docs
```

---

# Concurrency & Data Integrity

The booking process is designed to handle concurrent requests safely.

To prevent double-booking, booking creation is wrapped in a database transaction. The system validates slot availability and commits the booking atomically, ensuring that only one request can reserve a given time slot.

---

# Limitations & Future Improvements

## What limitations does the current implementation have?

Although the project demonstrates the core functionality of a booking system, there are several limitations:

- Authentication APIs are protected with IP-based rate limiting only. While this helps mitigate brute-force attacks, production systems should also implement CAPTCHA (e.g. Google reCAPTCHA or Cloudflare Turnstile) on sensitive endpoints such as login and registration.
- Holiday management is manual. Mentors or administrators can define unavailable dates using the `mentorExceptions` table, but the system does not automatically recognize public holidays or regional events.
- The project currently exposes APIs for end users only. Dedicated Mentor and Admin APIs are not included.

---

## How can the implementation be improved for an Enterprise environment?

Several enhancements could make the system more suitable for enterprise-scale deployments:

- Add CAPTCHA protection to authentication endpoints.
- Integrate with third-party holiday/calendar providers to automatically block public holidays or organization-wide non-working days.
- Implement dedicated Mentor and Admin dashboards and APIs with role-based access control (RBAC).
- Add centralized logging and monitoring using tools such as ELK, Grafana, or Datadog.
- Introduce distributed tracing and observability (OpenTelemetry).
- Improve deployment using Kubernetes with horizontal auto-scaling.
- Add CI/CD pipelines with automated testing and deployment.

---

## What real-world challenges are not implemented?

Some real-world scenarios are intentionally outside the scope of this project:

- Automatic detection of national and regional holidays.
- Time zone management for mentors and users in different countries.
- Calendar synchronization with services such as Google Calendar or Microsoft Outlook.
- Email delivery tracking, bounce handling, and webhook processing.
- Automatic reminder notifications before appointments.
- Booking rescheduling workflows.
- Audit logs for administrative actions.

---

## What new features would you suggest?

Potential future enhancements include:

- Mentor and Admin APIs.
- Video meeting integration (Zoom, Google Meet, Microsoft Teams).
- Calendar synchronization.
- SMS and push notifications.
- Appointment reminder emails and notifications.
- Recurring bookings.
- User reviews and mentor ratings.
- Waitlists for fully booked schedules.
- Advanced search and filtering for mentors.
- Analytics dashboard for mentors and administrators.
