# Midas Web Application - Frontend Integration Guide

## Overview

This guide enables frontend developers to seamlessly interact with the Midas backend APIs. It outlines the available API endpoints, data schemas, and configuration requirements to ensure smooth integration and functionality.

## Backend Services:
  - Backend server running at `http://localhost:4999`
  - Python FastAPI API running at `http://localhost:8000`

## API Endpoints

### Authentication

- **Register User**
  - **Endpoint:** `POST /api/register`
  - **Description:** Register a new user (admin or regular).
  - **Body:**
    ```json
    {
      "name": "User Name",
      "company": "Company Name",
      "email": "user@example.com",
      "password": "password123",
      "confirmPassword": "password123",
      "isAdmin": true,
      "joinCode": "A1B2C3D4" // Optional
    }
    ```
  - **Response:**
    ```json
    { "message": "User registered successfully" }
    ```

- **Login User**
  - **Endpoint:** `POST /api/login`
  - **Description:** Authenticate a user and start a session.
  - **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  - **Response:**
    ```json
    {
      "message": "Login successful!",
      "user": {
        "name": "User Name",
        "email": "user@example.com",
        "role": "user" // or "admin"
      }
    }
    ```

- **Get User Profile**
  - **Endpoint:** `GET /api/profile`
  - **Description:** Retrieve the authenticated user's profile.
  - **Authentication:** Session cookies required.
  - **Response:**
    ```json
    {
      "name": "User Name",
      "email": "user@example.com",
      "company": "Company Name",
      "role": "user" // or "admin"
    }
    ```

- **Logout User**
  - **Endpoint:** `POST /api/logout`
  - **Description:** Logout the authenticated user.
  - **Authentication:** Session cookies required.
  - **Response:**
    ```json
    { "message": "Logged out successfully" }
    ```

### Invite Codes

- **Generate Invite Code** *(Admin Only)*
  - **Endpoint:** `POST /api/admin/generate-code`
  - **Description:** Generate a unique invite code for new users.
  - **Authentication:** Admin session cookies required.
  - **Response:**
    ```json
    { "code": "A1B2C3D4" }
    ```

- **Get Users by Invite Codes** *(Admin Only)*
  - **Endpoint:** `GET /api/admin/users`
  - **Description:** Retrieve users associated with the admin's invite codes.
  - **Authentication:** Admin session cookies required.
  - **Response:**
    ```json
    {
      "users": [
        {
          "id": "user_id",
          "name": "User Name",
          "email": "user@example.com",
          "company": "Company Name",
          "joinCode": "A1B2C3D4",
          "createdAt": "2024-04-27T12:34:56.789Z"
        }
        // More users...
      ]
    }
    ```

- **Join Group**
  - **Endpoint:** `POST /api/join_group`
  - **Description:** Join a group using an invite code.
  - **Authentication:** Session cookies required.
  - **Body:**
    ```json
    { "group_code": "A1B2C3D4" }
    ```
  - **Response:**
    ```json
    { "message": "Successfully joined the group." }
    ```

### Reimbursements

- **Submit Reimbursement Request**
  - **Endpoint:** `POST /api/request_reimbursement`
  - **Description:** Submit a reimbursement request. Forwarded to the Python API for processing.
  - **Body:** `multipart/form-data`
    - `name` (String)
    - `email` (String)
    - `admin_email` (String)
    - `reimbursement_details` (String)
    - `receipt` (File) - `.docx` file
  - **Authentication:** User session cookies required.
  - **Response:**
    ```json
    {
      "status": "Approved", // or "Rejected"
      "feedback": "Your reimbursement request has been approved. [Summary text]"
    }
    ```

- **View Reimbursement Requests** *(Admin Only)*
  - **Endpoint:** `GET /api/admin/reimbursements`
  - **Description:** Retrieve all reimbursement requests associated with the admin.
  - **Authentication:** Admin session cookies required.
  - **Response:**
    ```json
    {
      "reimbursements": [
        {
          "_id": "603dcd9e1c4ae2b1c8e4f123",
          "userEmail": "joe@example.com",
          "adminEmail": "admin@example.com",
          "reimbursementDetails": "Conference travel expenses",
          "receiptPath": "uploads/1624476401234-receipt.docx",
          "status": "Approved",
          "feedback": "Your reimbursement request has been approved. [Summary text]",
          "createdAt": "2024-04-27T12:34:56.789Z",
          "__v": 0
        }
        // ... more reimbursement requests
      ]
    }
    ```

