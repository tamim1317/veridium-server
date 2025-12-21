Veridium | Corporate Asset Management System (Server)
Veridium is a robust B2B Asset Management platform built to help companies track equipment assignments, manage employee affiliations, and streamline the procurement workflow.

Live Links
Live API URL: https://your-vercel-link.vercel.app

Client Repository: https://github.com/your-username/veridium-client

🛠 Tech Stack
Environment: Node.js

Framework: Express.js

Database: MongoDB (Native Driver)

Security: JSON Web Tokens (JWT) & Role-Based Access Control (RBAC)

Payments: Stripe API

Tools: Dotenv, Cors, Mongodb

✨ Key Features
Role-Based Middlewares: Strict verifyToken and verifyHR gates to protect sensitive company data.

Dynamic Affiliation System: Automatically links employees to companies upon asset approval while enforcing package limits.

Server-Side Pagination: Efficiently handles large inventories using MongoDB .skip() and .limit() (10 items per page).

Stripe Integration: Seamless package upgrade workflow with immediate database updates to packageLimit.

Aggregation Analytics: Uses MongoDB aggregation pipelines to generate data for HR Dashboard charts (Pie & Bar charts).

🗄 Database Architecture
The system utilizes a multi-collection relational-style approach in MongoDB:

users: Stores HR profiles (with limits) and Employees.

assets: Main inventory with availability tracking.

requests: Tracks the lifecycle of asset requests.

affiliations: Maps employees to multiple companies.

⚙️ Environment Variables
Create a .env file in the root directory and add the following:

Code snippet

PORT=5000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_unique_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
📦 Local Installation
Clone the repository:

Bash

git clone https://github.com/your-username/veridium-server.git
Install dependencies:

Bash

npm install
Run the development server:

Bash

npm start