# DevPulse — Assignment Requirements Specification

## Project Overview
**DevPulse** is a collaborative platform for software teams to:
- report bugs
- suggest features
- coordinate resolutions through a simple issue workflow

## Live URL
https://b7-a2-juwel.vercel.app/

## Features
- **User authentication** using **JWT** (access token in `Authorization` header)
- **Role-based access control**:
  - **contributor**: create and update own open issues, view all issues
  - **maintainer**: update any issue, delete issues, change workflow status
- **Issue management**:
  - create issues (bug / feature request)
  - list issues with filtering (type/status) and sorting (newest/oldest)
  - get single issue by id
  - update issue (title/description/type) with permission checks
  - delete issue (maintainer only)
- **Security & validations**:
  - password hashing with bcrypt
  - JWT verification with expiry
  - protected endpoints reject missing/invalid tokens
  - clear success/error response structure

## Tech Stack
- **Node.js** (LTS; 24.x+)
- **TypeScript** (latest non-beta)
- **Express.js** (modular router architecture)
- **PostgreSQL** (native `pg` driver only)
- **Raw SQL** (`pool.query()` only; no query builders / ORMs / SQL JOIN usage)
- **bcrypt** (hashing + compare)
- **jsonwebtoken** (JWT generation & verification)

## User Roles & Permissions
| Role | Allowed Actions |
|---|---|
| contributor | Register and log in • Create new issues • View all issues • Update own issue field |
| maintainer | All contributor permissions • Update any issue field • Delete any issue • Change issue workflow status independently |

## Authentication & Authorization
**JWT Flow**
1. Client sends credentials (email + password)
2. Server validates credentials and compares hashed password
3. Server returns a signed JWT
4. Client attaches token to header: `Authorization: <token>`
5. Server verifies token signature & expiry before processing protected endpoints

**Security Rules**
- Passwords are **never** returned or logged
- Protected endpoints require a valid JWT
- Role verification happens before privileged operations

## Database Schema Summary
### Table: `users`
| Field | Requirement |
|---|---|
| `id` | Auto-incrementing unique identifier |
| `name` | Full display name (required) |
| `email` | Unique login email (required) |
| `password` | Encrypted string (required; never returned) |
| `role` | `contributor` or `maintainer` (default: `contributor`) |
| `created_at` | Timestamp set on insert |
| `updated_at` | Timestamp set on update |

### Table: `issues`
| Field | Requirement |
|---|---|
| `id` | Auto-incrementing unique identifier |
| `title` | Required; max **150** characters |
| `description` | Required; minimum **20** characters |
| `type` | `bug` or `feature_request` |
| `status` | Workflow state; default `open`; one of `open`, `in_progress`, `resolved` |
| `reporter_id` | References user who submitted the issue (validated in application logic) |
| `created_at` | Timestamp set on insert |
| `updated_at` | Timestamp set on update |

## Setup Steps
1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create environment variables**
   - Add a `.env` file with at least:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `JWT_EXPIRES_IN` (optional; default is `1h`)
4. **Run database initialization**
   - The server calls `initDB()` at startup to create tables if they don’t exist.
5. **Start the server**
   ```bash
   npm run dev
   ```

## API Endpoint List
### 1) Authentication Module
#### 1.1 User Registration
- **Access:** Public
- **POST** `/api/auth/signup`

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**Success (201)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

#### 1.2 User Login
- **Access:** Public
- **POST** `/api/auth/login`

**Request Body**
```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

**Success (200)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
}
```

**JWT Payload Hint**
Include `{ id, name, role }` in the token payload so later authorization can identify the requester.

---

### 2) Issues Module
#### 2.1 Create Issue
- **Access:** Authenticated users (**contributor**, **maintainer**)
- **POST** `/api/issues`
- **Header:** `Authorization: <JWT_TOKEN>`

**Request Body**
```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

**Success (201)**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

**Note**
`reporter_id` must be taken from the decoded JWT (`req.user.id`), not from the request body.

#### 2.2 Get All Issues
- **Access:** Public
- **GET** `/api/issues?sort=newest`

**Query Parameters**
- `sort`: `newest` | `oldest` (default: `newest`)
- `type`: `bug` | `feature_request` (optional)
- `status`: `open` | `in_progress` | `resolved` (optional)

**Success (200)**
```json
{
  "success": true,
  "message": "Issues retrived successfully",
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  ]
}
```

**Reporter details (no JOINs requirement)**
To include reporter data without SQL JOINs, fetch issues first and then fetch reporter data separately (or batch using `WHERE id IN (...)`).

#### 2.3 Get Single Issue
- **Access:** Public
- **GET** `/api/issues/:id`

**Success (200)**
```json
{
  "success": true,
  "message": "Issue retrived successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

#### 2.4 Update Issue
- **Access:**
  - **Maintainer** (any issue), OR
  - **Contributor** (own issue only, and only when status is `open`)
- **PATCH** `/api/issues/:id`
- **Header:** `Authorization: <JWT_TOKEN>`

**Request Body**
```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

**Success (200)**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

#### 2.5 Delete Issue
- **Access:** Maintainer only
- **DELETE** `/api/issues/:id`
- **Header:** `Authorization: <JWT_TOKEN>`

**Success (200)**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## Common Response Patterns
### Standard Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": "Response data"
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

## HTTP Status Codes
| Code | Reason Phrase | Usage |
|---:|---|---|
| 200 | OK | Successful GET, PATCH, PUT, DELETE |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Validation errors, invalid input, duplicate resource |
| 401 | Unauthorized | Missing/expired/invalid JWT |
| 403 | Forbidden | Valid token but insufficient role/permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Business logic conflicts (e.g., editing resolved issue) |
| 500 | Internal Server Error | Unexpected server/db error |

