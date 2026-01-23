import React from "react";
import Link from "next/link";

export default function SitemapPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Sitemap</h1>
      <ul className="list-disc pl-5 space-y-2">
        <li><Link href="/" className="text-indigo-600 hover:underline">Home</Link></li>
        <li><Link href="/shop" className="text-indigo-600 hover:underline">Shop</Link></li>
        <li><Link href="/about" className="text-indigo-600 hover:underline">About Us</Link></li>
        <li><Link href="/contact" className="text-indigo-600 hover:underline">Contact</Link></li>
      </ul>
    </div>
  );
}
