"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronRight,
  Check,
  Table,
  LayoutGrid,
  Save,
} from "lucide-react";
import Link from "next/link";
import { fieldTypes, type FieldType } from "@/lib/mock-data";

type Step = 1 | 2 | 3;

interface Field {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
}

// Sample data for preview
const generateSampleData = () => {
  const samples: Array<{ id: string; values: Record<string, string | number | boolean> }> = [
    {
      id: "1",
      values: {
        Name: "123 Main St",
        Address: "123 Main St, New York, NY",
        Price: 750000,
        Bedrooms: 3,
        Bathrooms: 2,
        "Square Feet": 1500,
        "Listed Date": "2025-11-01",
        Active: true,
        Agent: "Alice Johnson",
        Status: "Available",
      },
    },
    {
      id: "2",
      values: {
        Name: "456 Oak Ave",
        Address: "456 Oak Ave, Brooklyn, NY",
        Price: 850000,
        Bedrooms: 4,
        Bathrooms: 3,
        "Square Feet": 2000,
        "Listed Date": "2025-11-05",
        Active: true,
        Agent: "Bob Smith",
        Status: "Pending",
      },
    },
    {
      id: "3",
      values: {
        Name: "789 Pine Rd",
        Address: "789 Pine Rd, Queens, NY",
        Price: 650000,
        Bedrooms: 2,
        Bathrooms: 2,
        "Square Feet": 1200,
        "Listed Date": "2025-10-28",
        Active: false,
        Agent: "Carol Wang",
        Status: "Sold",
      },
    },
  ];

  return samples;
};

