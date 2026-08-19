type ProductCardProps = {
  product: {
    id: string;
    name: string;
    acronym: string;
    sport: string;
    trigger: string;
    description: string;
    icon: string;
    };
    onSelect: () => void;
};

export default function ProductCard({
    product,
    onSelect,
}: ProductCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">

            <div className="text-5xl">
                {product.icon}
            </div>

            <div className="mt-4 flex items-center justify-between">

                <h2 className="text-xl font-bold">
                    {product.name}
                </h2>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {product.acronym}
                </span>

            </div>

            <p className="mt-2 text-sm text-slate-500">
                {product.sport}
            </p>

            <p className="mt-1 text-sm text-slate-500">
                Trigger: {product.trigger}
            </p>

            <p className="mt-4 text-slate-600">
                {product.description}
            </p>

            <button
                onClick={onSelect}
                className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
            >
                Launch Sponsorship
            </button>

        </div>
    );
}