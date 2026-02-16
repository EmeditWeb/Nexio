# Chat Application

A real-time chat application built with React, Supabase, and React Chat Engine.

## Features

-   **Real-time Chat**: Powered by React Chat Engine.
-   **Authentication**: GitHub Sign-In via Supabase Auth.
-   **User Onboarding**: Set username and profile picture.
-   **Dark Mode**: Toggle between light and dark themes.
-   **Responsive Design**: Works on desktop and mobile.

## Prerequisites

-   Node.js (v14 or higher)
-   npm

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd chat_application
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase and Chat Engine credentials.

**Supabase Configuration:**
1.  Go to [Supabase](https://supabase.com/).
2.  Create a new project.
3.  Go to **Authentication** > **Providers** and enable **GitHub**.
4.  Go to **Table Editor** and create a `users` table in `public` schema with the following columns:
    -   `id` (uuid, Primary Key, link to `auth.users.id`)
    -   `username` (text)
    -   `email` (text)
    -   `photo_url` (text)
    -   `created_at` (timestamptz)
5.  Go to **Storage** and create a public bucket named `profile_images`.
6.  Copy the **Project URL** and **Anon Key** to your `.env` file.

**Chat Engine Configuration:**
1.  Go to [Chat Engine](https://chatengine.io/).
2.  Create a project.
3.  Copy the **Project ID** and **Private Key** to your `.env` file.

**Required Environment Variables:**
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_CHAT_ENGINE_PROJECT_ID`
- `REACT_APP_CHAT_ENGINE_PRIVATE_KEY`

### 4. Run the Application

Start the development server:

```bash
npm start
```

The app will run at `http://localhost:3000`.

## Testing

Run the test suite:

```bash
npm test
```

## Deployment

To build the app for production:

```bash
npm run build
```

This creates a `build` folder with optimized static files.

### Deploying to Netlify

1.  **Fork this repository** to your GitHub account if you haven't already.
2.  Log in to [Netlify](https://www.netlify.com/).
3.  Click "New site from Git".
4.  Choose GitHub and authorize Netlify.
5.  Select your repository.
6.  **Build settings** should be auto-detected (or set manually):
    -   **Base directory**: `/` (root)
    -   **Build command**: `npm run build`
    -   **Publish directory**: `build/`
7.  **Environment Variables**:
    -   Click "Show advanced" or go to "Site settings > Build & deploy > Environment".
    -   Add all the `REACT_APP_...` variables from your `.env` file.
    -   **Important**: Without these variables, the app will fail to load or connect to services.
8.  Click "Deploy site".

*Note: A `_redirects` file is included in `public/` to handle client-side routing, ensuring pages like `/login` work on refresh.*

## Project Structure

-   `src/component`: React components (ChatFeed, LoginForm, Onboarding, etc.).
-   `src/contexts`: Context providers (AuthContext, ThemeContext).
-   `src/supabaseClient.js`: Supabase initialization.
-   `src/App.js`: Main application component with routing.

## License

MIT
