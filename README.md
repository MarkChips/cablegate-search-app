# Cablegate Data Engineering and Search Application

This project provides a web application for searching and viewing Cablegate documents, leveraging a MongoDB database and a SvelteKit frontend. The application allows users to search documents by keywords, filter by metadata (e.g., year, month, from, to, tags, classification), and view detailed document information. The data is parsed from HTML files and stored in MongoDB, with a focus on efficient keyword-based search.

The live website can be viewed here: https://cablegate-search-app-gray.vercel.app/

## Project Structure

```
cablegate-data-engineering-and-search-application/
├── cable/                 # Raw Cablegate HTML files
├── parse.js               # Script to parse HTML and populate MongoDB
├── test-set/              # Sample Raw Cablegate HTML files for local test parsing
├── test.js                # Test Script to parse HTML and log to console the result
├── cablegate-search/      # SvelteKit frontend
│   ├── src/
│   │   ├── lib/server/mongodb.ts  # MongoDB connection logic
│   │   ├── routes/
│   │   │   ├── +page.svelte       # Search page
│   │   │   ├── api/search/+server.ts  # Search API
│   │   │   ├── api/documents/[id]/+server.ts  # Document API
│   │   │   ├── api/documents/[id]/+page.svelte    # Document details page
│   │   ├── app.html       # HTML template
│   │   ├── app.css        # Tailwind CSS styles
|   ├── .env               # MongoDB connection string (MONGO_URI)
│   ├── package.json       # Dependencies
│   ├── svelte.config.js   # SvelteKit config
```

## Features

- **Search**: Query documents by keywords (stored in the `keywords` array), with filters for year, month, from, to, tags, and classification.
- **Document Details**: View full document metadata and body content by ID.
- **Responsive UI**: Built with SvelteKit and styled using Tailwind CSS.
- **MongoDB Backend**: Stores \~86,000 Cablegate documents (512 MB - max capacity on free tier) in the `cablegate.documents` collection.
- **Deployment**: Deployed on Vercel with MongoDB Atlas integration.

## Prerequisites

- **Node.js**: v18 or higher
- **MongoDB Atlas**: Account with a cluster and `cablegate` database
- **Vercel**: For deployment
- **Git**: For version control

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/MarkChips/cablegate-search-app
cd cablegate-data-engineering-and-search-application
```

### 2. Configure MongoDB

1. **Create a MongoDB Atlas Cluster**:

   - Sign up at MongoDB Atlas.
   - Create a cluster and a database named `cablegate`.
   - Add a user with `readWrite` permissions under **Database Access**.
   - In **Network Access**, allow access from `0.0.0.0/0` (required for Vercel).

2. **Set Up** `.env`:

   - In the root directory, create `.env`:

     ```plaintext
     MONGO_URI="mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/cablegate?retryWrites=true&w=majority"
     ```

   - Replace `<username>`, `<password>`, and `cluster0.abc123` with your Atlas credentials.

### 3. Populate the Database

1. **Ensure HTML Files**:

   - Place Cablegate HTML files in the `cable/` directory.

2. **Run** `parse.js`:

   - This script parses HTML files and inserts documents into `cablegate.documents`.

   ```bash
   node parse.js
   ```

   ### Data Model

   Each cable/document is stored in MongoDB with a structure similar to:

   ```
   {
   "_id": "06CARACAS3507",
   "year": 2006,
   "month": 11,
   "created": "2006-11-30T22:05:00.000Z",
   "released": "2011-08-30T00:44:00.000Z",
   "classification": "CONFIDENTIAL",
   "origin": "Embassy Caracas",
   "from": "AMEMBASSY CARACAS",
   "to": "RUEHC/SECSTATE WASHDC PRIORITY 7156",
   "tags": ["PGOV", "PREL"],
   "subject": "SUBJECT OF THE CABLE",
   "body": "Full text of the cable...",
   "keywords": ["oil", "election", "ambassador"]
   }
   ```

### 4. Set Up the SvelteKit App

1. **Navigate to** `cablegate-search`:

   ```bash
   cd cablegate-search
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Run Locally**:

   ```bash
   npm run dev
   ```

   - Open `http://localhost:5173`.
   - Test search (e.g., “terrorism”) and document view (e.g., `/documents/8805KAMPALA1783`).

### 5. Deploy to Vercel

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Set Up Vercel**:

   - Go to Vercel.
   - Import the `cablegate-search` repository.
   - Add environment variable:
     - Key: `MONGO_URI`
     - Value: `<your-mongo-uri>`
   - Deploy the project.

   **Note:**  
   For production, ensure your MongoDB Atlas cluster allows connections from Vercel’s IP addresses. For dynamic IPs, you can set Atlas network access to `0.0.0.0/0`.

3. **Alternative: Vercel-MongoDB Integration**:

   - In Vercel → **Integrations** → **MongoDB Atlas**, add the integration.
   - Select your Atlas project and cluster.
   - This automatically sets `MONGODB_URI` and allows `0.0.0.0/0` in Atlas.

4. **Test Deployment**:

   - Visit `<your-url>.vercel.app`.

   - Check logs:

     ```bash
     vercel logs <your-url>.vercel.app
     ```

## Usage

- **Search Page** (`/`):
  - Enter a query (e.g., “terrorism”) to search the `keywords` field.
  - Filter by year, month, from, to, tags (comma-separated), or classification.
  - Paginate results using Previous/Next buttons.
- **Document Page** (`/documents/<id>`):
  - Click on a result to be taken to the document page.
