This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Cloud sync (Firebase)

All app state (checked exercises, completed sessions, streak, custom exercises,
level, session notes, body weight log, per-exercise weight logs) lives in
`localStorage` under `wk_*` keys. If Firebase env vars are set, it's also synced
to Firestore automatically — same keys, no extra wiring — so progress survives a
cleared browser or a new device (signed in anonymously, one document per device).
Without the env vars below, the app works exactly as before (localStorage-only).

Add a Firebase project's web app config as env vars (`.env.local` for dev, and in
the Vercel project settings for the deployment):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

In the Firebase console, enable **Authentication → Sign-in method → Anonymous**
and create a **Firestore** database. Lock it down with rules so each device can
only read/write its own document:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appState/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Any future state should keep writing to `localStorage` with a `wk_` prefix
(`lib/cloudSync.ts`) — it'll be picked up and synced without further changes.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
