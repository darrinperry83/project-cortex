# Property System Integration Guide

## Quick Integration into Node.tsx

Here's how to add property chips to the existing Node component:

### Step 1: Import PropertyChips

```tsx
import { PropertyChips } from "@/components/properties/PropertyChips";
```

### Step 2: Add PropertyChips to the Node render

Add the PropertyChips component after the main node content. Here's the modified Node component structure:

```tsx
export function Node({ block, ... }: NodeProps) {
  // ... existing state and handlers ...

  return (
    <div className="space-y-1">
      {/* Existing node row */}
      <div
        ref={nodeRef}
        tabIndex={0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={`
          flex items-center gap-2 py-1 px-2 cursor-pointer transition-colors
          ${getIndentationClass()}
          ${isSelected ? "bg-blue-50 ring-2 ring-blue-500 ring-inset" : "hover:bg-gray-100"}
        `}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? !isFolded : undefined}
        aria-level={level}
      >
        {renderChevron()}
        {renderTodoCheckbox()}
        {renderContent()}
        {renderTags()}
      </div>

      {/* Add PropertyChips - only show when node is selected or has properties */}
      {(isSelected || /* hasProperties check */) && (
        <div className={`${getIndentationClass()} pl-[2.5rem]`}>
          <PropertyChips blockId={block.id} />
        </div>
      )}
    </div>
  );
}
```

### Step 3: Optional - Add keyboard shortcut in Outliner.tsx

The Outliner already has a placeholder for property editor keyboard shortcut (`:` key):

```tsx
case ":":
  e.preventDefault();
  // Open property editor for selected block
  setPropertyEditorOpen(true);
  break;
```

You can implement this by:

1. Add state in Outliner.tsx:

```tsx
const [propertyEditorOpen, setPropertyEditorOpen] = useState(false);
```

2. Add the PropertyEditor component at the end of Outliner render:

```tsx
{
  selectedBlockId && propertyEditorOpen && (
    <PropertyEditor blockId={selectedBlockId} onClose={() => setPropertyEditorOpen(false)} />
  );
}
```

## Example: Minimal Integration

If you just want to test the components, add this to any page:

```tsx
"use client";

import { PropertyChips } from "@/components/properties";

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Property Test</h1>

      {/* Replace with any valid block ID from your seed data */}
      <PropertyChips blockId="city-tokyo" />
    </div>
  );
}
```

## Example: Add sample properties via browser console

Once your app is running, you can test by adding properties via the browser console:

```javascript
// Import Dexie instance
import { db } from "./lib/dexie";

// Add a string property
await db.props.add({
  id: crypto.randomUUID(),
  blockId: "city-tokyo",
  key: "category",
  kind: "string",
  s: "coffee shop",
});

// Add a number property
await db.props.add({
  id: crypto.randomUUID(),
  blockId: "city-tokyo",
  key: "rating",
  kind: "number",
  n: 4.5,
});

// Add a boolean property
await db.props.add({
  id: crypto.randomUUID(),
  blockId: "city-tokyo",
  key: "visited",
  kind: "boolean",
  b: true,
});

// Add a taglist property
await db.props.add({
  id: crypto.randomUUID(),
  blockId: "city-tokyo",
  key: "features",
  kind: "taglist",
  j: ["wifi", "quiet", "outdoor-seating"],
});
```

## Styling Adjustments

The PropertyChips component is designed to be minimal and non-intrusive. However, you can adjust styling:

### Option 1: Only show on hover/selection

```tsx
{
  isSelected && <PropertyChips blockId={block.id} />;
}
```

### Option 2: Always show but make compact

```tsx
<div className="text-xs">
  <PropertyChips blockId={block.id} />
</div>
```

### Option 3: Show inline with content

```tsx
<div className="flex items-center gap-4">
  <div className="flex-1">{renderContent()}</div>
  <PropertyChips blockId={block.id} />
</div>
```

## Testing the Property Editor

1. Start the dev server: `npm run dev`
2. Navigate to a page with blocks
3. Click "+ Add property" button
4. Fill in the form:
   - **Name**: Enter a property name (e.g., "status")
   - **Type**: Select a type from the dropdown
   - **Value**: Enter/select the value based on type
5. Click "Save"
6. The property chip should appear
7. Click the chip to edit it
8. Hover over the chip and click the X to delete it

## Keyboard Navigation

In the PropertyEditor dialog:

- `Tab` - Move between fields
- `Enter` - Save property (except in JSON textarea)
- `Escape` - Cancel and close

## Troubleshooting

### PropertyChips not showing

- Check that the blockId exists in the database
- Open browser DevTools and check for any console errors
- Verify the Dexie database is seeded: `await db.blocks.count()`

### Properties not persisting

- Check browser IndexedDB in DevTools (Application tab)
- Verify the Dexie tables are created correctly
- Check console for any transaction errors

### Styling issues

- Ensure Tailwind CSS is properly configured
- Check that all color utilities are available (blue-100, green-100, etc.)
- Use browser DevTools to inspect the rendered HTML

## Production Considerations

1. **Performance**: PropertyChips uses `useLiveQuery` which is reactive but efficient for small datasets. For large numbers of properties, consider pagination or lazy loading.

2. **Validation**: The PropertyEditor validates input, but consider adding server-side validation if you implement sync.

3. **Duplicate Keys**: The current implementation allows duplicate property keys. You may want to add validation to prevent this:

```tsx
const existingKeys = await db.props.where("blockId").equals(blockId).toArray();

if (existingKeys.some((p) => p.key === key && p.id !== propertyId)) {
  setError("A property with this name already exists");
  return { valid: false, value: {} };
}
```

4. **Property Limits**: Consider adding a maximum number of properties per block to prevent UI clutter.

5. **Bulk Operations**: For power users, consider adding:
   - Copy/paste properties between blocks
   - Bulk edit multiple properties
   - Property templates
