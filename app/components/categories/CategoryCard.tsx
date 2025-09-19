"use client";

import React from "react";

type CategoryCardProps = {
  title: string;
  items: string[];
  children: React.ReactNode;
};

export default function CategoryCard({ title, items, children }: CategoryCardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{items.join(', ')}</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
        {children}
      </div>
    </div>
  );
}
