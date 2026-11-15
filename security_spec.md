# Security Specification — 반짝반짝 바른 우리말 3D 미술관

## 1. Data Invariants
1. A `UserProfile` document at `/users/{userId}` can only be read, created, updated, or deleted by the authenticated owner whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
2. `UserProfile.uid` is immutable after creation and must match `request.auth.uid` and the path `{userId}`.
3. A `QaEntry` subcollection document at `/users/{userId}/qaEntries/{entryId}` cannot exist without an existing parent `/users/{userId}` document whose `uid == request.auth.uid`.
4. `QaEntry.userId` must strictly match `request.auth.uid` and `createdAt` must equal `request.time`.
5. `SharedPhrase` documents at `/sharedPhrases/{phraseId}` require `authorId == request.auth.uid`, `visibility == 'public'`, `createdAt == request.time`, and may only be deleted by their author (`resource.data.authorId == request.auth.uid`).
6. All string fields enforce explicit `minLength`/`maxLength` boundaries, all arrays enforce bounded `.size()`, and all document IDs match `^[a-zA-Z0-9_\\-]+$`.
7. No PII (`email`, `phone`, `address`) is stored in any Firestore collection.

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read** on `/users/userA`.
2. **Cross-user read** on `/users/userB` while authenticated as `userA`.
3. **Unverified email write** on `/users/userA` with `email_verified: false`.
4. **Identity spoofing** on `/users/userA` create with `uid: "userB"`.
5. **Shadow field injection** on `/users/userA` create adding `isAdmin: true`.
6. **Document ID poisoning** on `/users/userA/qaEntries/bad$id_1234...` (invalid characters / >128 bytes).
7. **Timestamp forgery** on `/users/userA/qaEntries/entry1` with client-provided `createdAt`.
8. **Orphaned subcollection write** on `/users/nonExistent/qaEntries/entry1`.
9. **Oversized payload (Denial of Wallet)** on `/users/userA/qaEntries/entry1` with 2000-char `answer`.
10. **Immutable field mutation** updating `uid` or `createdAt` on `/users/userA`.
11. **SharedPhrase impersonation** creating `/sharedPhrases/p1` with `authorId: "otherUser"`.
12. **Blanket list query scraping** listing `/users` or `/users/userB/qaEntries` as `userA`.