export default function CollectionsPrototypePage() {
  const [step, setStep] = useState<Step>(1);

  // Step 1: Define Type
  const [typeName, setTypeName] = useState("Property");
  const [typeIcon, setTypeIcon] = useState("🏠");
  const [typeDescription, setTypeDescription] = useState("Real estate property listings");

  // Step 2: Add Fields
  const [fields, setFields] = useState<Field[]>([
    { id: "f1", name: "Name", type: fieldTypes[0], required: true },
    { id: "f2", name: "Address", type: fieldTypes[0], required: true },
    { id: "f3", name: "Price", type: fieldTypes[1], required: true },
    { id: "f4", name: "Bedrooms", type: fieldTypes[1], required: false },
    { id: "f5", name: "Bathrooms", type: fieldTypes[1], required: false },
    { id: "f6", name: "Square Feet", type: fieldTypes[1], required: false },
    { id: "f7", name: "Listed Date", type: fieldTypes[2], required: false },
    { id: "f8", name: "Active", type: fieldTypes[3], required: false },
  ]);

  // Step 3: Preview mode
  const [previewMode, setPreviewMode] = useState<"table" | "cards">("table");

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `f${Date.now()}`,
        name: "New Field",
        type: fieldTypes[0],
        required: false,
      },
    ]);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const sampleData = generateSampleData();

  const canProceed = () => {
    if (step === 1) return typeName.trim() !== "";
    if (step === 2) return fields.length > 0 && fields.every((f) => f.name.trim() !== "");
    return true;
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/vision/overview"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Collection Builder Prototype</h1>
          <p className="text-neutral-400">
            Create structured types with custom fields and properties
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step === s
                    ? "border-blue-500 bg-blue-500 text-white"
                    : step > s
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-neutral-700 bg-neutral-900 text-neutral-500"
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <ChevronRight
                  className={`w-5 h-5 ${step > s ? "text-green-500" : "text-neutral-700"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-neutral-100">
            {step === 1 && "Define Your Type"}
            {step === 2 && "Add Fields"}
            {step === 3 && "Preview & Save"}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {step === 1 && "Give your collection a name, icon, and description"}
            {step === 2 && "Define the fields that each item in this collection will have"}
            {step === 3 && "See how your collection will look and save it"}
          </p>
        </div>

        {/* Step 1: Define Type */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <label className="block text-sm font-semibold text-neutral-100 mb-2">
                Collection Name
              </label>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Property, Book, Recipe, Contact..."
              />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <label className="block text-sm font-semibold text-neutral-100 mb-2">Icon</label>
              <div className="flex gap-2">
                {["🏠", "📚", "🍳", "👤", "💼", "🎯", "🎨", "⚡"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setTypeIcon(emoji)}
                    className={`w-12 h-12 rounded-lg border-2 text-2xl transition-colors ${
                      typeIcon === emoji
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <label className="block text-sm font-semibold text-neutral-100 mb-2">
                Description
              </label>
              <textarea
                value={typeDescription}
                onChange={(e) => setTypeDescription(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-blue-500"
                placeholder="What is this collection for?"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Add Fields */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto space-y-4">
            {fields.map((field) => (
              <div
                key={field.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {/* Field Name */}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Field Name</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Field name..."
                      />
                    </div>

                    {/* Field Type */}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Type</label>
                      <select
                        value={field.type.id}
                        onChange={(e) => {
                          const type = fieldTypes.find((t) => t.id === e.target.value);
                          if (type) updateField(field.id, { type });
                        }}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 text-sm focus:outline-none focus:border-blue-500"
                      >
                        {fieldTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Required */}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Options</label>
                      <label className="flex items-center gap-2 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded cursor-pointer hover:bg-neutral-900 transition-colors">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="rounded border-neutral-600"
                        />
                        <span className="text-sm text-neutral-300">Required</span>
                      </label>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                    title="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Field Type Description */}
                <div className="mt-2 text-xs text-neutral-600">{field.type.description}</div>
              </div>
            ))}

            {/* Add Field Button */}
            <button
              onClick={addField}
              className="w-full py-3 border-2 border-dashed border-neutral-800 rounded-lg text-neutral-500 hover:border-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Preview Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode("table")}
                  className={`px-4 py-2 rounded transition-colors ${
                    previewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-neutral-300"
                  }`}
                >
                  <Table className="w-4 h-4 inline mr-2" />
                  Table View
                </button>
                <button
                  onClick={() => setPreviewMode("cards")}
                  className={`px-4 py-2 rounded transition-colors ${
                    previewMode === "cards"
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:text-neutral-300"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 inline mr-2" />
                  Card View
                </button>
              </div>

              <div className="text-sm text-neutral-500">{sampleData.length} sample items</div>
            </div>

            {/* Collection Summary */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{typeIcon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-100 mb-1">{typeName}</h3>
                  <p className="text-sm text-neutral-400 mb-3">{typeDescription}</p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>
                      {fields.length} field{fields.length !== 1 ? "s" : ""}
                    </span>
                    <span>{fields.filter((f) => f.required).length} required</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table View */}
            {previewMode === "table" && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-800/50">
                      <tr>
                        {fields.map((field) => (
                          <th
                            key={field.id}
                            className="px-4 py-3 text-left text-xs font-semibold text-neutral-400 border-b border-neutral-800"
                          >
                            {field.name}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                        >
                          {fields.map((field) => (
                            <td key={field.id} className="px-4 py-3 text-neutral-300">
                              {String(item.values[field.name] ?? "-")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Card View */}
            {previewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-2xl">{typeIcon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-100">
                          {String(item.values[fields[0]?.name] || "Untitled")}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {fields.slice(1).map((field) => (
                        <div
                          key={field.id}
                          className="flex items-start justify-between gap-2 text-xs"
                        >
                          <span className="text-neutral-500">{field.name}:</span>
                          <span className="text-neutral-300 font-medium text-right">
                            {String(item.values[field.name] ?? "-")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1) as Step)}
            disabled={step === 1}
            className={`px-6 py-2 rounded transition-colors ${
              step === 1
                ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {step === 3 && (
              <button
                onClick={() => {
                  console.log("Save as Slice:", { typeName, typeIcon, typeDescription, fields });
                  alert("Collection saved! (This is a prototype - no actual persistence)");
                }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Collection
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(Math.min(3, step + 1) as Step)}
                disabled={!canProceed()}
                className={`px-6 py-2 rounded transition-colors ${
                  !canProceed()
                    ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-neutral-100 mb-2">About Collections</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Collections let you define structured types with custom fields. Think of them as
            templates for organizing related information. Each field can have a different type
            (text, number, date, etc.) and can be marked as required. Once created, you can use this
            collection type throughout your outline to maintain consistency. Reference fields allow
            you to link to other blocks or collection items, creating a relational structure within
            your outline.
          </p>
        </div>
      </div>
    </div>
  );
}
