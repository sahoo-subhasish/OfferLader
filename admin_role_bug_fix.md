# 🛡️ Admin Role Preservation Bug Fix — Explanation

## What Went Wrong

After the profile completion enforcement was added, filling out the profile form **removed admin access**. The dashboard's admin section disappeared after submitting the form.

---

## Root Cause

The bug was in `ProfileSetup.jsx` inside the `handleSubmit` function.

### The broken code (before fix)

```js
const newUserData = {
  fullName: formData.fullName,
  university: formData.university,
  batch: formData.batch,
  branch: formData.branch,
  whatsapp: formData.whatsapp,
  vjudgeId: formData.vjudgeId,
  role: "user",           // ← THE CULPRIT
  solvedProblems: {},     // ← ALSO DANGEROUS
  email: user.email,
  createdAt: new Date().toISOString()  // ← RESETS CREATION DATE
};

await setDoc(userDocRef, newUserData, { merge: true });
```

### Why `{ merge: true }` didn't save you

A common misconception: people think `merge: true` makes the save "safe" for all fields. It is only safe for fields that are **not present in the payload**.

Here's how Firestore merge actually works:

| Field in payload? | Field in Firestore doc? | Result |
|---|---|---|
| ✅ Yes | ✅ Yes | **Overwrites** the Firestore value with the payload value |
| ✅ Yes | ❌ No | Creates the field with the payload value |
| ❌ No | ✅ Yes | **Preserved** — this is what merge protects |

So `role: "user"` in the payload **explicitly overwrote** `role: "admin"` in Firestore — merge had no power to stop it because the field was present in the payload.

Same story for `solvedProblems: {}` — any DSA problems the user had marked as solved would be wiped back to an empty object.

And `createdAt: new Date().toISOString()` would reset the user's account creation timestamp every time they update their profile.

---

## The Fix

```js
const newUserData = {
  fullName: formData.fullName,
  university: formData.university,
  batch: formData.batch,
  branch: formData.branch,
  whatsapp: formData.whatsapp,
  vjudgeId: formData.vjudgeId,
  email: user.email,
  // Only set these on first-time creation — do NOT overwrite for existing users
  ...(!user.role           && { role: "user" }),
  ...(!user.solvedProblems && { solvedProblems: {} }),
  ...(!user.createdAt      && { createdAt: new Date().toISOString() }),
};
```

### How the conditional spread works

`...(!user.role && { role: "user" })` means:

- If `user.role` is **falsy** (undefined/null — a brand new user with no Firestore doc):
  - `!user.role` → `true`
  - `true && { role: "user" }` → `{ role: "user" }`
  - Spread result: `role: "user"` is added to the payload ✅

- If `user.role` is **truthy** (e.g. `"admin"` or even `"user"` — existing user):
  - `!user.role` → `false`
  - `false && { role: "user" }` → `false`
  - Spread result: `...false` → adds **nothing** to the payload ✅
  - Since `role` is not in the payload, Firestore merge leaves it untouched ✅

Same logic applies to `solvedProblems` and `createdAt`.

---

## Behaviour by User Type

| Scenario | `role` in payload? | Firestore `role` result |
|---|---|---|
| Brand new user (first sign-in, no Firestore doc) | ✅ Yes → `"user"` | Gets `role: "user"` set |
| Existing regular user completing missing fields | ❌ No | Their `role: "user"` stays untouched |
| Admin completing missing fields | ❌ No | Their `role: "admin"` is **preserved** ✅ |

---

## Why Admin Access Was Lost in React Context Too

Even if Firestore was fixed, the in-memory context was also wrong:

```js
// After fix in Firestore, but context still broken:
setUser({ ...user, ...newUserData, isNewUser: false, isProfileIncomplete: false });
```

`{ ...user, ...newUserData }` means `newUserData` fields overwrite `user` fields. If `newUserData` had `role: "user"`, it would overwrite `user.role: "admin"` in the React context — even if Firestore was correctly using merge.

After the fix, `newUserData` no longer contains `role` for existing users, so `...newUserData` no longer stomps on the existing `user.role` in context.

---

## Summary of What the One Fix Achieves

| Protected field | New users | Existing users |
|---|---|---|
| `role` | Set to `"user"` (default) | Preserved (admin stays admin) |
| `solvedProblems` | Initialized to `{}` | All solved problems kept intact |
| `createdAt` | Set to current timestamp | Original creation date preserved |
| Profile fields (name, university, etc.) | Saved normally | Updated with new values ✅ |
