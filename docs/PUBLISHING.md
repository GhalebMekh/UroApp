# Publishing UroApp on the App Store

Goal: live on the App Store before the end of 2026, sold as Pro / Elite subscriptions.
Steps marked **You** need your Apple ID, money, identity or a decision. **Claude** is code
and documents.

Status key: ✅ done · ⏳ waiting on something · ⬜ not started

---

## A. Accounts and agreements (You)

| | Step | Notes |
|---|---|---|
| ⬜ | **Enrol in the Apple Developer Program** as an *individual* | developer.apple.com/programs. Annual fee; Apple verifies your identity. The App Store will show your personal name as the seller. |
| ⬜ | **App Store Connect → Business**: accept the **Paid Apps** agreement, add **tax** and **bank** details | Subscriptions can't be sold or tested in TestFlight until this is active. |
| ⬜ | Join the **App Store Small Business Program** | Lower commission for small developers. Apply once enrolled. |
| ✅ | **Dedicated support mailbox**: `support.uroapp@gmail.com` | On the legal pages; sender of account emails (Gmail SMTP). |
| ✅ | **Supabase project** `zwyjaejykltkxrcctwho`, Central EU (Frankfurt) | Set up and tested 2026-10-30 (sign-up code, sync, ward list kept local, delete account). Still to add the URL + publishable key to Codemagic `uroapp_app`. |
| ⬜ | **RevenueCat project** (free tier) | Step-by-step in section **I** below. The app is ready for it; only the key and products are missing. |

## B. The app record (You, with Claude's text)

