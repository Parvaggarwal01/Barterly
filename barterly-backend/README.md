# Barterly Backend - Authentication Module

Backend API for the Barterly skill bartering platform. It supports secure user authentication, user profiles, skill and barter workflows, real-time chat via Socket.io, caching with Redis, background job processing with RabbitMQ, and monitoring with Prometheus and Grafana. The backend is designed to keep skill exchange fast, reliable, and observable while supporting the platform’s marketplace and moderation features.

## 🎯 Current Status

✅ **Authentication Module Complete**

- User registration with OTP-based email verification
- Login/logout with JWT tokens
- Email verification via 6-digit OTP (10-minute expiry)
- Password reset flow
- Token refresh mechanism
- Protected routes

## 🛠️ Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access + Refresh tokens)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Email**: Nodemailer
- **Caching**: Redis
- **Message Queue**: RabbitMQ
- **Monitoring**: Prometheus + Grafana
- **Security**: helmet, cors, custom NoSQL sanitization, hpp, express-rate-limit

## 📁 Project Structure

```
barterly-backend/
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   └── auth.controller.js       # Auth request handlers
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── role.middleware.js       # Role-based access control
│   │   ├── validate.middleware.js   # Zod validation
│   │   ├── mongoSanitize.middleware.js  # NoSQL injection protection (Express 5 compatible)
│   │   └── errorHandler.middleware.js
│   ├── models/
│   │   └── User.model.js            # User schema
│   ├── routes/
│   │   └── auth.routes.js           # Auth endpoints
│   ├── services/
│   │   └── auth.service.js          # Auth business logic
│   ├── utils/
│   │   ├── jwt.utils.js             # JWT helpers
│   │   ├── email.utils.js           # Email templates
│   │   └── apiResponse.utils.js     # Response formatters
│   ├── validations/
│   │   └── auth.validation.js       # Zod schemas
│   └── app.js                       # Express app setup
├── server.js                        # Server entry point
├── .env                             # Environment variables
├── .env.example                     # Example env file
└── package.json
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```env
# MongoDB - Get from MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/barterly

# Email - Gmail example (use App Password, not regular password)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional: Cloudinary (for future file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Setting up Gmail for Nodemailer

1. Enable 2FA on your Gmail account
2. Go to Google Account > Security > App Passwords
3. Generate an app password for "Mail"
4. Use the generated password in `SMTP_PASS`

### 4. Start the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server will run on `http://localhost:5000`

## ☁️ Managed Services Setup (Upstash + CloudAMQP + Grafana Cloud)

### 1. Upstash Redis

1. Create a Redis database in Upstash.
2. Copy the Redis connection string (`rediss://...`).
3. Set `REDIS_URL` in your backend environment variables.

### 2. CloudAMQP RabbitMQ

1. Create a free RabbitMQ instance in CloudAMQP.
2. Copy the AMQP URL (`amqps://...`).
3. Set `CLOUDAMQP_URL` in your backend environment variables.

### 3. Grafana Cloud (Prometheus metrics)

Barterly already exposes metrics at `GET /metrics`.

1. Create a Grafana Cloud account and open your Prometheus stack.
2. Add a Prometheus scrape job (Grafana Alloy/Agent or compatible scraper) to collect metrics from your deployed backend endpoint:

```yaml
scrape_configs:
  - job_name: barterly-backend
    metrics_path: /metrics
    static_configs:
      - targets:
          - your-backend-domain.com
```

3. In Grafana Cloud, confirm incoming series such as:
   - `barterly_http_request_total`
   - `barterly_http_request_duration_seconds`
   - `barterly_registered_users_total`
   - `barterly_email_queue_size`

### 4. Recommended Production Env Vars

Use values from `.env.example` and ensure these are set on your host (Render/Railway/Fly.io/etc.):

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `REDIS_URL`
- `CLOUDAMQP_URL`
- `SMTP_USER`, `SMTP_PASS`
- `FRONTEND_URL`

