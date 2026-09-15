import ProductCard from "./ProductCard";

import {
  sponsorshipProducts,
  SponsorshipProduct,
} from "@/app/data/sponsorship-products";
import { PRIMARY_SPORTS } from "@/app/lib/sports";

type ProductGridProps = {
  onSelect: (product: SponsorshipProduct) => void;
};

export default function ProductGrid({
  onSelect,
}: ProductGridProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {sponsorshipProducts
        .filter((product) => PRIMARY_SPORTS.includes(product.sport))
        .map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={() => onSelect(product)}
        />
      ))}
    </div>
  );
}