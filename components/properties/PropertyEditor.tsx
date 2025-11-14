"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Save, AlertCircle } from "lucide-react";
import { db } from "@/lib/dexie";
import type { Prop } from "@/lib/types";

interface PropertyEditorProps {
  blockId: string;
  propertyId?: string;
  onClose?: () => void;
}

type PropertyKind = "string" | "number" | "boolean" | "date" | "datetime" | "taglist" | "json";

export function PropertyEditor({ blockId, propertyId, onClose }: PropertyEditorProps) {
  const [key, setKey] = useState("");
  const [kind, setKind] = useState<PropertyKind>("string");
  const [stringValue, setStringValue] = useState("");
  const [numberValue, setNumberValue] = useState("");
  const [booleanValue, setBooleanValue] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [datetimeValue, setDatetimeValue] = useState("");
  const [taglistValue, setTaglistValue] = useState("");
  const [jsonValue, setJsonValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const keyInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(propertyId);

  // Load existing property if editing
  const existingProp = useLiveQuery(async () => {
    if (!propertyId) return null;
    return await db.props.get(propertyId);
  }, [propertyId]);

  // Populate form when editing
  useEffect(() => {
    if (existingProp) {
      setKey(existingProp.key);
      setKind(existingProp.kind);

      switch (existingProp.kind) {
        case "string":
          setStringValue(existingProp.s || "");
          break;
        case "number":
          setNumberValue(existingProp.n?.toString() || "");
          break;
        case "boolean":
          setBooleanValue(existingProp.b || false);
          break;
        case "date":
          setDateValue(existingProp.d || "");
          break;
        case "datetime":
          setDatetimeValue(existingProp.t || "");
          break;
        case "taglist":
          setTaglistValue(Array.isArray(existingProp.j) ? existingProp.j.join(", ") : "");
          break;
        case "json":
          setJsonValue(JSON.stringify(existingProp.j, null, 2));
          break;
      }
    }
  }, [existingProp]);

  // Focus key input on mount
  useEffect(() => {
    setTimeout(() => {
      keyInputRef.current?.focus();
    }, 100);
  }, []);

  const validateAndGetValue = (): { valid: boolean; value: Partial<Prop> } => {
    setError("");

    if (!key.trim()) {
      setError("Property key is required");
      return { valid: false, value: {} };
    }

    const prop: Partial<Prop> = {
      blockId,
      key: key.trim(),
      kind,
    };

    switch (kind) {
      case "string":
        if (!stringValue.trim()) {
          setError("String value is required");
          return { valid: false, value: {} };
        }
        prop.s = stringValue.trim();
        break;

      case "number": {
        const num = parseFloat(numberValue);
        if (isNaN(num)) {
          setError("Please enter a valid number");
          return { valid: false, value: {} };
        }
        prop.n = num;
        break;
      }

      case "boolean":
        prop.b = booleanValue;
        break;

      case "date":
        if (!dateValue) {
          setError("Date is required");
          return { valid: false, value: {} };
        }
        prop.d = dateValue;
        break;

      case "datetime":
        if (!datetimeValue) {
          setError("Datetime is required");
          return { valid: false, value: {} };
        }
        prop.t = datetimeValue;
        break;

      case "taglist": {
        if (!taglistValue.trim()) {
          setError("At least one tag is required");
          return { valid: false, value: {} };
        }
        const tags = taglistValue
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        if (tags.length === 0) {
          setError("At least one tag is required");
          return { valid: false, value: {} };
        }
        prop.j = tags;
        break;
      }

      case "json":
        if (!jsonValue.trim()) {
          setError("JSON value is required");
          return { valid: false, value: {} };
        }
        try {
          prop.j = JSON.parse(jsonValue);
        } catch (e) {
          setError("Invalid JSON: " + (e as Error).message);
          return { valid: false, value: {} };
        }
        break;
    }

    return { valid: true, value: prop };
  };

  const handleSave = async () => {
    const { valid, value } = validateAndGetValue();
    if (!valid) return;

    setIsLoading(true);
    try {
      if (isEditMode && propertyId) {
        // Update existing property
        await db.props.update(propertyId, value);
      } else {
        // Create new property
        await db.props.add({
          id: crypto.randomUUID(),
          ...value,
        } as Prop);
      }
      onClose?.();
    } catch (err) {
      console.error("Error saving property:", err);
      setError("Failed to save property: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose?.();
    }
    // Don't submit on Enter for textarea (JSON input)
    if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      handleSave();
    }
  };

  const renderValueInput = () => {
    switch (kind) {
      case "string":
        return (
          <div className="space-y-2">
            <label htmlFor="string-value" className="block text-sm font-medium text-gray-700">
              Value
            </label>
            <input
              id="string-value"
              type="text"
              value={stringValue}
              onChange={(e) => setStringValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text value"
            />
          </div>
        );

      case "number":
        return (
          <div className="space-y-2">
            <label htmlFor="number-value" className="block text-sm font-medium text-gray-700">
              Value
            </label>
            <input
              id="number-value"
              type="number"
              step="any"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter number"
            />
          </div>
        );

      case "boolean":
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={booleanValue}
                onChange={(e) => setBooleanValue(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {booleanValue ? "True" : "False"}
              </span>
            </label>
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <label htmlFor="date-value" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              id="date-value"
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case "datetime":
        return (
          <div className="space-y-2">
            <label htmlFor="datetime-value" className="block text-sm font-medium text-gray-700">
              Date & Time
            </label>
            <input
              id="datetime-value"
              type="datetime-local"
              value={datetimeValue}
              onChange={(e) => setDatetimeValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case "taglist":
        return (
          <div className="space-y-2">
            <label htmlFor="taglist-value" className="block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              id="taglist-value"
              type="text"
              value={taglistValue}
              onChange={(e) => setTaglistValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="coffee, wifi, quiet"
            />
            <p className="text-xs text-gray-500">Enter tags separated by commas</p>
          </div>
        );

      case "json":
        return (
          <div className="space-y-2">
            <label htmlFor="json-value" className="block text-sm font-medium text-gray-700">
              JSON Value
            </label>
            <textarea
              id="json-value"
              value={jsonValue}
              onChange={(e) => setJsonValue(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"key": "value"}'
            />
            <p className="text-xs text-gray-500">Enter valid JSON</p>
          </div>
        );
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {isEditMode ? "Edit Property" : "Add Property"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* Key Input */}
            <div className="space-y-2">
              <label htmlFor="prop-key" className="block text-sm font-medium text-gray-700">
                Property Name
              </label>
              <input
                id="prop-key"
                ref={keyInputRef}
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., category, visited, rating"
              />
            </div>

            {/* Kind Selector */}
            <div className="space-y-2">
              <label htmlFor="prop-kind" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="prop-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as PropertyKind)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="string">Text (String)</option>
                <option value="number">Number</option>
                <option value="boolean">True/False (Boolean)</option>
                <option value="date">Date</option>
                <option value="datetime">Date & Time</option>
                <option value="taglist">Tags (List)</option>
                <option value="json">JSON</option>
              </select>
            </div>

            {/* Value Input (changes based on kind) */}
            {renderValueInput()}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
