# 🔒 Profile Completion Enforcement — Change Log & Explanation

## What Was the Problem?

Before this change, only **brand-new users** (who had never signed in before) were forced to fill out their profile. This was tracked with a flag called `isNewUser`.

If a user already had a Firestore document but was **missing mandatory fields** (e.g., they signed up before the profile form existed, or skipped fields somehow), they could log in and use the app without ever filling in required data like their university, WhatsApp number, or Vjudge ID.

**Goal:** Every user — new or old — must have all 6 mandatory fields filled before they can access the dashboard.

---

## Mandatory Fields

The following fields are required:

| Field | What it is |
|---|---|
| `fullName` | User's full name |
| `university` | College / university name |
| `batch` | Graduation year (e.g. 2025) |
| `branch` | Department (e.g. CSE, ECE) |
| `whatsapp` | WhatsApp phone number |
| `vjudgeId` | Vjudge username |

---

## Files Changed

| File | What changed |
|---|---|
| `src/context/AuthContext.jsx` | Added mandatory field check on login |
| `src/App.jsx` | Updated route guards to block incomplete profiles |
| `src/components/ProfileSetup/ProfileSetup.jsx` | Pre-fills existing data + safer save |

---

## 1. `AuthContext.jsx` — Detecting Incomplete Profiles

### What changed

```jsx
// BEFORE
if (userDoc.exists()) {
  setUser({ ...currentUser, ...userDoc.data() });
}

// AFTER
if (userDoc.exists()) {
  const data = userDoc.data();
  const mandatoryFields = ['fullName', 'university', 'batch', 'branch', 'whatsapp', 'vjudgeId'];
  const isProfileIncomplete = mandatoryFields.some(
    field => !data[field] || data[field].toString().trim() === ''
  );
  setUser({ ...currentUser, ...data, isProfileIncomplete });
}
```

### Why

This is where user data is loaded from Firestore every time someone logs in. Before, it just merged the Firestore data onto the user object with no checks.

Now it runs a check across all 6 mandatory fields using `.some()`. If **even one** field is missing or empty (including whitespace-only strings), `isProfileIncomplete` is set to `true` on the user object. This flag is what the route guards (in `App.jsx`) use to decide whether to block access.

> **Note:** `isNewUser` (for users with no Firestore doc at all) is unchanged. `isProfileIncomplete` is a separate flag that only applies to users who already have a doc but are missing fields.

---

## 2. `App.jsx` — Route Guards

Three places were updated.

### a) `AuthGuard` — Blocks access to the dashboard

```jsx
// BEFORE
if (user.isNewUser) {
  return <Navigate to="/profile-setup" replace />;
}

// AFTER
if (user.isNewUser || user.isProfileIncomplete) {
  return <Navigate to="/profile-setup" replace />;
}
```

**Why:** `AuthGuard` wraps all authenticated routes (home, DSA, contests, blogs, etc.). Previously it only blocked new users. Now it blocks anyone with an incomplete profile — they get redirected to `/profile-setup` instead of the page they're trying to visit.

---

### b) `LoginRoute` — Handles the `/login` page redirect after sign-in

```jsx
// BEFORE
if (user && !user.isNewUser) return <Navigate to={from} replace />;
if (user?.isNewUser) return <Navigate to="/profile-setup" replace />;

// AFTER
if (user?.isNewUser || user?.isProfileIncomplete) return <Navigate to="/profile-setup" replace />;
if (user) return <Navigate to={from} replace />;
```

**Why:** After signing in, if the user has an incomplete profile they should go to `/profile-setup` — not to wherever they came from. The order of checks matters: profile completion is checked **first**, before the `from` redirect.

---

### c) `/profile-setup` Route — Allows incomplete-profile users through

```jsx
// BEFORE
element={user && user.isNewUser ? <ProfileSetup /> : <Navigate to={user ? "/home" : "/login"} replace />}

// AFTER
element={user && (user.isNewUser || user.isProfileIncomplete) ? <ProfileSetup /> : <Navigate to={user ? "/home" : "/login"} replace />}
```

**Why:** This route guard controls who can even visit the `/profile-setup` page. Before, only `isNewUser` could access it. An existing user with `isProfileIncomplete: true` would have been bounced back to `/home`. Now both flags are accepted.

---

## 3. `ProfileSetup.jsx` — Better Form Behaviour

### a) Pre-filling existing data

```jsx
// BEFORE
const [formData, setFormData] = useState({
  fullName: user?.displayName || '',
  university: '',
  batch: '',
  // ...all blank
});

// AFTER
const [formData, setFormData] = useState({
  fullName:   user?.fullName   || user?.displayName || '',
  university: user?.university || '',
  batch:      user?.batch      || '',
  branch:     user?.branch     || '',
  whatsapp:   user?.whatsapp   || '',
  vjudgeId:   user?.vjudgeId   || ''
});
```

**Why:** Returning users (who already have some fields filled in) shouldn't have to re-enter data they've already provided. Now the form pre-populates with whatever is already saved in Firestore. They only need to fill in the fields that are actually missing.

---

### b) `setDoc` with `merge: true`

```jsx
// BEFORE
await setDoc(userDocRef, newUserData);

// AFTER
await setDoc(userDocRef, newUserData, { merge: true });
```

**Why:** Without `{ merge: true }`, `setDoc` **completely overwrites** the Firestore document. This would have deleted fields like `role`, `solvedProblems`, `createdAt`, and any other data stored on the user. With `merge: true`, only the fields explicitly in `newUserData` are updated — everything else is preserved.

---

### c) Clearing `isProfileIncomplete` from context after save

```jsx
// BEFORE
setUser({ ...user, ...newUserData, isNewUser: false });

// AFTER
setUser({ ...user, ...newUserData, isNewUser: false, isProfileIncomplete: false });
```

**Why:** After the user successfully fills in and submits the profile form, the route guards would still redirect them if `isProfileIncomplete` remained `true` in the React context (even if Firestore is now up to date). Explicitly setting it to `false` tells the guards that the profile is complete, so `navigate('/home')` actually works.

---

## Complete Flow After Changes

```
User logs in (new or existing)
    ↓
AuthContext fetches Firestore doc
    ↓
  ┌─ No doc found?          → isNewUser: true
  └─ Doc found but missing  → isProfileIncomplete: true
     any mandatory field?
    ↓
AuthGuard / LoginRoute checks flags
    ↓
  isNewUser or isProfileIncomplete? → redirect to /profile-setup
    ↓
ProfileSetup shows form pre-filled with existing data
    ↓
User fills in missing fields and submits
    ↓
setDoc (merge) saves only changed fields
Context updated: isProfileIncomplete: false
    ↓
navigate('/home') → dashboard loads normally ✅
```

---

## What Was NOT Changed

- The `ProfileSetup` UI/form fields themselves are unchanged
- The admin `role` and `solvedProblems` data on existing users is now **protected** by `merge: true` (previously it was at risk of being wiped)
- New user flow (`isNewUser`) still works exactly as before
