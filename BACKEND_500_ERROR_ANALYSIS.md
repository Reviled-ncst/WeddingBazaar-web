# Backend 500 Error Analysis - /api/admin/documents

## Issue Summary
The `/api/admin/documents` endpoint is returning a 500 Internal Server Error when called from the frontend.

## Root Cause Investigation

### 1. Route Configuration
The route is properly configured in two places:
- **Primary**: `backend-deploy/routes/admin.cjs` (line 744)
- **Secondary**: `backend-deploy/routes/admin/documents.cjs` (separate module, but not currently imported)

### 2. Potential Issues Found

#### Issue A: Table Existence
The code queries `vendor_documents` table, but we need to verify:
- Does the table exist in production database?
- Are column names correct?
- Is there data in the table?

#### Issue B: Query Syntax
In `admin.cjs` line 754-778, the query uses template literals with the `sql` tagged template:
```javascript
if (status && status !== 'all') {
  query = sql`
    SELECT ... FROM vendor_documents
    WHERE verification_status = ${status}
    ORDER BY uploaded_at DESC
  `;
} else {
  query = sql`
    SELECT ... FROM vendor_documents
    ORDER BY uploaded_at DESC
  `;
}
const documents = await query;
```

**Potential Problem**: The `sql` tagged template from `@neondatabase/serverless` might need to be called immediately, not assigned to a variable first.

#### Issue C: Module Not Found
There's a separate module `backend-deploy/routes/admin/documents.cjs` with better implementations, but it's not being used.

## Recommended Fixes

### Fix 1: Correct Query Execution Pattern
Change from:
```javascript
let query;
if (status) {
  query = sql`...`;
} else {
  query = sql`...`;
}
const documents = await query;
```

To:
```javascript
let documents;
if (status && status !== 'all') {
  documents = await sql`
    SELECT ... FROM vendor_documents
    WHERE verification_status = ${status}
    ORDER BY uploaded_at DESC
  `;
} else {
  documents = await sql`
    SELECT ... FROM vendor_documents
    ORDER BY uploaded_at DESC
  `;
}
```

### Fix 2: Use Dedicated Documents Module
Option: Import and use the properly structured `admin/documents.cjs` module instead of the inline route in `admin.cjs`.

### Fix 3: Add Better Error Logging
The current error handler logs to console, but we need to see:
- Exact SQL error message
- Stack trace
- Query that failed

## Next Steps
1. ✅ Identify the exact SQL error from production logs
2. Apply Fix 1 (correct query execution pattern)
3. Test locally if possible
4. Deploy fix to Render
5. Verify in production

## Files to Modify
- `backend-deploy/routes/admin.cjs` (lines 744-831)
