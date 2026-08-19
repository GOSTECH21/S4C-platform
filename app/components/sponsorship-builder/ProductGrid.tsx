import ProductCard from "./ProductCard";

import {
  sponsorshipProducts,
  SponsorshipProduct,
} from "@/app/data/sponsorship-products";

type ProductGridProps = {
  onSelect: (product: SponsorshipProduct) => void;
};

export default function ProductGrid({
  onSelect,
}: ProductGridProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {sponsorshipProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={() => onSelect(product)}
        />
      ))}
    </div>
  );
}