# Migration Instructions

This project has been migrated from Firebase to Supabase. Follow these steps to set up your environment.

## 1. Supabase Setup

### Create a Project
1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the project settings (API).

### Database Schema
Go to the **SQL Editor** in Supabase and run the following SQL to create the `users` table:

```sql
create table public.users (
  id uuid references auth.users not null primary key,
  username text unique not null,
  email text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create Policies
create policy "Public profiles are viewable by everyone."
  on users for select
  using ( true );

create policy "Users can insert their own profile."
  on users for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on users for update
  using ( auth.uid() = id );
```

### Storage Setup
1.  Go to **Storage** and create a new bucket named `profile_images`.
2.  Make the bucket **Public**.
3.  Add a policy to allow authenticated users to upload files:
    *   Policy Name: "Allow authenticated uploads"
    *   Allowed Operations: INSERT, SELECT, UPDATE
    *   Target roles: authenticated

### Authentication
1.  Go to **Authentication** -> **Providers**.
2.  Enable **GitHub**.
3.  Register a new OAuth App in GitHub (Settings -> Developer settings -> OAuth Apps).
4.  Set the **Homepage URL** to your app's URL (e.g., `http://localhost:3000`).
5.  Set the **Authorization callback URL** to `https://<your-project-ref>.supabase.co/auth/v1/callback`.
6.  Copy the **Client ID** and **Client Secret** from GitHub to Supabase.

## 2. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

*   `REACT_APP_SUPABASE_URL`: Your Supabase Project URL.
*   `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
*   `REACT_APP_CHAT_ENGINE_PROJECT_ID`: Your ChatEngine Project ID.
*   `REACT_APP_CHAT_ENGINE_PRIVATE_KEY`: Your ChatEngine Private Key.

**Security Warning**: This project uses the ChatEngine Private Key on the client-side (`src/component/Onboarding.jsx`) to create users. This is convenient for development but insecure for production because the key is exposed in the build. For a production-ready application, you should move the user creation logic to a backend service (e.g., Supabase Edge Functions) and call it from the client.

## 3. Run the App

```bash
npm install
npm start
```
