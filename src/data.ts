export const DEFAULT_BRANDS = [
  "BSRM", "ZSRM", "Anchor Cement", "Seven Rings Cement", 
  "Akij Cement", "BRB Wires", "RFL Fittings", "Rosa", "RAK"
];

export const DEFAULT_CATEGORIES = [
  "Rod & Steel", 
  "Cement", 
  "Bricks & Blocks", 
  "Sand & Aggregates", 
  "Tiles & Sanitary", 
  "Hardware Tools", 
  "Pipes & Fittings", 
  "Paint & Coils"
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "BSRM Xtreme 500W 16mm Deformed Bar",
    brand: "BSRM",
    category: "Rod & Steel",
    description: "High-grade structural steel reinforcing bar, ensuring maximum safety and durability for heavy construction.",
    regularPrice: 110000,
    salePrice: 105500,
    availability: "In Stock" as const,
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e904baf3bbf?auto=format&fit=crop&q=80&w=400",
    createdAt: Date.now() - 10000
  },
  {
    id: "prod-2",
    name: "Seven Rings Gold Portland Composite Cement",
    brand: "Seven Rings Cement",
    category: "Cement",
    description: "Premium Portland Composite Cement for versatile construction needs.",
    regularPrice: 560,
    salePrice: 540,
    availability: "In Stock" as const,
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400",
    createdAt: Date.now() - 5000
  },
  {
    id: "prod-3",
    name: "RFL Ball Valve 1.5 Inch",
    brand: "RFL Fittings",
    category: "Pipes & Fittings",
    description: "Durable uPVC ball valve for commercial and residential plumbing systems.",
    regularPrice: 250,
    salePrice: 215,
    availability: "In Stock" as const,
    imageUrl: "https://images.unsplash.com/photo-1605330881907-fb2be47fb59f?auto=format&fit=crop&q=80&w=400",
    createdAt: Date.now()
  }
];
