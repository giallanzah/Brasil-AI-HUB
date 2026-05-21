# Security Specification for Brasil Startups Hub

## Data Invariants
1. **User Identity Isolation**: A user can only read and write their own document in `users` and `presence` collections.
2. **Presence Integrity**: The `presence` document ID must match the `request.auth.uid`.
3. **Temporal Validity**: Both `lastSeen` in `users` and `updatedAt` in `presence` must be strictly set to the server timestamp (`request.time`).
4. **Coordinate Safety**: `x` and `y` coordinates must be numbers.
5. **Presence Required Fields**: On creation, a presence document must include `x`, `y`, `userId`, `scene`, and `updatedAt`.

## The "Dirty Dozen" Payloads (Targets for PERMISSION_DENIED)

| # | Action | Collection | Description | Payload / Scenario |
|---|--------|------------|-------------|-------------------|
| 1 | Create | users | Spoofing UID | `uid: "attacker", data: { displayName: "Spoofed" }` where `auth.uid` is "victim" |
| 2 | Update | users | Overwriting someone else's profile | Update `users/victim` as `auth.uid="attacker"` |
| 3 | Update | users | Setting `lastSeen` to past date | `{ lastSeen: "2000-01-01T00:00:00Z" }` |
| 4 | Create | presence | Ghost Field Injection | `{ x: 10, y: 10, ghost: "extra_data" }` (Strict keys) |
| 5 | Update | presence | Moving another user | Update `presence/victim` as `auth.uid="attacker"` |
| 6 | Update | presence | Skipping `updatedAt` | `{ x: 20 }` without updating `updatedAt` to `request.time` |
| 7 | Create | users | Setting non-enum status | `{ status: "hacking" }` |
| 8 | Create | presence | Non-numeric coordinates | `{ x: "ten", y: 10 }` |
| 9 | List | users | Blanket read without query filter | `getDocs(collection(db, "users"))` (Rules must enforce `resource.data.userId == request.auth.uid` if privacy is required, but here we might allowed listing others? No, Gather.town needs to see others. So visibility is public? Yes, visibility is public for presence/profile in an office.) |
| 10| Delete | users | Deleting someone else | `deleteDoc(doc(db, "users/victim"))` |
| 11| Create | presence | Unauthorized Scene | `{ scene: "admin_only_room" }` (If we had room parity) |
| 12| Create | users | Large Display Name | `{ displayName: "A".repeat(2000) }` (Data poisoning) |

## Test Runner (Draft)

```typescript
// firestore.rules.test.ts (Pseudo-code as per skill)
// We would test the Dirty Dozen here.
```

## Visibility Decisions
In an office environment:
- `users`: Everyone can read everyone's profile (`displayName`, `photoURL`, `status`). Only the owner can write.
- `presence`: Everyone can read everyone's real-time position. Only the owner can write.

Wait, if PII (email) is in `users`, it should be protected.
The blueprint has `displayName`, `photoURL`, `status`, `lastSeen`. These are likely public in an office.
Email is NOT in the blueprint property list, so it's fine.
Actually, I should add `email` to the blueprint but mark it as private? The skill recommends Split Collection.
Let's keep `users/{userId}` for public profile and `users/{userId}/private/info` for private data.

Actually, for MVP, let's keep it simple: `users/{userId}` is what people see.

Let's refine the rules logic.
Public read for all users.
Write restricted to owner.
Strict validation.
