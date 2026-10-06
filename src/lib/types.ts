export type Point = { x: number; y: number };
export type Asset = { src: string; width: number; height: number };
export type Category =
  'top' | 'shirt' | 'outerwear' | 'bottom' | 'shoes' | 'accessory';
export type Kind =
  | 'tshirt'
  | 'sweater'
  | 'hoodie'
  | 'shirt'
  | 'jacket'
  | 'coat'
  | 'puffer'
  | 'pants'
  | 'shorts'
  | 'shoes'
  | 'watch'
  | 'smartwatch'
  | 'cap'
  | 'glasses'
  | 'necklace'
  | 'belt'
  | 'bag';
export type Fit = 'regular' | 'oversize' | 'slim';
export type Opening = 'closed' | 'open' | 'partial';
export type Variant = {
  id: string;
  name: string;
  color: string;
  image: Asset | null;
};
export type Garment = {
  id: string;
  name: string;
  category: Category;
  kind: Kind;
  color: string;
  fit: Fit;
  length: 'regular' | 'long' | 'short';
  neck: string;
  sleeve: 'short' | 'long' | 'none';
  size: string;
  cmLength: number | null;
  cmWidth: number | null;
  opening: Opening;
  tucked: boolean;
  notes: string;
  position:
    'leftWrist' | 'rightWrist' | 'head' | 'eyes' | 'neck' | 'waist' | 'bag';
  images: {
    front: Asset;
    back?: Asset;
    side?: Asset;
    open?: Asset;
    partial?: Asset;
  };
  variants: Variant[];
  activeVariant: string | null;
  anchors: Record<string, Point>;
  placement: { x: number; y: number; scale: number; rotation: number };
  demo: boolean;
};
export type Person = {
  photo: Asset | null;
  anchors: Record<string, Point>;
  calibrated: boolean;
  height: number | null;
  revision: number;
};
export type Outfit = {
  id: string;
  name: string;
  items: string[];
  settings: Record<
    string,
    { opening: Opening; tucked: boolean; variant: string | null }
  >;
  created: string;
};
export type Wardrobe = {
  version: 2;
  items: Garment[];
  selected: string[];
  saved: Outfit[];
  person: Person;
  results: Record<string, Asset>;
  revision: number;
};
