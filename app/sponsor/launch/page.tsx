"use client";
import SponsorshipBuilder from "@/app/components/sponsorship-builder/SponsorshipBuilder";
import { useState } from "react";

import ProductGrid from "@/app/components/sponsorship-builder/ProductGrid";

import {
  SponsorshipProduct,
} from "@/app/data/sponsorship-products";

export default function LaunchSponsorshipPage() {

  const [selectedProduct, setSelectedProduct] =
    useState<SponsorshipProduct | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">

      {!selectedProduct ? (

        <>
          <div className="mb-12 text-center">

            <h1 className="text-5xl font-bold text-slate-900">
              Launch Sponsorship
            </h1>

            <p className="mt-5 text-lg text-slate-600">
              Choose the sponsorship product you would like to launch.
            </p>

          </div>

          <ProductGrid
            onSelect={setSelectedProduct}
          />

        </>

      ) : (
<SponsorshipBuilder
  product={selectedProduct}
/>

      )}

    </div>
  );
}