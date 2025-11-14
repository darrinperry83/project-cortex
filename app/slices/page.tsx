"use client";

import { SliceList } from "@/components/slices/SliceList";

export default function SlicesPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Saved Views</h1>
        <p className="text-gray-600">Manage your custom queries and data views</p>
      </div>

      <SliceList />
    </section>
  );
}
