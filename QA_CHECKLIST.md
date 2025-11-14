# Push 1.01 - QA Acceptance Checklist

## Test Environment

- **Branch**: `push/01-01-flex-outline-slices`
- **Test URL**: http://localhost:3000
- **Browser**: Chrome/Firefox/Safari
- **Date Tested**: ******\_\_\_******
- **Tester**: ******\_\_\_******

## Pre-Test Setup

1. ✅ Dev server running: `npm run dev`
2. ✅ Build successful: `npm run build` (no errors)
3. ✅ TypeScript check: `npm run typecheck` (no errors)
4. ✅ Database seeded: Visit /editor (auto-seeds on first load)

## Acceptance Criteria

### 1. Create Arbitrary Hierarchies ✓ / ✗

**Test Steps**:

1. Open Command Palette (⌘/Ctrl + K)
2. Select "New heading at path…"
3. Enter: `#Cities/Tokyo`
4. Verify: Creates "Cities" and "Tokyo" headings
5. Repeat with: `#Trading/Volume-Profile`
6. Navigate to /editor to see the created structure

**Expected Result**:

- [ ] Missing intermediate headings are auto-created
- [ ] Paths are hierarchical (Tokyo under Cities, Volume-Profile under Trading)
- [ ] Headings appear in the outliner
- [ ] Can navigate (fold/zoom) into created headings

**Screenshot**: ******\_\_\_******

---

### 2. Refile Blocks to New Paths ✓ / ✗

**Test Steps**:

1. In /editor, select any block
2. Press `M` key (opens refile dialog)
3. Enter a path like `#Projects/Q1`
4. Click "Move here"
5. Verify block is relocated under Projects/Q1

**Expected Result**:

- [ ] Refile dialog opens with path input
- [ ] Creates missing headings (Projects, Q1)
- [ ] Block moves to new location
- [ ] Original location no longer shows the block
- [ ] New location shows the block as a child

**Screenshot**: ******\_\_\_******

---

### 3. Add Properties to Blocks ✓ / ✗

**Test Steps**:

1. Navigate to /editor
2. Find a block (e.g., "Tsujiri Coffee")
3. Click "+ Add property" button
4. Enter:
   - Key: `category`
   - Type: `string`
   - Value: `coffee`
5. Save and verify chip appears
6. Repeat with:
   - Key: `visited`, Type: `boolean`, Value: `false`
   - Key: `risk_reward`, Type: `number`, Value: `2.5`

**Expected Result**:

- [ ] Property editor dialog opens
- [ ] Can enter key, select type, enter value
- [ ] Property saves and chip appears below block
- [ ] Chips are color-coded by type (gray=string, green/red=boolean, blue=number)
- [ ] Can click chip to edit
- [ ] Can delete property (X button on hover)

**Screenshots**:

- Property editor: ******\_\_\_******
- Property chips: ******\_\_\_******

---

### 4. Create Global Slice ✓ / ✗

**Test Steps**:

1. Open Command Palette (⌘/Ctrl + K)
2. Select "New Slice"
3. Enter:
   - Name: `Coffee Shops`
   - Scope: `Global`
   - Query: `prop.category=coffee`
   - Columns: Select `title`, `path`, `prop.category`, `prop.visited`, `prop.rating`
4. Save
5. Navigate to /slices
6. Click on "Coffee Shops" slice

**Expected Result**:

- [ ] Slice builder opens with all fields
- [ ] Can select scope (Global)
- [ ] Can enter DSL query
- [ ] Can select multiple columns
- [ ] Preview button shows match count
- [ ] Slice appears in /slices list
- [ ] Clicking slice opens table view with matching results

**Screenshots**:

- Slice builder: ******\_\_\_******
- Slice list: ******\_\_\_******
- Table view: ******\_\_\_******

---

### 5. Create Scoped Slice with Filters ✓ / ✗

**Test Steps**:

1. Create a new slice:
   - Name: `Unvisited Coffee Shops`
   - Scope: `Scoped to subtree` → Select "Cities"
   - Query: `prop.category=coffee AND prop.visited=false`
   - Columns: `title`, `prop.category`, `prop.visited`, `prop.rating`
2. Navigate to /slices and open it

**Expected Result**:

- [ ] Can scope to specific subtree
- [ ] AND conjunctions work in query
- [ ] Table shows only matching blocks (unvisited coffee shops under Cities)
- [ ] Columns show correct property values
- [ ] Empty cells show "—" for missing properties

**Screenshot**: ******\_\_\_******

---

### 6. Create Numeric Comparison Slice ✓ / ✗

**Test Steps**:

1. Create slice:
   - Name: `High R:R Strategies`
   - Scope: `Global`
   - Query: `path:/Trading/* AND prop.risk_reward>=2`
   - Columns: `title`, `path`, `prop.setup`, `prop.risk_reward`, `prop.winrate`
2. View in table

**Expected Result**:

- [ ] Numeric comparisons work (>=, <=, >, <)
- [ ] Path glob matching works (`/Trading/*`)
- [ ] Table shows only strategies with risk_reward >= 2
- [ ] Numbers display correctly in cells
- [ ] Can sort by numeric columns

**Screenshot**: ******\_\_\_******

---

### 7. View Slice as Block ✓ / ✗

**Test Steps**:

1. Navigate to /slices
2. Note the "Coffee Shops" slice
3. Click "Open" button
4. Verify URL is `/blocks/[some-id]`
5. Verify table view renders in block page

**Expected Result**:

- [ ] Slice is stored as a ViewBlock in the database
- [ ] ViewBlock appears in outline under "Views" heading
- [ ] Opening slice navigates to `/blocks/[id]`
- [ ] Block page detects type="view" and renders TableView
- [ ] Table shows query results

