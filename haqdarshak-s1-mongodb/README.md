# Haqdarshak Scheme Knowledge Base — S1 (MongoDB)

A backend starter for the **Review and Publish Backend** case study, implemented with Node.js, Express, MongoDB and Mongoose.

## Features

- `STATE_REVIEWER` creates and edits drafts.
- `CENTRAL_REVIEWER` approves or returns drafts with comments.
- Draft lifecycle: `DRAFT → IN_REVIEW → PUBLISHED` or `RETURNED`.
- Creator cannot approve their own version.
- Published scheme data is served through a stable `publishedVersionId` pointer.
- New edits create a new version; published versions are not edited.
- Field-level change history stores old value, new value, actor, timestamp and source when present in the data.
- Shared eligibility rule updates create review-required audit events for all linked schemes. Published scheme data is not silently changed.

## Tech stack

Node.js 20+, Express 5, MongoDB, Mongoose, JWT, bcrypt, Zod.

## Setup

1. Install Node.js 20+ and run MongoDB locally, or create a MongoDB Atlas cluster.
2. Extract this project and open it in VS Code.
3. Install dependencies:

```bash
npm install
```

4. Copy `.env.example` to `.env` and set `MONGODB_URI` and a strong `JWT_SECRET`.

Local MongoDB:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/haqdarshak_s1
```

MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/haqdarshak_s1?retryWrites=true&w=majority
```

5. Seed demo accounts and data:

```bash
npm run seed
```

6. Start the server:

```bash
npm run dev
```

Health check: `GET http://localhost:5000/health`

## Demo accounts

Password for both demo users: `Pass@123` (development only).

- State reviewer: `state@haqdarshak.test`
- Central reviewer: `central@haqdarshak.test`

Do not use these credentials in production.

## API

All `/api` endpoints except `/api/auth/login` require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/schemes` | Create scheme and first draft |
| POST | `/api/schemes/:schemeId/drafts` | Create next version draft |
| PATCH | `/api/versions/:versionId` | Edit own draft |
| POST | `/api/versions/:versionId/submit` | Submit for review |
| POST | `/api/versions/:versionId/review` | Approve or return |
| GET | `/api/schemes/:schemeId/published` | Read currently published version |
| GET | `/api/schemes/:schemeId/versions` | View version history |
| GET | `/api/versions/:versionId/changes` | View field-level audit |
| POST | `/api/schemes/:schemeId/rules/:ruleId` | Link a shared eligibility rule |
| PATCH | `/api/rules/:ruleId` | Update shared rule and flag linked schemes |

### Example: create a scheme

```json
{
  "schemeCode": "MH-STUDENT-001",
  "name": "Maharashtra Student Support",
  "data": {
    "benefitAmount": {
      "value": 6000,
      "currency": "INR",
      "frequency": "yearly",
      "source": "https://example.gov.in/scheme.pdf",
      "page": 4
    },
    "deadline": "2026-12-31"
  }
}
```

### Review decision

Approve:
```json
{ "decision": "APPROVE" }
```

Return:
```json
{ "decision": "RETURN", "comment": "Attach a source for benefitAmount." }
```

## Important MongoDB design decision

`Scheme` stores a `publishedVersionId` pointer. Drafts and review versions are separate documents in `SchemeVersion`. The citizen/agent read endpoint follows only that pointer, so an in-progress draft cannot leak to public consumers.

Approval updates the previous version, new version and scheme pointer in one MongoDB transaction. **Transactions require a replica set**. MongoDB Atlas supports this; for local development, use a single-node replica set rather than a standalone `mongod`. If your local MongoDB is standalone, the approve endpoint will fail when it attempts a transaction.

## Assumptions

- A scheme has one current published version and at most one active draft/review version.
- State reviewers own the drafts they create.
- Central reviewers approve or return submissions and manage shared rules.
- Variable scheme fields are stored as flexible objects (`Mixed`) while workflow metadata remains structured.
- Seed source references are synthetic examples, not verified government sources.

## Intentionally out of scope

- React admin dashboard.
- Production security hardening: refresh token rotation, MFA, rate limiting, password reset.
- Document upload and full evidence schema validation.
- Fine-grained state/department permissions.
- Email/WhatsApp notifications.
- Automatic re-evaluation of every scheme after a shared-rule change; affected schemes are flagged for human review.
- Full database-backed integration tests. The included test records acceptance requirements only; it is not proof that the workflow has passed.

## 10-minute walkthrough

1. Explain the risk: unapproved information must never reach agents or citizens.
2. Login as state reviewer, create a draft and submit it.
3. Login as central reviewer and approve or return it.
4. Create a new draft after publishing; show the published endpoint still returns the previous version.
5. Show version history and field-level change history.
6. Explain the MongoDB published pointer and transaction.
7. Explain what you would add next: evidence validation, integration tests, monitoring, queue-based review workload and jurisdiction-level permissions.

## What breaks first at 5,000 schemes?

Raw MongoDB document count is unlikely to be the first bottleneck. Review workload, source freshness, inconsistent evidence and poor change detection are more serious. Add indexes for common filters, pagination, monitoring, background jobs and review queues. Validate source evidence before publication.

## Bug found two days before go-live

Reproduce the bug, assess citizen impact, and tell the engineering lead and programme owner immediately. If it can publish incorrect or unapproved data, recommend blocking the release or disabling the affected path. Ship only after the fix is reviewed and regression-tested; communicate any schedule impact clearly.

## AI assistance disclosure

AI may have been used to scaffold boilerplate and suggest implementation structure. The developer must run and verify the project, complete integration tests, and be able to explain every authorization, versioning and publication decision. Do not claim tests pass unless you have run them against MongoDB.
