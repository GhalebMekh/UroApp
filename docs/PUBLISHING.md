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
| ⬜ | Create the **dedicated support mailbox** | Used on the privacy policy, support page and App Store listing, and as the sender for account emails. |
| ⬜ | **Supabase project** | Follow [ACCOUNTS_SETUP.md](ACCOUNTS_SETUP.md); send Claude the Project URL + publishable key. |
| ⬜ | **RevenueCat project** (free tier) | Connect it to App Store Connect, then send Claude the **public iOS API key** (starts `appl_`). |

## B. The app record (You, with Claude's text)

| | Step | Notes |
|---|---|---|
| ⬜ | **App Store Connect → Apps → +** | Name **UroApp** (if taken, e.g. "UroApp: Urology Tools"), bundle ID **com.uroapp.clinical**, primary language English, category **Medical**. |
| ⬜ | Copy the app's numeric **Apple ID** to Claude | Goes into `codemagic.yaml` (`APP_STORE_APPLE_ID`). |
| ⬜ | **Subscriptions → one group "UroApp"**, four products | `com.uroapp.clinical.pro.monthly` $4.99 · `com.uroapp.clinical.pro.yearly` $39.99 · `com.uroapp.clinical.elite.monthly` $9.99 · `com.uroapp.clinical.elite.yearly` $79.99. Elite ranks above Pro in the group. Optional: 7-day free trial on the yearly plans. Set Saudi Arabia as the base country so SAR prices are round. |
| ⬜ | **App Privacy** questionnaire | Answers in section F below. |
| ⬜ | **Age rating** questionnaire | Answer honestly: medical/treatment information is present. |
| ⬜ | **URLs** | Privacy policy, Support, and the Terms of Use link (Apple's Standard EULA is fine). Claude publishes the pages once the support email exists. |
| ⬜ | **Screenshots** | iPhone and iPad, at the sizes App Store Connect asks for. Claude can produce them from the app. |
| ⬜ | **Description, keywords, promotional text** | Claude drafts them; you approve. |

## C. Build pipeline (You: one-time clicks; Claude: config)

| | Step | Notes |
|---|---|---|
| ✅ | iOS project, shared scheme, privacy manifest, Face ID text, export-compliance flag | In `ios/`. |
| ✅ | `codemagic.yaml` (cloud Mac build → TestFlight) | Builds on a pushed tag such as `v1.0.0-b1`. |
| ⬜ | **You:** App Store Connect API key → Codemagic integration named **UroApp ASC key** | See the header of `codemagic.yaml`. |
| ⬜ | **You:** Codemagic environment group **`uroapp_app`** | Holds the `VITE_*` settings (Supabase now, RevenueCat later). It must exist even if empty. |
| ⏳ | First TestFlight build | After the steps above. Check the build log uses **Xcode 27.1 or later** (full iPhone Duo support). |

## D. Still to build (Claude)

| | Item | Waiting on |
|---|---|---|
| ✅ | Pro / Elite gating (off until purchases work) | — |
| ✅ | App lock (PIN / Face ID) | — |
| ✅ | Optional account: sign-up with emailed code, profile, backup & sync, sign-out, **in-app account deletion** | Supabase settings to switch it on |
| ⏳ | **Paywall + RevenueCat**: plan cards with price, length and what's included; free-trial wording; working **Restore Purchases**; links to Terms and Privacy (guideline 3.1.2) | RevenueCat key + products created |
| ⏳ | Publish privacy / terms / support pages (drafts in `docs/legal/`) | Support email, Supabase region |
| ⬜ | Store text: description, keywords, review notes | — |
| ⬜ | Screenshots (iPhone, iPad) | — |
| ⬜ | Version 1.0.0 (currently 0.1.0) | Just before the first submission |

## E. Test on TestFlight before submitting (You + colleagues)

- [ ] Face ID / Touch ID unlocks the app lock; 5-minute relock; Forgot PIN.
- [ ] Sandbox purchase of Pro and Elite; locked features open; **Restore Purchases** on a second device.
- [ ] Account: sign up (code email arrives), profile, sync between iPhone and iPad, **Delete account**.
- [ ] iPad layout; **iPhone Duo** folded and unfolded if anyone has one.
- [ ] Print / Save file from the logbook, consent forms, MDT, CME and handover.
- [ ] Offline: airplane mode, then calculators, guidelines and Weekly reads (offline copy).

## F. App Privacy answers (must match `ios/App/App/PrivacyInfo.xcprivacy`)

- **Tracking:** No.
- **Data collected**, all *linked to the user*, *not used for tracking*, purpose **App Functionality**,
  and only when the user creates an account:
  - Contact info → **Email address**
  - Contact info → **Name** (display name)
  - Identifiers → **User ID**
  - User content → **Other user content** (logbook, CME record, favourites, profile role/institution)
- **Purchases:** subscription status handled via Apple / RevenueCat. Re-check this section once
  RevenueCat is added.
- Not collected: location, health records about the user, browsing, diagnostics, ads data.

## G. Review notes (draft for App Store Connect → App Review Information)

> UroApp is a reference and training tool for urologists and urology residents. All clinical
> scores cite and link their primary publications; guideline content is summarised in our own
> words with links to the official AUA/EAU pages. No patient-identifiable data is collected:
> the ward list and MDT sheets never leave the device. An account is optional and only backs up
> the user's own logbook and CME record. Account deletion: More → Account → Delete account.
> Demo account: (email / password: provide one). Subscriptions: More → (paywall), with
> Restore Purchases in More.

## H. Known review risks (decided, kept on record)

- **5.1.1(ix):** Apple prefers healthcare apps from organisations, not individuals. The owner chose
  an individual account; a disclaimer does not change this rule. If rejected, the fallbacks are
  publishing through DSFH / a university, or forming a company.
- **1.4.2:** drug *dosage calculators* must come from approved entities. The weight-based paediatric
  dosing is the exposure. If flagged, hide the dose computation and keep the reference text.
- **Accounts:** email + password only, so Sign in with Apple is not required (guideline 4.8
  applies to third-party/social sign-in). Revisit if Google sign-in is ever added.
