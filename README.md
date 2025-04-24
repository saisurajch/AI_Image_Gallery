# CSC Project Frontend

This is the frontend of the CSC Project, built using [Next.js](https://nextjs.org) and styled with [Tailwind CSS](https://tailwindcss.com). It provides a user-friendly interface for managing photos, albums, and other related features.

## Features

- **Authentication**: Login, signup, and password recovery.
- **Photo Management**: Upload, organize, and delete photos.
- **Albums**: Create, edit, and delete albums.
- **Favorites**: Mark photos as favorites for quick access.
- **Trash**: Recover or permanently delete photos.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm, yarn, or pnpm package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/csc-project-frontend.git
   cd csc-project-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Running the Development Server

Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Building for Production

To build the app for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

### Linting and Formatting

Run ESLint to check for code issues:
```bash
npm run lint
```

Format code with Prettier:
```bash
npm run format
```

## Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_S3_BUCKET_URL=https://your-s3-bucket-url
```

## Folder Structure

```
frontend/
├── src/
│   ├── app/                # Next.js app directory
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # Global and component-specific styles
│   ├── utils/              # Utility functions
│   └── middleware.ts       # Middleware for authentication
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── README.md               # Project documentation
```

## Deployment

The app can be deployed on [Vercel](https://vercel.com) or any other platform that supports Next.js.

### Deploy on Vercel

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy the app:
   ```bash
   vercel
   ```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
