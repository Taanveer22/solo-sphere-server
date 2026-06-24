# Solo Sphere Server

**Solo Sphere Server** is the backend service powering Solo Sphere, a freelance marketplace platform that connects buyers seeking talent with freelancers ready to bid on projects. It provides a secure, scalable REST API for job management, bidding, and authentication, built with Node.js, Express, and MongoDB.

## Key Features

- **Job Management**
  - Full CRUD operations for jobs posted by buyers
  - Retrieve all jobs or a single job by ID
  - Advanced query support for filtering jobs by category and other criteria
  - Sorting capabilities (e.g. by deadline)
  - Keyword-based search functionality
  - Server-side pagination using `skip` and `limit` operators

- **Bidding System**
  - Freelancers can submit bids on available jobs
  - Retrieve bids associated with a freelancer's account
  - Retrieve incoming bid requests for a buyer's posted jobs
  - Update bid request status (accept or reject)
  - Remove a submitted bid
  - Built-in safeguard to prevent duplicate bids on the same job

- **Authentication & Security**
  - Stateless authentication using JSON Web Tokens (JWT)
  - Secure login flow issuing a JWT via an httpOnly cookie
  - Logout flow that safely clears the authentication token
  - Custom middleware to verify and protect private routes

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Token (JWT)
- **Other:** cookie-parser, cors, dotenv

## Getting Started

### Prerequisites

- Node.js installed
- A MongoDB database (local or Atlas)

### Installation

```bash
git clone https://github.com/Taanveer22/solo-sphere-server.git
cd solo-sphere-server
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=5000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
ACCESS_TOKEN_SECRET=your_jwt_secret
NODE_ENV=development
```

### Run the Server

```bash
npm run start
```

The server will run on `http://localhost:5000` (or your configured port).

## Project Structure

The server follows a modular structure with a clear separation between routes, middleware, and database logic, making the codebase easy to maintain, test, and extend.

## Deployment

This server is configured and optimized for deployment on **Render**, with environment-based configuration and CORS properly set up to enable secure communication with the client application.

## Author

**Taanveer22**
[GitHub Profile](https://github.com/Taanveer22)

## License

This project is open source and intended for educational and portfolio purposes.