## Schema Structure

### User Schema

```javascript
const userSchema = new mongoose.Schema({
  name: String,
  company: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  joinCode: { type: String, default: null },
});
```

### InviteCode Schema

```javascript
const inviteCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  used: { type: Boolean, default: false },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days
});
```

### ReimbursementRequest Schema

```javascript
const reimbursementRequestSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  adminEmail: { type: String, required: true },
  reimbursementDetails: { type: String, required: true },
  receiptPath: { type: String, required: true },
  status: { type: String, enum: ['Approved', 'Rejected'], required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
```

## Environment Configuration

### `.env` Files

Create a `.env` file in both the `midas-backend` and `midas-api` directories with the following variables:

```env
# Common Variables
MONGODB_URI=mongodb+srv://<user>:<pass>@midasdb.lwujx.mongodb.net/?retryWrites=true&w=majority&appName=midasDB
EMAIL_USER=assistant@trymidas.ai
EMAIL_PASSWORD=midas123
SMTP_SERVER=mail.privateemail.com
SMTP_PORT=587

# Backend Specific
SESSION_SECRET=your_secret_key
PYTHON_API_URL=http://localhost:8000
PORT=4999

# API Specific
OPENAI_API_KEY=your_openai_key
```

- **Replace `<user>`, `<pass>`, and `your_openai_key`** with your actual MongoDB credentials and OpenAI API key.

## Running the Services

1. **Start Backend Server**
   - Navigate to the `midas-backend` directory:
     ```bash
     cd midas-backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the server:
     ```bash
     npm run dev
     ```
   - **Server URL:** `http://localhost:4999`

2. **Start Python FastAPI API**
   - Navigate to the `midas-api` directory:
     ```bash
     cd midas-api
     ```
   - Create and activate a virtual environment:
     ```bash
     # On Windows
     python -m venv venv
     venv\Scripts\activate

     # On macOS/Linux
     python3 -m venv venv
     source venv/bin/activate
     ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Start the API server:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port 8000 --reload
     ```
   - **API URL:** `http://localhost:8000`

## Schema Diagrams

### User

| Field       | Type     | Description                  |
|-------------|----------|------------------------------|
| name        | String   | User's full name             |
| company     | String   | Company name                 |
| email       | String   | User's email (unique)        |
| password    | String   | Hashed password              |
| role        | String   | `user` or `admin`            |
| joinCode    | String   | Associated invite code (optional) |

### InviteCode

| Field      | Type                                        | Description                                  |
|------------|---------------------------------------------|----------------------------------------------|
| code       | String                                      | Unique invite code                           |
| createdBy  | ObjectId (ref: User)                        | Admin who created the invite code            |
| used       | Boolean                                     | Indicates if the code has been used          |
| usedBy     | ObjectId (ref: User, optional)              | User who used the invite code                |
| createdAt  | Date                                        | Timestamp of code creation                   |
| expiresAt  | Date                                        | Expiration date (7 days from creation)       |

### ReimbursementRequest

| Field               | Type    | Description                          |
|---------------------|---------|--------------------------------------|
| userEmail           | String  | Email of the user requesting         |
| adminEmail          | String  | Email of the admin handling request  |
| reimbursementDetails| String  | Details of the reimbursement request |
| receiptPath         | String  | File path to the uploaded receipt    |
| status              | String  | `Approved` or `Rejected`             |
| feedback            | String  | Feedback on the reimbursement request|
| createdAt           | Date    | Timestamp of the request             |

## Notes

- Ensure all environment variables are correctly set in the `.env` files.
- The `uploads` directory is served statically for accessing receipt files.
- Only admins can generate invite codes and view associated users and reimbursement requests.
- Users can join a group using a valid invite code during registration or via the `/api/join_group` endpoint.

By following this concise guide, frontend developers can effectively integrate with the Midas backend APIs, ensuring proper authentication, data handling, and functionality.