# Architecture Notes

This application is intentionally split into a `client` and `server` folder so a beginner developer can understand where UI code ends and API logic begins.

## Backend responsibilities

- Store business data with Prisma models
- Validate and process invoice calculations
- Issue JWT tokens during login
- Generate printable invoice PDFs
- Provide dashboard and reporting endpoints

## Frontend responsibilities

- Show the business dashboard
- Let staff create and update business records
- Provide a live invoice preview
- Surface due dates, overdue invoices, and upcoming cheques clearly

