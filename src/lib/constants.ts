export const MACHINE_TYPES = [
  { value: "jcb", label: "JCB / Backhoe Loader", icon: "🏗️" },
  { value: "crane", label: "Crane", icon: "🏗️" },
  { value: "tractor", label: "Tractor", icon: "🚜" },
  { value: "truck", label: "Truck / Tipper", icon: "🚛" },
  { value: "excavator", label: "Excavator", icon: "⛏️" },
  { value: "bulldozer", label: "Bulldozer", icon: "🚧" },
  { value: "roller", label: "Road Roller", icon: "🛞" },
  { value: "concrete_mixer", label: "Concrete Mixer", icon: "🏭" },
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry",
];

export const MACHINE_IMAGES: Record<string, string> = {
  jcb: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&h=400&fit=crop",
  crane: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
  tractor: "https://images.unsplash.com/photo-1605338198618-2af781b67a40?w=600&h=400&fit=crop",
  truck: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop",
  excavator: "https://images.unsplash.com/photo-1580901368919-7738efb0f228?w=600&h=400&fit=crop",
  bulldozer: "https://images.unsplash.com/photo-1621922688758-441698257e88?w=600&h=400&fit=crop",
  roller: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&h=400&fit=crop",
  concrete_mixer: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMachineTypeLabel(type: string): string {
  return MACHINE_TYPES.find((t) => t.value === type)?.label || type;
}

export function getMachineTypeIcon(type: string): string {
  return MACHINE_TYPES.find((t) => t.value === type)?.icon || "🏗️";
}

export const PLATFORM_FEE_PERCENT = 10;
