# Job Nest Backend API

A Node.js/Express backend for a job portal application with MongoDB, Cloudinary, and Mailtrap integration.

## Features

- User authentication (JWT)
- Job postings management
- Company profiles
- Job applications
- Saved jobs functionality
- Email notifications

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (see Configuration section)
4. Start the server:

```bash
node index.js
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
#MONGODB_URL=YOUR_MONGODB_URL
JWT_SECRET=YOUR_JWT_SECRET

MAIL_TRAP_API_KEY=YOUR_MAIL_TRAP_API_KEY

CLIENT_URL=YOUR_CLIENT_URL

CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY

CLOUDINARY_NAME=YOUR_CLOUDINARY_NAME

CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/check-auth` - Get current user profile

### Jobs

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (requires employer)
- `PUT /api/jobs/:id` - Update job (requires employer)
- `DELETE /api/jobs/:id` - Delete job (requires employer)

### Applications

- `POST /api/applications` - Apply for a job (requires candidate)
- `GET /api/applications` - Get all applications (candidate)
- `GET /api/applications/:id` - Get single application (employer);
- `PUT /api/applications/:id` - Update application status (employer)

### Companies

- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company (requires employer)

### User

- `POST /api/saved-jobs` - Save a job
- `GET /api/saved-jobs` - Get saved jobs
- `DELETE /api/saved-jobs/:id` - Remove saved job

## Data Models

### User

- name: String
- email: String (unique)
- password: String (hashed)
- role: String (user/company/admin)

### Job

- title: String
- description: String
- requirements: String
- company: ObjectId (ref: Company)
- location: String
- salary: Number

### Application

- job: ObjectId (ref: Job)
- applicant: ObjectId (ref: User)
- resume: String (Cloudinary URL)
- status: String (applied/shortlisted/hired/rejected)

### Company

- name: String
- description: String
- website: String
- logo: String (Cloudinary URL)
- user: ObjectId (ref: User)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
