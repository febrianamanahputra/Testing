# Security Spec

## 1. Data Invariants
- A workspace must contain a bounded aclEmails array including the owner's email.
- A material cannot exist without a valid workspaceId and matching aclEmails.
- History aclEmails must match the material's aclEmails during creation.
- A history record must belong to a material.
- Timestamps must be strictly enforced using request.time.

## 2. Dirty Dozen Payloads
1. Create workspace missing ownerId
2. Create workspace with aclEmails > 20 items
3. Update workspace adding a member, but modifying ownerId
4. Read workspace without being in aclEmails
5. Create material missing aclEmails array
6. Read material without being in aclEmails
7. Update material modifying workspaceId
8. Update material injecting unknown fields (e.g. isAdmin)
9. Create history missing aclEmails
10. Read history without being in aclEmails
11. Very large string payload in a string field
12. Attempt to bypass using unverified email

## 3. The Test Runner
(Will be implemented in firestore.rules.test.ts)

