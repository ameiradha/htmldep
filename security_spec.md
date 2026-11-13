# Security Specification: HTML Deploy App

## 1. Data Invariants
1. **Account Isolation**: A user can only create, update, or delete HTML sites where `ownerId == request.auth.uid`. A user cannot read another user's private list of sites.
2. **URL / Slug Immutability**: On update, the `slug` and `ownerId` and `createdAt` must remain identical to existing values (`incoming().slug == existing().slug`), ensuring the random domain URL is preserved.
3. **Public Access Invariant**: Any public user (even unauthenticated) can read a single site document (`get`) if and only if `isPublished == true`. Unauthenticated users can never `list` sites across the database.
4. **Content & Boundary Limits**: `htmlContent` must be a valid string with maximum size 1,048,576 characters (1MB). `title` size <= 120. `slug` size <= 64 and matches `^[a-z0-9-]+$`.
5. **Timestamp Integrity**: `createdAt` and `updatedAt` on create must equal `request.time`. `updatedAt` on update must equal `request.time`.

## 2. The "Dirty Dozen" Payloads (Must be REJECTED)
1. **Unauthenticated Write**: Creating a site without Firebase Auth token (`request.auth == null`).
2. **Owner Spoofing**: User A setting `ownerId: "victim_user_b"`.
3. **Ghost Key Injection**: Adding unauthorized property `isAdmin: true` or `shadowField: 123` on site creation.
4. **URL / Slug Hijack on Update**: Attempting to alter `slug` to another user's slug during an update.
5. **Ownership Transfer**: Attempting to change `ownerId` from User A to User B during an update.
6. **Payload Bomb**: Injecting a 5MB payload into `htmlContent` exceeding the 1MB safety boundary.
7. **Malformed Slug Injection**: Setting `slug` with illegal symbols or script injections like `<script>` or `/../../etc`.
8. **Client Timestamp Tampering**: Submitting client-generated timestamp instead of `request.time`.
9. **Private Site Public Leak**: An unauthenticated user attempting to query or list `/sites` without filtering.
10. **Unauthorized Deletion**: User B attempting to delete a site belonging to User A.
11. **Negative File Size or Version**: Providing invalid numeric formats like `fileSizeBytes: -100` or `version: "invalid"`.
12. **Unauthorized Cross-User Update**: User B updating User A's HTML document.

## 3. Test Runner
Tested via Firestore Rules evaluation verifying all 12 payloads return `PERMISSION_DENIED`.
