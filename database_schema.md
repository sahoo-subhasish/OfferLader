# Firebase Firestore Database Schema

This document outlines the Firestore Collections and Document structures for the Algo2Offer project. This serves as a reference for developers and AI agents to understand the data architecture.

## Collections

### 1. `users` (Active)
This collection holds all data specific to a user, including authentication metadata (if needed eventually) and their progress tracking across all problem sets.

**Document ID**: Firebase Authentication UID (`user.uid`)

**Fields:**
- `solvedProblems` (Map): A dictionary tracking the solve status of problems using the problem ID.
  - Key `[String]`: The unique problem ID (e.g., `"t2-311"`).
  - Value `[Boolean]`: The boolean status indicating if it is solved (e.g., `true`).

*Example Document:*
```json
// Document ID: "aB3cD4eF5gH6iJ7..."" 
{
  "solvedProblems": {
    "b-1": true,
    "t2-311": true,
    "m-42": true 
  }
}
```

---

## Proposed Future Collections

As the project scales to include customizable questions, admin features, and deeper analytics, the following collections are proposed.

### `questions` (Proposed)
A global repository of problems so they can be managed via an Admin Dashboard instead of hardcoded JSON files.

**Document ID**: Auto-generated or custom specific short ID (e.g., `q_two_sum`)

**Fields:**
- `title` (String): e.g., "Two Sum"
- `topic` (String): e.g., "Arrays"
- `difficulty` (String): "Easy" | "Medium" | "Hard"
- `link` (String): Url to Leetcode/Platform
- `tier` (String): Which tier they belong to (e.g., "tier1", "basic", "master")

### `admins` (Proposed)
Configuration for platform administrators.

**Document ID**: Firebase Authentication UID

**Fields:**
- `email` (String)
- `roles` (Array of Strings): `["superadmin", "moderator"]`
- `createdAt` (Timestamp)
