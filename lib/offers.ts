export interface Offer {
  name: string;
  weapon: string;
  tier: string;
  price: number;
  image: string;
}

export const offers: Offer[] = [
  {
    image: "/skins/vandal.png",
    name: "Prime Vandal",
    price: 1775,
    tier: "Premium",
    weapon: "Vandal",
  },
  {
    image: "/skins/operator.png",
    name: "Elderflame Operator",
    price: 2475,
    tier: "Ultra",
    weapon: "Operator",
  },
  {
    image: "/skins/sheriff.png",
    name: "Ion Sheriff",
    price: 1775,
    tier: "Premium",
    weapon: "Sheriff",
  },
  {
    image: "/skins/frenzy.png",
    name: "Sensation Frenzy",
    price: 875,
    tier: "Select",
    weapon: "Frenzy",
  },
];

export const total = offers.reduce((sum, offer) => sum + offer.price, 0);
