# DNS Manager

## Purpose

Develop a web application to provide a central dashboard for automating management of domains and DNS records in bulk on AWS Route 53.

## Task Details

### Setup

- Standardizing on MERN stack for frontend, backend, and infrastructure layers while keeping the modular design.
- Ensure access to AWS Route 53.

### Frontend Development

- Create a simple dashboard to upload/view domains and DNS records in a table format.
- Implement adding, editing, and deleting DNS record entries for domains.
- Include search options for easy bulk data navigation.
- Implement pagination in records table.
- Integrate JSON file upload for updating DNS records.

### Types of DNS Records

1. A (Address) Record
2. AAAA (IPv6 Address) Record
3. CNAME (Canonical Name) Record
4. MX (Mail Exchange) Record
5. NS (Name Server) Record
6. PTR (Pointer) Record
7. SOA (Start of Authority) Record
8. SRV (Service) Record
9. TXT (Text) Record
10. DNSSEC

### Backend Integration

- Establish backend API endpoints connecting the UI to the DNS system on AWS Route 53.
- Implement API calls for CRUD operations on DNS records.

## Getting Started

### Frontend

1. Navigate to the frontend directory: `cd frontend`.
2. Install dependencies: `npm install`.
3. Start the development server: `npm start`.

### Backend

1. Navigate to the backend directory: `cd backend`.
2. Install dependencies: `npm install`.
3. Start the server: `node server.js`.

## Usage

1. Access the DNS Manager dashboard through the provided URL.
2. Add and view DNS records.
3. Utilize forms/modals for adding, editing, and deleting records.
4. Use search options, pagination, and JSON file upload for efficient management.


## link to hosted site: https://dns-manager-project-s64i.onrender.com/