| | Step | Notes |
|---|---|---|
| ⬜ | **App Store Connect → Apps → +** | Name **UroApp** (if taken, e.g. "UroApp: Urology Tools"), bundle ID **com.uroapp.clinical**, primary language English, category **Medical**. |
| ⬜ | Copy the app's numeric **Apple ID** to Claude | Goes into `codemagic.yaml` (`APP_STORE_APPLE_ID`). |
| ⬜ | **Subscriptions → one group "UroApp"**, four products | `com.uroapp.clinical.pro.monthly` $4.99 · `com.uroapp.clinical.pro.yearly` $39.99 · `com.uroapp.clinical.elite.monthly` $9.99 · `com.uroapp.clinical.elite.yearly` $79.99. Elite ranks above Pro in the group. Optional: free trial (introductory offer) on the yearly plans — the app shows it automatically, only to people who can still use it. Set Saudi Arabia as the base country so SAR prices are round. Each product needs a display name, description and a **review screenshot** (Claude can take one of the Plans screen). Use exactly these IDs: the app recognises plans by them. |
| ⬜ | **App Privacy** questionnaire | Answers in section F below. |
| ⬜ | **Age rating** questionnaire | Answer honestly: medical/treatment information is present. |
| ⬜ | **URLs** | Privacy policy, Support, and the Terms of Use link (Apple's Standard EULA is fine). Claude publishes the pages once the support email exists. |
| ⬜ | **Screenshots** | iPhone and iPad, at the sizes App Store Connect asks for. Claude can produce them from the app. |
| ⬜ | **Description, keywords, promotional text** | Claude drafts them; you approve. |

## C. Build pipeline (You: one-time clicks; Claude: config)

| | Step | Notes |
|---|---|---|
| ✅ | iOS project, shared scheme, privacy manifest, Face ID text, export-compliance flag | In `ios/`. |
| ✅ | **App icon** (white "U" on the violet header gradient, 1024 px, no alpha) and **navy launch screen** — replaced Capacitor's placeholders | Source `tools/screenshots/brand/icon.svg`; to change: `npm run icons` in `tools/screenshots`, flatten to RGB, copy into `ios/App/App/Assets.xcassets` (`AppIcon-1024.png`, the three `splash-2732x2732*.png`). |
| ✅ | Native settings: light status-bar text app-wide, `arm64` device requirement, edge-to-edge web view (`contentInset: 'never'`) on a navy background | `Info.plist`, `capacitor.config.ts`. Confirm on the first TestFlight build (list E). |
| ✅ | Fonts bundled in the app (Fontsource, OFL) — no Google Fonts request, fully offline | `src/main.tsx`. |
| ✅ | `codemagic.yaml` (cloud Mac build → TestFlight) | Builds on a pushed tag such as `v1.0.0-b1`. |
| ⬜ | **You:** App Store Connect API key → Codemagic integration named **UroApp ASC key** | See the header of `codemagic.yaml`. |
| ⬜ | **You:** Codemagic environment group **`uroapp_app`** | Holds the `VITE_*` settings (Supabase now, RevenueCat later). It must exist even if empty. With `VITE_PAYWALL=on` the build stops unless `VITE_REVENUECAT_IOS_KEY` and `VITE_PRIVACY_URL` are also set. |
| ⏳ | First TestFlight build | After the steps above. Check the build log uses **Xcode 27.1 or later** (full iPhone Duo support). |

## D. Still to build (Claude)

| | Item | Waiting on |
|---|---|---|
| ✅ | Pro / Elite gating (off until purchases work) | — |
| ✅ | App lock (PIN / Face ID) | — |
| ✅ | Optional account: sign-up with emailed code, profile, backup & sync, sign-out, **in-app account deletion** | Supabase settings to switch it on |
| ✅ | **Paywall + RevenueCat** (plugin 13.7.4): **Plans** screen — Pro/Elite cards, monthly/yearly, App Store prices (billed amount largest), length, free-trial wording when eligible, what's included, renewal terms, Terms (EULA) + Privacy links; **See plans** on every locked feature; More → **Subscription** with Restore Purchases and Manage; tier read from RevenueCat entitlements; follows the signed-in account | Goes live with the key, the products and `VITE_PAYWALL=on` (section I). Never run against the real App Store yet. |
| ✅ | Privacy / terms / support pages live on GitHub Pages (`gh-pages` branch, source `docs/legal/`): [support](https://ghalebmekh.github.io/UroApp/support.html) · [privacy](https://ghalebmekh.github.io/UroApp/privacy.html) · [terms](https://ghalebmekh.github.io/UroApp/terms.html). To update: edit `docs/legal/`, then copy the files to the `gh-pages` branch. Use these as the App Store URLs and as `VITE_PRIVACY_URL` / `VITE_TERMS_URL`. | — |
| ⏳ | Store text: description, keywords, review notes — drafted in [APP_STORE_LISTING.md](APP_STORE_LISTING.md) | Your approval; subscription paragraph needs the final plans |
| ✅ | Phone / iPad / iPhone Duo layout: Home dashboard; Calculators and Pediatrics as lists with each tool on its own screen; collapsible drug interactions; no sideways scrolling at 320 px | — |
| ✅ | New look: gradient header on every screen, system font, specialty colours | — |
| ✅ | Screenshots — 8 screens × iPhone 6.3", iPhone 6.9", iPad 13" (landscape) in `store/screenshots/` (git-ignored); regenerate with `npm run shoot` in `tools/screenshots` | Taken in Edge, so headings show Segoe UI; optionally retake on an iOS simulator for SF Pro |
| ✅ | Version **1.0** (`MARKETING_VERSION`); build numbers set by Codemagic | — |

## E. Test on TestFlight before submitting (You + colleagues)

- [ ] Face ID / Touch ID unlocks the app lock; 5-minute relock; Forgot PIN.
- [ ] Plans screen shows the App Store prices (in SAR with a Saudi sandbox account) and, if set up,
      the free trial. Sandbox purchase of Pro, then **Upgrade to Elite**, then **Switch to monthly**;
      locked features open straight after buying; cancelling Apple's sheet shows no error.
- [ ] **Restore Purchases** on a second device (More → Subscription and on the Plans screen);
      with a fresh sandbox account it says no subscription was found.
- [ ] Signed in: buy on the iPhone, sign in on the iPad, Pro is there. Sign out: back to Resident.
- [ ] Airplane mode with an active subscription: paid features stay open (RevenueCat caches it).
- [ ] Account: sign up (code email arrives), profile, sync between iPhone and iPad, **Delete account**.
- [ ] iPad layout; **iPhone Duo** folded and unfolded if anyone has one.
- [ ] Print / Save file from the logbook, consent forms, MDT, CME and handover.
- [ ] Offline: airplane mode, then calculators, guidelines and Weekly reads (offline copy).
- [ ] Launch: navy launch screen, no white flash; the new icon on the home screen.
- [ ] Headers run under the status bar / Dynamic Island with readable white clock and battery;
      the top bar clears the notch and the bottom nav clears the home indicator.
- [ ] Links (sources, PubMed, congress sites) open in Safari and return to the app.

## F. App Privacy answers (must match `ios/App/App/PrivacyInfo.xcprivacy`)

- **Tracking:** No.
- **Data collected**, all *linked to the user*, *not used for tracking*, purpose **App Functionality**,
  and only when the user creates an account:
  - Contact info → **Email address**
  - Contact info → **Name** (display name)
  - Identifiers → **User ID**
  - User content → **Other user content** (logbook, CME record, favourites, rehearsal progress, profile role/institution)
- Purchases → **Purchase history** (RevenueCat, to know which plan is active), linked to the user,
  not used for tracking, App Functionality. Declared in `PrivacyInfo.xcprivacy`; RevenueCat's SDK
  ships its own manifest too.
- Not collected: location, health records about the user, browsing, diagnostics, ads data.

## G. Review notes

Current draft: [APP_STORE_LISTING.md → App Review notes](APP_STORE_LISTING.md#app-review-notes-app-store-connect--app-review-information).
No demo account is needed — every feature works without signing in.

## H. Known review risks (decided, kept on record)

- **5.1.1(ix):** Apple prefers healthcare apps from organisations, not individuals. The owner chose
  an individual account; a disclaimer does not change this rule. If rejected, the fallbacks are
  publishing through DSFH / a university, or forming a company.
- **1.4.2:** drug *dosage calculators* must come from approved entities. The weight-based paediatric
  dosing is the exposure. If flagged, hide the dose computation and keep the reference text.
- **Accounts:** email + password only, so Sign in with Apple is not required (guideline 4.8
  applies to third-party/social sign-in). Revisit if Google sign-in is ever added.

## I. Switching on subscriptions (You, once the products exist in App Store Connect)

The app side is built: Plans screen, Restore, and the tier read from RevenueCat. These steps
connect it. Names in `code` must match exactly — the app looks for them.

1. **RevenueCat → create project "UroApp" → Apps → App Store**: bundle ID `com.uroapp.clinical`.
2. **In-App Purchase key** (needed for StoreKit 2): App Store Connect → Users and Access →
   Integrations → **In-App Purchase** → generate a key, download the `.p8`, upload it in RevenueCat's
   App Store app settings with its Key ID and your Issuer ID.
3. **Products**: add the four product IDs from section B.
4. **Entitlements**: create `pro` and `elite`.
   - `pro` ← all four products (so Elite also counts as Pro).
   - `elite` ← the two Elite products.
5. **Offerings**: create one with identifier `default`, mark it **Current**, and add the four
   products as packages (package names don't matter; the app matches by product ID).
6. **API keys**: copy the **public iOS key** (starts `appl_`; never the secret key). In Codemagic's
   `uroapp_app` group add `VITE_REVENUECAT_IOS_KEY` = that key, `VITE_PRIVACY_URL` = the published
   privacy page, then `VITE_PAYWALL` = `on`. Optional: `VITE_TERMS_URL` once our terms page is live
   (otherwise the app links Apple's Standard EULA).
7. **Sandbox testers**: App Store Connect → Users and Access → Sandbox → add one with Saudi
   Arabia as the region; sign in with it on the test iPhone (Settings → App Store → Sandbox Account).
8. **Lifetime access for you and one colleague**: each signs in to a UroApp account in the app,
   then find their user ID in Supabase → Authentication → Users. In RevenueCat → Customers, search
   that ID → **Grant entitlement** → `elite` → Lifetime. The app shows it as "Complimentary access".
   There is no in-app code for this (guideline 3.1.1).
9. **App Store submission**: on the version page, under **In-App Purchases and Subscriptions**, add
   the four subscriptions so they are reviewed with the build. In the review notes, say where the
   Plans screen is: More → Subscription → See plans, or any locked feature → See plans.
