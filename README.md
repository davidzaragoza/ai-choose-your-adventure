## Table of Contents
- [Choose Your Adventure](#choose-your-adventure)
  - [Installation](#installation)
    - [Clone the repository](#clone-the-repository)
    - [Install dependencies:](#install-dependencies)
    - [Set up environment variables](#set-up-environment-variables)
    - [Initialize Database](#initialize-database)
    - [Run](#run)

# Choose Your Adventure

Choose Your Adventure is a web application that allows users to create, share, and explore interactive stories using the Vercel AI SDK to generate them.

The project is built using Next.js, TypeScript, and various UI components from Radix UI.

The project is currently deployed here: [Choose Your Story](https://dz-choose-your-story.vercel.app/)


## Installation

### Clone the repository
```sh
git clone https://github.com/yourusername/choose-your-adventure.git
cd choose-your-adventure
```

### Install dependencies:
```sh
npm install
```

### Set up environment variables
This project requires several environment variables to be set in the `.env.local` file.

```sh
OPENAI_API_KEY=your_openai_api_key_here

AUTH_SECRET=your_auth_secret_here
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret_here
AUTH_GOOGLE_ID=your_google_oauth_client_id_here

POSTGRES_URL="your_postgres_connection_url_here"
```

In order that google sign in works, you have to add this callback in project credentials:
http://localhost:3000/api/auth/callback/google

And this authored origin for javascript: http://localhost:3000

### Initialize Database
After setting the environment variables, execute the following command to initialize the database
```sh
npm run seed
```

### Run

To start the server, run:
```sh
npm run dev