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

## Profiles

The app supports exactly two fixed profiles (`lib/profiles.ts`): **Aswath** and
**Surekaa**. Each person's data (checked exercises, completed sessions, streak,
custom exercises, level, session notes, body weight log, per-exercise weight
logs) is fully independent — stored in `localStorage` under a `wk_{profileId}_*`
prefix, and synced to its own Firestore document when cloud sync is configured
(see below).

- **First launch on a device** asks "Who's tracking?" — pick your name once and
  it's remembered on that device.
- The profile pill in the header switches which profile you're **viewing**.
  Viewing your own profile is fully editable; viewing the other person's is
  **read-only** — you see their progress but can't check things off, log
  weight, or change anything for them.
- "Not you? Reset identity" in the profile switcher clears the device's saved
  identity and shows the picker again (useful if set up on the wrong device).

## Cloud sync (Firebase)

If Firebase env vars are set, each profile's `wk_{profileId}_*` state is synced
to its own Firestore document (`appState/aswath`, `appState/surekaa`) — same
keys, no extra wiring. That's what makes cross-device viewing work: switching
to the other person's profile pulls their latest data from Firestore, even on
a device that's never seen it before. Without the env vars below, the app
works exactly as before (localStorage-only, profiles still independent but
not synced anywhere).

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
(used only to satisfy Firestore's `request.auth != null` — either of you can
read/write either profile's doc, since you're both trusted) and create a
**Firestore** database. Lock it down to just the two known profile docs:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appState/{profileId} {
      allow read, write: if request.auth != null
        && profileId in ['aswath', 'surekaa'];
    }
  }
}
```

Any future state should keep writing to `localStorage` via `profileKey()`
(`lib/profiles.ts`) so it stays namespaced per profile — it'll be picked up
and synced by `lib/cloudSync.ts` without further changes.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
