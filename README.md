# PostHub API

🌐 **Live API**: [https://api.posthub.bestapi.uz](https://api.posthub.bestapi.uz)  
📚 **API Documentation**: [https://api.posthub.bestapi.uz/docs](https://api.posthub.bestapi.uz/docs)  
💻 **GitHub Repository**: [https://github.com/BehruzXurramov/PostHub-NestJS](https://github.com/BehruzXurramov/PostHub-NestJS)

> ⚠️ **Important Note**: This project uses free hosting services (free server, free database). Under heavy load, the API may experience slower response times or temporary unavailability. For production use, please consider deploying your own instance.

A RESTful API for a social media platform built with NestJS, TypeScript, PostgreSQL, and TypeORM.

## Features

- **User Authentication**: Secure signup, login, email verification, and JWT-based authentication
- **User Profiles**: Create and manage user profiles with customizable information
- **Posts**: Create, read, update, and delete posts
- **Comments**: Comment on posts with full CRUD operations
- **Likes**: Like and unlike posts
- **Follow System**: Follow/unfollow users and view follower/following lists
- **Search**: Search for users by username or name
- **Pagination**: All list endpoints support pagination
- **Automated Cleanup**: Unactivated accounts are automatically deleted after 24 hours

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (Access & Refresh tokens)
- **Email**: Nodemailer
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Task Scheduling**: @nestjs/schedule

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/BehruzXurramov/PostHub-NestJS.git
cd posthub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server
PORT=3000
NODE_ENV=development
THE_URL=http://localhost:3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=posthub

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACTIVATION_SECRET=your_activation_secret_key
JWT_UPDATE_SECRET=your_update_secret_key

# JWT Expiration Times
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ACTIVATION_EXPIRATION=24h
JWT_UPDATE_EXPIRATION=1h

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

4. Run the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Once the server is running, access the interactive Swagger documentation at:

**Local**: `http://localhost:3000/docs`  
**Production**: `https://api.posthub.bestapi.uz/docs`

The Swagger documentation provides:
- Interactive API testing
- Detailed request/response examples
- Authentication setup
- Complete endpoint descriptions

## API Endpoints Overview

### Authentication
- `POST /auth/signup` - Register a new user
- `GET /auth/activate` - Activate account via email (email verification link)
- `POST /auth/login` - Login to account
- `POST /auth/logout` - Logout from account
- `POST /auth/refresh` - Refresh access token
- `PATCH /auth/update-password` - Update password
- `PATCH /auth/update-email` - Request email update
- `GET /auth/update-email` - Verify new email (email verification link)

### Users
- `GET /users/search` - Search for users
- `GET /users/me` - Get current user profile
- `GET /users/available` - Check username/email availability
- `GET /users/:id` - Get user by ID
- `PATCH /users/me` - Update current user profile
- `DELETE /users/me` - Delete current user account

### Posts
- `POST /posts` - Create a new post
- `GET /posts` - Get all posts or filter by user
- `GET /posts/:id` - Get a single post
- `PATCH /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

### Comments
- `POST /comments?postId=1` - Create a comment
- `GET /comments?postId=1` - Get comments for a post
- `GET /comments/:id` - Get a single comment
- `PATCH /comments/:id` - Update a comment
- `DELETE /comments/:id` - Delete a comment

### Likes
- `POST /likes/:postId` - Like a post
- `DELETE /likes/:postId` - Unlike a post
- `GET /likes/post/:postId` - Get users who liked a post
- `GET /likes/user/:userId` - Get posts liked by a user
- `GET /likes/status/:postId` - Check if current user liked a post
- `GET /likes/count/:postId` - Get like count for a post

### Follows
- `POST /follows/:id` - Follow a user
- `DELETE /follows/:id` - Unfollow a user
- `GET /follows/followers/:id` - Get followers of a user
- `GET /follows/following/:id` - Get users that a user is following
- `GET /follows/status/:id` - Check if current user is following another user
- `GET /follows/counts/:id` - Get follower and following counts

## Authentication

This API uses JWT-based authentication with two types of tokens:

1. **Access Token**: Short-lived token (15 minutes) sent in the Authorization header
   ```
   Authorization: Bearer <access_token>
   ```

2. **Refresh Token**: Long-lived token (7 days) stored in an HTTP-only cookie

### Authentication Flow

1. **Sign up**: Create an account and receive an activation email
2. **Activate**: Click the link in the email to activate your account
3. **Login**: Receive access and refresh tokens
4. **Use**: Include the access token in protected requests
5. **Refresh**: Use the refresh token to get a new access token when it expires

## Database Schema

### Users
- id, name, username, description, email, password, is_active, refresh_token, timestamps

### Posts
- id, text, edited, viewed_times, user_id, timestamps

### Comments
- id, text, edited, user_id, post_id, timestamps

### Likes
- id, user_id, post_id, created_at

### Follows
- id, follower_id, followed_id, created_at

## Key Features

### Pagination
All list endpoints support pagination with query parameters:
- `page`: Page number (default: 1)
- Results per page: 20 for posts/comments/follows, 10 for likes

### Automated Tasks
- Unactivated accounts are automatically deleted after 24 hours
- Runs hourly via scheduled task

### Cascading Deletes
- Deleting a user deletes all their posts, comments, likes, and follows
- Deleting a post deletes all its comments and likes

### Security Features
- Password hashing with bcrypt
- JWT token validation
- Email verification
- HTTP-only cookies for refresh tokens
- Input validation and sanitization

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Deployment & Limitations

### Live Instance
This API is currently deployed at [https://api.posthub.bestapi.uz](https://api.posthub.bestapi.uz) for demonstration and learning purposes.

### Important Notes
- **Free Tier Services**: The live instance uses free hosting and database services
- **Performance**: Response times may be slower under heavy load
- **Rate Limiting**: The server may throttle requests during peak usage
- **Availability**: There may be occasional downtime due to free tier limitations
- **Concurrent Users**: Limited number of simultaneous connections
- **For Production**: It's recommended to deploy your own instance with paid services for better performance and reliability

### Self-Hosting
To deploy your own instance:
1. Clone this repository
2. Configure your environment variables with your own database and hosting
3. Follow the installation steps above
4. Deploy to your preferred hosting service (Railway, Render, DigitalOcean, AWS, Heroku, etc.)

## For Frontend Developers

This is an **open API project** designed for frontend developers to practice building social media applications. You can:

- Use the live API at `https://api.posthub.bestapi.uz`
- Build React, Vue, Angular, or any frontend application
- Test all features through the Swagger documentation
- Deploy your own instance for unlimited usage

### Getting Started with Frontend
1. Visit the [Swagger documentation](https://api.posthub.bestapi.uz/docs)
2. Try the endpoints interactively
3. Sign up for a test account
4. Start building your frontend application

## Contributing

This is an open-source learning project. Contributions are welcome!

## License

MIT

## Contact

- **GitHub**: [BehruzXurramov](https://github.com/BehruzXurramov)
- **API Issues**: Please open an issue on GitHub
- **Email**: bxurramov597@gmail.com

