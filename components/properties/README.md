# Property System Components

This directory contains the property editor system for Project Cortex, implementing an EAV (Entity-Attribute-Value) model for blocks.

## Components

### PropertyChips

A display component that shows all properties for a given block as colored chips/badges.

**Usage:**

```tsx
import { PropertyChips } from "@/components/properties/PropertyChips";

function MyComponent() {
  return <PropertyChips blockId="city-tokyo" />;
}
```

**Props:**

- `blockId: string` - The ID of the block to display properties for

**Features:**

- Color-coded chips by property type
- Click to edit any property
- Delete button on hover
- "+ Add property" button
- Reactive updates using Dexie live queries

**Color Scheme:**

- String: Gray/Neutral
- Number: Blue
- Boolean: Green (true) / Red (false)
- Date/Datetime: Purple
- Taglist: Orange (shows as multiple mini-chips)
- JSON: Pink/Magenta

### PropertyEditor

A modal dialog for creating or editing properties.

**Usage:**

```tsx
import { PropertyEditor } from "@/components/properties/PropertyEditor";

// Create new property
<PropertyEditor
  blockId="city-tokyo"
  onClose={() => setIsCreating(false)}
/>

// Edit existing property
<PropertyEditor
  blockId="city-tokyo"
  propertyId="prop-123"
  onClose={() => setIsEditing(false)}
/>
```

**Props:**

- `blockId: string` - The ID of the block
- `propertyId?: string` - Optional. If provided, opens in edit mode
- `onClose?: () => void` - Callback when dialog closes

**Features:**

- Three-step form: key, kind, value
- Tab navigation through fields
- Type-appropriate value inputs
- Validation for all field types
- Keyboard shortcuts (Enter to save, Escape to cancel)
- Auto-focus on key input

## Integration Example

Here's how to integrate PropertyChips into an existing component like Node.tsx:

```tsx
import { PropertyChips } from "@/components/properties/PropertyChips";

export function Node({ block, ... }: NodeProps) {
  return (
    <div className="node">
      {/* Existing node content */}
      <div className="flex items-center gap-2 py-1 px-2">
        {renderChevron()}
        {renderTodoCheckbox()}
        {renderContent()}
        {renderTags()}
      </div>

      {/* Add property chips */}
      <PropertyChips blockId={block.id} />
    </div>
  );
}
```

## Property Storage

Properties are stored in Dexie with the following structure:

```typescript
interface Prop {
  id: string;
  blockId: string;
  key: string;
  kind: "string" | "number" | "boolean" | "date" | "datetime" | "taglist" | "json";
  s?: string; // for kind="string"
  n?: number; // for kind="number"
  b?: boolean; // for kind="boolean"
  d?: string; // for kind="date" (ISO date string)
  t?: string; // for kind="datetime" (ISO datetime string)
  j?: any; // for kind="taglist" (array) or kind="json" (any JSON)
}
```

**Important:** Only ONE value field should be populated based on the `kind` field.

## Examples

### String Property

```typescript
{
  id: "prop-1",
  blockId: "city-tokyo",
  key: "category",
  kind: "string",
  s: "coffee"
}
```

Displays as: `category: coffee` (gray chip)

### Number Property

```typescript
{
  id: "prop-2",
  blockId: "city-tokyo",
  key: "rating",
  kind: "number",
  n: 4.5
}
```

Displays as: `rating: 4.5` (blue chip)

### Boolean Property

```typescript
{
  id: "prop-3",
  blockId: "city-tokyo",
  key: "visited",
  kind: "boolean",
  b: true
}
```

Displays as: `visited: ✓` (green chip)

### Date Property

```typescript
{
  id: "prop-4",
  blockId: "city-tokyo",
  key: "visit_date",
  kind: "date",
  d: "2024-03-15"
}
```

Displays as: `visit_date: 3/15/2024` (purple chip)

### Taglist Property

```typescript
{
  id: "prop-5",
  blockId: "city-tokyo",
  key: "features",
  kind: "taglist",
  j: ["wifi", "quiet", "outdoor-seating"]
}
```

Displays as: `features:` followed by three mini orange chips

### JSON Property

```typescript
{
  id: "prop-6",
  blockId: "city-tokyo",
  key: "metadata",
  kind: "json",
  j: { "location": { "lat": 35.6762, "lng": 139.6503 } }
}
```

Displays as: `metadata: {"location":{"lat":35.6762...` (pink chip, truncated)

## Keyboard Shortcuts

When PropertyEditor is open:

- `Enter` - Save property (except in JSON textarea)
- `Escape` - Cancel and close
- `Tab` - Navigate between fields

## Validation

The PropertyEditor validates:

- Key is required and non-empty
- Number values must be valid numbers
- JSON values must parse correctly
- Date/datetime values must be selected
- Taglist must have at least one tag
- String values must be non-empty

## Design Decisions

1. **Color Coding**: Each property type has a distinct color to make it easy to identify types at a glance
2. **Chip Size**: Small (text-xs/text-sm) to avoid overwhelming the UI
3. **Hover Actions**: Delete button only appears on hover to reduce visual clutter
4. **Modal Dialog**: Uses Radix Dialog for accessibility and proper focus management
5. **Live Queries**: Uses `useLiveQuery` from dexie-react-hooks for reactive updates
6. **Truncation**: Long values are truncated in chips but shown in full in the editor
7. **Special Taglist Rendering**: Taglist properties show each tag as a separate mini-chip for better visual clarity

## Future Enhancements

Potential improvements:

- Property presets/templates
- Property search/filter
- Bulk property operations
- Property inheritance from parent blocks
- Property-based views/queries
- Custom property validation rules
- Property history/versioning