## 📡 API Endpoints

### Public Routes

#### Health Check

```http
GET /health
```

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&\*)

**Response:**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false,
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Verify Email with OTP

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Note:** The 6-digit OTP is sent to the user's email upon registration and expires in 10 minutes.

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

#### Refresh Access Token

```http
POST /api/auth/refresh-token
```

_Note: Refresh token is automatically sent via httpOnly cookie_

### Protected Routes (Require Authentication)

**Authentication Header:**

```http
Authorization: Bearer <access_token>
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Resend Verification Email

```http
POST /api/auth/resend-verification
Authorization: Bearer <access_token>
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

## 🔐 Authentication Flow

1. **Registration**
   - User registers with email/password
   - 6-digit OTP sent to email (expires in 10 minutes)
   - Access token & refresh token returned
   - Refresh token stored in httpOnly cookie

2. **Email Verification**
   - User receives OTP in email
   - User submits OTP and email to verify account
   - Account is verified
   - Welcome email sent

3. **Login**
   - User provides credentials
   - Server validates and returns tokens
   - Refresh token stored in httpOnly cookie

4. **Token Refresh**
   - Access token expires after 15 minutes
   - Client requests new access token using refresh token
   - New tokens generated and returned

5. **Password Reset**
   - User requests reset
   - Reset email sent with token
   - User sets new password
   - All tokens invalidated

## 🔒 Security Features

- ✅ Helmet for HTTP headers security
- ✅ CORS with whitelist
- ✅ Rate limiting (10 req/15mi (Custom middleware for Express 5)n for auth, 100 req/15min for API)
- ✅ NoSQL injection protection
- ✅ HTTP parameter pollution prevention
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ HttpOnly cookies for refresh tokens

## 🧪 Testing with Postman/Thunder Client

### 1. Register

POST `http://localhost:5000/api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### 2. Check Email

Look for the 6-digit OTP in your email inbox

### 3. Verify Email with OTP

POST `http://localhost:5000/api/auth/verify-email`

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### 4. Login

POST `http://localhost:5000/api/auth/login`

### 5. Use Protected Routes

Add `Authorization: Bearer <token>` header

## 📝 Environment Variables Reference

| Variable             | Description                          | Required        |
| -------------------- | ------------------------------------ | --------------- |
| `NODE_ENV`           | Environment (development/production) | Yes             |
| `PORT`               | Server port                          | Yes             |
| `MONGODB_URI`        | MongoDB connection string            | Yes             |
| `JWT_ACCESS_SECRET`  | Secret for access tokens             | Yes             |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens            | Yes             |
| `JWT_ACCESS_EXPIRE`  | Access token expiry (15m)            | Yes             |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry (7d)            | Yes             |
| `SMTP_HOST`          | Email SMTP host                      | Yes             |
| `SMTP_PORT`          | Email SMTP port                      | Yes             |
| `SMTP_USER`          | Email username                       | Yes             |
| `SMTP_PASS`          | Email password                       | Yes             |
| `FROM_EMAIL`         | Sender email address                 | Yes             |
| `FRONTEND_URL`       | Frontend URL for links               | Yes             |
| `CLOUDINARY_*`       | Cloudinary credentials               | No (future use) |

## 🐛 Common Issues

### Email not sending

- Check SMTP credentials
- Use App Password for Gmail (not regular password)
- Ensure 2FA is enabled on Gmail
- Check firewall/antivirus settings

### MongoDB connection failed

- Verify connection string
- Check if IP is whitelisted in MongoDB Atlas
- Ensure network connectivity

### CORS errors

- Check if `FRONTEND_URL` matches your frontend origin
- Verify CORS configuration in `app.js`

## 📚 Next Steps

- [ ] Add rate limiting per user (not just IP)
- [ ] Implement refresh token rotation
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Add user profile endpoints
- [ ] Implement skills module
- [ ] Add barter request system
- [ ] Integrate Socket.io for real-time chat

## 📄 License

ISC
