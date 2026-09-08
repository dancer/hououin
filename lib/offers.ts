export interface Offer {
  height: number;
  name: string;
  price: number;
  slug: string;
  tier: string;
  variants: string[];
  weapon: string;
  width: number;
}

export const offers: Offer[] = [
  {
    height: 148,
    name: "Prime Vandal",
    price: 1775,
    slug: "vandal",
    tier: "Premium",
    variants: ["base", "orange", "blue", "yellow"],
    weapon: "Vandal",
    width: 512,
  },
  {
    height: 100,
    name: "Elderflame Operator",
    price: 2475,
    slug: "operator",
    tier: "Ultra",
    variants: ["base", "red", "blue", "dark"],
    weapon: "Operator",
    width: 512,
  },
  {
    height: 240,
    name: "Ion Sheriff",
    price: 1775,
    slug: "sheriff",
    tier: "Premium",
    variants: ["base"],
    weapon: "Sheriff",
    width: 512,
  },
  {
    height: 360,
    name: "Sensation Frenzy",
    price: 875,
    slug: "frenzy",
    tier: "Select",
    variants: ["base"],
    weapon: "Frenzy",
    width: 512,
  },
];

export const render = (slug: string, variant: string) =>
  `/skins/${slug}/${variant}.png`;

export const total = offers.reduce((sum, offer) => sum + offer.price, 0);
