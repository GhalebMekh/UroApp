# Accounts & cloud backup — Supabase setup

UroApp's account is **optional**. It backs up the **logbook, CME record (and target), tool
favourites and rehearsal progress**, and keeps them in step between a user's iPhone and iPad. The **ward list and MDT
case sheets never leave the device**. The app enforces this, and so does the database, which
rejects their keys.

The code is already in the app. It stays switched off (no Account section, no network calls)
until the two settings in step 6 are added to a build.

---

## 1. Create the project

1. Sign up at supabase.com and **New project**.
2. **Region:** choose the one closest to Saudi Arabia from the list Supabase offers. Write it
   down, because the privacy policy names it.
3. Set a strong database password and keep it in a password manager. The app never needs it.

## 2. Create the tables

**SQL Editor → New query**, paste the whole of
[`supabase/migrations/0001_profiles_and_sync.sql`](../supabase/migrations/0001_profiles_and_sync.sql),
and **Run**. This creates:

- `profiles`: display name, role (R1–R5, fellow, specialist, consultant), institution;
- `user_data`: one backed-up document per synced item;
- row-level security, so each signed-in user can read and write **only their own rows**;
- `delete_my_account()`: the in-app **Delete account** button (App Store rule 5.1.1(v)).

## 3. Authentication settings

**Authentication → Sign In / Providers → Email**

- **Enable Email provider:** on
- **Confirm email:** on
- **Minimum password length:** 8, and require letters and digits (the app asks for the same)

**Authentication → Email Templates.** The app uses **6-digit codes, not links**, so no deep-link
setup is needed. Edit these two templates so the body shows the code:

| Template | Put this in the body |
|---|---|
| Confirm signup | `Your UroApp code is {{ .Token }}` |
| Reset password | `Your UroApp password reset code is {{ .Token }}` |

You can keep the link in the email too, but the code must be there.

## 4. Email delivery (required before real users)

Supabase's built-in email **only sends to your own team's addresses, about 2 per hour**. It's for
testing only. Before colleagues sign up:

**Authentication → Emails → SMTP Settings → Enable custom SMTP.** Use a sending service
(e.g. Resend, Postmark, Amazon SES, or your mail host's SMTP) with the **dedicated UroApp
support address** as the sender.

## 5. Test it yourself (before any colleague)

1. Build with the two settings (step 6) and create an account. The code should arrive.
2. Add a logbook case, open the app on a second device or browser, sign in, and check the case
   appears.
3. **Table Editor → user_data:** confirm there's no `uroapp.rounding.v1` or `uroapp.mdt.v1` row.
4. **More → Account → Delete account**, then check **Authentication → Users** and `user_data`.
   The user and their rows should both be gone.

## 6. Give the app its settings

**Project Settings → API** shows the **Project URL** and the **publishable (anon) key**.

- **Send these two to Claude**, or put them yourself in:
  - `UroApp/.env.local` for local development (git ignores it);
  - **Codemagic → Environment variables → group `uroapp_app`** for the iOS build;
  - Render's environment, **only if** you want accounts on the feedback website too.

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

> **Never** use the `service_role` key anywhere in the app. It bypasses all security. The
> publishable key is made to sit inside apps; row-level security is what protects the data.

---

### How sync behaves (for reference)

- It syncs when you sign in, when the app opens or comes back to the front (at most once a
  minute), a few seconds after you change the logbook, CME, favourites or rehearsal progress, and from **Sync now**.
- Merging is per item. A case added on the iPhone and another on the iPad both survive.
  Deleting a case on one device deletes it on the other. If both devices edited the *same*
  item, this device wins, but an edit is never lost to a deletion.
- **Forgot PIN** (app lock) and **Sign out → remove from this device** clear the device's copy
  without counting as deletions, so the next sign-in restores everything from the backup.
- **Sign out** affects only this device. The iPad stays signed in.
