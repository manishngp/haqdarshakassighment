# Haqdarshak React Review Dashboard

React + Vite frontend for the S1 MongoDB/Express backend.

## 1. Install and run

Keep the backend running on `http://localhost:5000`.

```bash
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell environment-file command:
```powershell
Copy-Item .env.example .env
```

Open `http://localhost:5173`.

If your backend runs on another URL, update `VITE_API_URL` in `.env`, then restart Vite.

## 2. Demo accounts

- State reviewer: `state@haqdarshak.test` / `Pass@123`
- Central reviewer: `central@haqdarshak.test` / `Pass@123`

## 3. Important: add the scheme-list endpoint

The backend currently exposes create, version history, published read and review endpoints, but it does **not** expose `GET /api/schemes`. The dashboard needs a list endpoint. Add this route to `src/routes.js`, after `router.use(requireAuth);` and before the other scheme routes:

```js
router.get("/schemes", asyncHandler(async (req, res) => {
  const schemes = await Scheme.find().sort({ updatedAt: -1 }).lean();
  const rows = await Promise.all(schemes.map(async (scheme) => {
    const latestVersion = await SchemeVersion.findOne({ schemeId: scheme._id })
      .sort({ version: -1 })
      .populate("createdById", "name role")
      .lean();
    return { ...scheme, latestVersion };
  }));
  res.json({ schemes: rows });
}));
```

Restart the backend after adding it. For a larger dataset, replace this simple implementation with pagination and indexed filtering.

## 4. Implemented screens

- Login with role-aware session state.
- Dashboard with scheme list, status counts and search.
- State reviewer: create draft, edit JSON, submit for review, create next version after publication.
- Central reviewer: approve/publish or return with a required comment.
- Version history and field-level change log.
- Responsive layout and API error handling.

## 5. API contract used

- `POST /auth/login` returns `{ token, user }`.
- `POST /schemes` returns `{ scheme, version }`.
- `GET /schemes` returns `{ schemes: [{ ..., latestVersion }] }` (add the route above).
- `GET /schemes/:schemeId/versions` returns a version array.
- `PATCH /versions/:versionId` accepts `{ data }`.
- `POST /versions/:versionId/submit`.
- `POST /versions/:versionId/review` accepts `{ decision: "APPROVE" }` or `{ decision: "RETURN", comment }`.
- `POST /schemes/:schemeId/drafts` accepts `{ data }`.
- `GET /versions/:versionId/changes` returns the field change array.

## 6. Notes / limitations

- The current backend does not expose scheme listing; the small route addition above is required for the dashboard.
- The dashboard currently displays the latest version for each scheme. A production review queue should have server-side filters, pagination and ownership/jurisdiction scopes.
- The scheme editor uses JSON so variable scheme fields can be edited without assuming a fixed government scheme schema.
- Authentication token is stored in localStorage for this case-study demo. Production should prefer secure, HttpOnly cookie-based sessions or another reviewed token-storage strategy, plus CSRF protections as applicable.
- The frontend does not replace backend authorization. Backend role checks remain authoritative.
- The included backend acceptance-test placeholder is not a substitute for integration tests. Verify all flows against your MongoDB replica-set/Atlas environment before presenting.
