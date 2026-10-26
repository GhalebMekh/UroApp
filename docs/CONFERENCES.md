# Updating the conference list

The Conferences screen and the Home "Next congress" card read
`src/data/conferences.json`.

- The file is **built into the app**, so the list works offline and during App Review.
- Installed apps also **download the same file from GitHub** (`main` branch) once per
  session when online, and keep the newest copy by `updatedAt`.
- Editing the file on `main` therefore updates every installed app within a day, with no
  App Store release. The next app build picks it up as the built-in copy too.

## To add or change a congress

1. Confirm the dates, city and website on the **official congress or society site**. Never
   add a date from memory, a newsletter or a third-party listing (CLAUDE.md).
2. Add an entry to `conferences` (any order — the app sorts by date):

   ```json
   {
     "id": "eau-2028",
     "name": "EAU 2028",
     "fullName": "43rd Annual Congress of the European Association of Urology",
     "organisation": "European Association of Urology (EAU)",
     "startDate": "2028-03-10",
     "endDate": "2028-03-13",
     "city": "City",
     "country": "Country",
     "url": "https://official-site.example/",
     "regional": false,
     "notes": "One or two sentences on why it matters."
   }
   ```

   (Placeholder values — replace every one with the verified details.)

   - Dates are `yyyy-mm-dd`; `endDate` is the last day, inclusive.
   - `url` must start with `https://`.
   - `regional: true` marks Gulf/MENA meetings; leave it out otherwise.
   - `id` must be unique.
3. **Change `updatedAt`** to the current date-time (e.g. `2027-01-15T00:00:00Z`). Apps only
   switch to the new list when its `updatedAt` is newer than the one they already have.
4. Commit to `main`. Finished congresses can be deleted at any time; the app hides them anyway.

If the file is malformed, apps ignore the download and keep their last good list, so a
mistake never reaches users — but the update doesn't either until it is fixed.

## The monthly check

`.github/workflows/conferences-check.yml` runs `scripts/check-conferences.mjs` on the 1st of
each month and after every edit to the file. It opens a **"Conference list needs attention"**
issue when:

- fewer than 3 congresses are upcoming, or
- an official website stops loading,

and closes the issue once the list is healthy again. Some society sites refuse automated
requests; those are reported as "could not check" rather than as broken. Run it any time from
the repository's Actions tab ("Conference list check" → Run workflow).

## Requirement

Apps download the list from `raw.githubusercontent.com`, which only works while the
repository is **public** (the Weekly reads feed works the same way). If the repository is made
private, move both files to another public host and set `VITE_CONFERENCES_FEED_URL` (and
`VITE_ARTICLES_FEED_URL`) at build time.
