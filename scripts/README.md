# Exercise Import Scripts

This directory contains scripts to import all 881 exercises from Supabase storage into the application.

## Problem

The Supabase exercise-images bucket is **public for downloads** but **not for listing** with the publishable key. This is a common security practice - anyone can view images if they know the URL, but they can't list all files in the bucket.

## Solution Options

You have **3 options** to import all exercises:

---

### Option 1: Use Service Role Key (Recommended)

The service role key has full access and can list bucket contents.

**Steps:**
1. Get your Supabase service role key from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Add it to `.env`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Run the fetch script:
   ```bash
   npx tsx scripts/fetch-exercises.ts
   ```

**⚠️ SECURITY WARNING:** Never commit the service role key to git! It has full database access.

---

### Option 2: Export from Supabase Dashboard

Manually export the list of folders from Supabase Dashboard.

**Steps:**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/storage/buckets/exercise-images
2. You should see all exercise folders (881 folders)
3. There might be an export option, OR you can:
   - Open browser console (F12)
   - Run this JavaScript to get all folder names:
     ```javascript
     // This will copy all folder names to clipboard
     const folders = document.querySelectorAll('[data-type="folder"]');
     const names = Array.from(folders).map(f => f.textContent.trim());
     copy(names.join('\n'));
     ```
4. Save the list to: `data/exercise-folder-names.txt` (one name per line)
5. Run the import script:
   ```bash
   npx tsx scripts/import-exercises-from-list.ts
   ```

---

### Option 3: Use Supabase API Directly

If you have access to the Supabase SQL editor, you can query the storage schema:

**Steps:**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
2. Run this SQL query:
   ```sql
   SELECT DISTINCT
     split_part(name, '/', 1) as folder_name
   FROM storage.objects
   WHERE bucket_id = 'exercise-images'
   AND name LIKE '%/%'
   ORDER BY folder_name;
   ```
3. Export the results to CSV
4. Extract the folder names column to `data/exercise-folder-names.txt`
5. Run:
   ```bash
   npx tsx scripts/import-exercises-from-list.ts
   ```

---

## Scripts Available

### `verify-supabase-connection.ts`

Tests your Supabase connection and checks permissions.

```bash
npx tsx scripts/verify-supabase-connection.ts
```

**Output:**
- ✅ Verifies images are accessible
- ❌ Shows if listing is permitted
- 💡 Provides next steps

---

### `fetch-exercises.ts`

Fetches all exercise folders directly from Supabase (requires service role key).

```bash
# With service role key in .env
npx tsx scripts/fetch-exercises.ts
```

**Output:**
- `data/generated-exercises.json` - All exercise data
- `data/exercise-summary.json` - Statistics and breakdown

---

### `import-exercises-from-list.ts`

Imports exercises from a text file list of folder names.

```bash
npx tsx scripts/import-exercises-from-list.ts
```

**Requires:**
- `data/exercise-folder-names.txt` - One folder name per line

**Output:**
- `data/generated-exercises.json` - All exercise data
- `data/exercise-summary.json` - Statistics and breakdown

---

## What Happens Next

After running either script successfully:

1. **Review** the generated exercises in `data/generated-exercises.json`

2. **Check category assignments**
   - Auto-detected from exercise names
   - May need manual corrections

3. **Add overrides** to `lib/exercise-name-mapping.ts`
   ```typescript
   export const EXERCISE_NAME_OVERRIDES: Record<string, ExerciseOverride> = {
     'one-arm-kettlebell-military-press-to-the-side': {
       name: 'Single Arm Kettlebell Military Press',
       category: 'shoulders',
       level: 'advanced',
     },
     // Add more...
   }
   ```

4. **Import to mock data**
   - The generated file will be used to update `lib/mock-data/exercises.ts`

---

## Troubleshooting

### "No exercise folders found"
- You're using the publishable key (doesn't have list permission)
- Use Option 1 (service role key) or Option 2 (manual export)

### "Image not found"
- The exercise folder name might be incorrect
- Verify the folder exists in Supabase Dashboard

### "TypeScript errors"
- Make sure `tsx` is installed: `npm install --save-dev tsx`
- Check your Node.js version: `node --version` (should be >= 16)

---

## Status

- ✅ Images are accessible at public URLs
- ✅ Supabase connection works
- ❌ Listing requires service role key or manual export
- 📊 Expected: ~881 exercises

**Current exercises in mock data:** 22
**Target:** 881

---

## Need Help?

Check the verification script output:
```bash
npx tsx scripts/verify-supabase-connection.ts
```

This will tell you exactly what permissions you have and suggest next steps.
