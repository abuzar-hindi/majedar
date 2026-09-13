# Majedaar Restaurant Backend

This directory is a comment-only production-oriented scaffold for a Node.js and Express backend using MongoDB and Mongoose. No server, route, controller, model, authentication, payment, upload, notification, or API implementation is included.

## Architecture

Requests will eventually follow **routes -> controllers -> services -> models -> MongoDB**. Controllers should remain thin: they will validate input, call services, and format responses. Services will contain business rules, while models will define persistence concerns.

## Planned boundaries

- `src/config/` will centralize environment, database, and Cloudinary configuration.
- `src/models/` will represent administrators, customers, menu data, orders, bookings, payments, messages, and reviews.
- `src/controllers/` and `src/routes/` will expose customer and admin HTTP workflows.
- `src/services/` will contain authentication, ordering, bookings, payments, menu, notifications, and uploads logic.
- `src/middleware/` and `src/validators/` will provide authentication, authorization, validation, sanitization, rate limiting, CORS/security integration, and error boundaries.
- `src/utils/` will standardize responses, errors, pagination, order numbers, and safe logging.
- `tests/` contains feature areas where implementation tests can be researched and added later.

Security decisions such as password hashing, secure cookies or tokens, environment-variable validation, secure headers, CORS policy, payment signature and webhook verification, and centralized error handling are intentionally documented but not implemented.
