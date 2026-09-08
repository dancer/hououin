export interface Variant {
  image: string;
  name: string;
}

export interface Offer {
  image: string;
  name: string;
  price: number;
  tier: string;
  variants: Variant[];
  weapon: string;
}

const skin = (slug: string, names: string[]): Variant[] =>
  names.map((name) => ({ image: `/skins/${slug}/${name}.png`, name }));

export const offers: Offer[] = [
  {
    image: "/skins/vandal/base.png",
    name: "Prime Vandal",
    price: 1775,
    tier: "Premium",
    variants: skin("vandal", ["base", "orange", "blue", "yellow"]),
    weapon: "Vandal",
  },
  {
    image: "/skins/operator/base.png",
    name: "Elderflame Operator",
    price: 2475,
    tier: "Ultra",
    variants: skin("operator", ["base", "red", "blue", "dark"]),
    weapon: "Operator",
  },
  {
    image: "/skins/sheriff/base.png",
    name: "Ion Sheriff",
    price: 1775,
    tier: "Premium",
    variants: skin("sheriff", ["base"]),
    weapon: "Sheriff",
  },
  {
    image: "/skins/frenzy/base.png",
    name: "Sensation Frenzy",
    price: 875,
    tier: "Select",
    variants: skin("frenzy", ["base"]),
    weapon: "Frenzy",
  },
];

export const total = offers.reduce((sum, offer) => sum + offer.price, 0);
