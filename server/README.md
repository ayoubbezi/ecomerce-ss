# BioGold E-commerce Website

A modern e-commerce website built with Node.js, Express, and MySQL.

## Deployment to Railway

### Prerequisites

1. [Railway account](https://railway.app/)
2. [Railway CLI](https://docs.railway.app/develop/cli) (optional)
3. Git repository

### Deployment Steps

#### 1. Set up Railway Project

1. Log in to [Railway](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select your repository

#### 2. Add MySQL Database

1. In your Railway project, click "New"
2. Select "Database" > "MySQL"
3. Wait for the database to be provisioned

#### 3. Configure Environment Variables

In your Railway project:

1. Go to the "Variables" tab
2. The `DATABASE_URL` should be automatically set
3. Add the following variables:
   - `NODE_ENV=production`

#### 4. Deploy

Railway will automatically detect your Node.js application and deploy it. The deployment process will:

1. Install dependencies from package.json
2. Run the build command from railway.json
3. Start the application using the start command from railway.json

#### 5. View Your Application

1. Go to the "Settings" tab
2. Under "Domains", you'll find the URL to your deployed application

## Running Locally

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Run the development server:
   ```
   npm run dev
   ```

## Database Migrations

If you need to run migrations, connect to your Railway MySQL database and run the SQL scripts.

## File Structure

- `server.js` - Entry point for the application
- `config/` - Configuration files for database
- `models/` - Database models
- `routes/` - API routes
- `middleware/` - Express middleware

## Technologies Used

- Node.js
- Express
- MySQL
- Sequelize
- Railway for deployment 