**Screenshot**: ******\_\_\_******

---

### 8. Refile a Slice ViewBlock ✓ / ✗

**Test Steps**:

1. In /editor, navigate to "Views" heading
2. Find a slice ViewBlock (e.g., "Coffee Shops")
3. Press `M` to refile
4. Move to `#Projects/Analytics`
5. Verify slice still works after moving

**Expected Result**:

- [ ] Can refile ViewBlock like any other block
- [ ] Slice data persists (still links to same slice record)
- [ ] Opening the slice still works
- [ ] Query still executes correctly
- [ ] Scope and DSL unchanged

**Screenshot**: ******\_\_\_******

---

### 9. Persistence Across Reloads ✓ / ✗

**Test Steps**:

1. Create a new heading at `#Test/Persistence`
2. Add properties: `test=true`, `value=42`
3. Create a slice filtering for `prop.test=true`
4. Reload the browser (⌘/Ctrl + R)
5. Navigate back to /editor
6. Verify all data persists

**Expected Result**:

- [ ] Blocks persist across reloads
- [ ] Properties persist
- [ ] Slices persist
- [ ] Dexie (IndexedDB) maintains all data
- [ ] No data loss on refresh

**Screenshot**: ******\_\_\_******

---

### 10. Database Reset and Reseed ✓ / ✗

**Test Steps**:

1. Navigate to /editor
2. Click "Reset Database" button
3. Confirm the action
4. Verify database clears and reloads seed data
5. Check that demo data (Cities, Trading) appears

**Expected Result**:

- [ ] Reset button works
- [ ] Confirmation dialog appears
- [ ] Database clears completely
- [ ] Seed data loads automatically
- [ ] Demo blocks appear (Tokyo, Kyoto, Trading strategies)
- [ ] Demo properties appear
- [ ] Demo slices appear

**Screenshot**: ******\_\_\_******

---

### 11. Accessibility - Keyboard Navigation ✓ / ✗

**Test Steps**:

1. In /editor, use only keyboard:
   - Tab through elements
   - Navigate with ↑/↓ arrows
   - Create blocks with Enter
   - Indent with Tab
   - Move with Alt+↑/↓
2. Use Tab to navigate through Command Palette
3. Use Tab through slice builder form
4. Navigate table with keyboard

**Expected Result**:

- [ ] All interactive elements are reachable with Tab
- [ ] Focus indicators are visible (rings/outlines)
- [ ] Arrow keys navigate between blocks
- [ ] Enter/Tab shortcuts work as documented
- [ ] Dialogs trap focus properly
- [ ] Can close dialogs with Escape

**Screenshot**: ******\_\_\_******

---

### 12. Accessibility - Screen Reader Labels ✓ / ✗

**Test Steps**:

1. Inspect elements in browser DevTools
2. Check for `aria-label`, `aria-expanded`, `role` attributes
3. Verify form inputs have associated labels
4. Check table has proper semantic HTML

**Expected Result**:

- [ ] Buttons have aria-label attributes
- [ ] Form fields have labels
- [ ] Outliner has proper ARIA tree semantics
- [ ] Table has thead/tbody/th/td structure
- [ ] Dialogs have proper ARIA attributes

---

## Edge Cases & Error Handling

### 13. Empty Property List ✓ / ✗

**Test**: Create a new heading, verify it shows only "+ Add property" button

- [ ] No errors when no properties exist
- [ ] Button is clickable

---

### 14. Invalid JSON Property ✓ / ✗

**Test**: Try to create a JSON property with invalid JSON `{invalid`

- [ ] Shows error message
- [ ] Doesn't save
- [ ] User-friendly error text

---

### 15. Empty DSL Query ✓ / ✗

**Test**: Try to create a slice with empty query

- [ ] Validation error shown
- [ ] Can't save without query

---

### 16. Very Long Property Values ✓ / ✗

**Test**: Add property with value > 100 characters

- [ ] Chip truncates display
- [ ] Full value shown in editor
- [ ] No layout breaking

---

### 17. Duplicate Property Keys ✓ / ✗

**Test**: Add two properties with same key

- [ ] Both properties save (current behavior)
- [ ] Console warning logged (optional)
- [ ] No crash

---

## Performance Tests

### 18. Large Dataset ✓ / ✗

**Test**: Create 100+ blocks and properties

- [ ] Outliner remains responsive
- [ ] Table view loads in <2 seconds
- [ ] No noticeable lag when typing

---

### 19. Complex Queries ✓ / ✗

**Test**: Create query with multiple AND conditions

- [ ] Query executes successfully
- [ ] Results are accurate
- [ ] Performance is acceptable

---

## Browser Compatibility

### 20. Cross-Browser Testing ✓ / ✗

**Test in**:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

All core features work in all browsers

---

## Build & Deploy

### 21. Production Build ✓ / ✗

**Test**:

```bash
npm run build
npm start
```

- [ ] Build completes without errors
- [ ] Production app runs at http://localhost:3000
- [ ] Service Worker registers (check DevTools > Application)
- [ ] Manifest is valid

---

## Summary

**Total Tests**: 21
**Passed**: **_ / 21
**Failed**: _** / 21
**Blocked**: \_\_\_ / 21

### Critical Issues

(List any critical bugs found)

---

### Notes

(Additional observations, UX feedback, suggestions)

---

### Screenshots / GIFs

(Attach or link to visual documentation)

---

## Sign-off

**QA Tester**: ******\_\_\_******
**Date**: ******\_\_\_******
**Status**: ✅ PASS / ❌ FAIL / ⚠️ CONDITIONAL PASS
