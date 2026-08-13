/* Homepage content — ported from the design system's ui_kits/homepage/data.js.
   Curated by hand per CONTEXT.md decision 6: the homepage does not read the API.
   External mcdermotts.ie links rewritten to internal routes where the target
   exists in the online catalogue (slugs verified against the live Store API,
   2026-08-13). Imagery is placeholder from the live media library. */

const img = {
  hero: "https://mcdermotts.ie/wp-content/uploads/2026/06/Alma-Wing-Chair-by-Orla-Kiely.jpg",
  sofas:
    "https://mcdermotts.ie/wp-content/uploads/2026/06/Selene-Sofa-Range-by-Fama-at-McDermotts-Ennis-And-Castlebar-10.jpg",
  mattresses:
    "https://mcdermotts.ie/wp-content/uploads/2025/12/King-Koil-Spinal-Therapy-1800-by-King-Koil-at-McDermotts-Furniture-Ennis-Castlebar-1024x576.jpg",
  bedroom: "https://mcdermotts.ie/wp-content/uploads/2025/03/Casera-Bedframe-Lifestyle-Images-4.webp",
  dining:
    "https://mcdermotts.ie/wp-content/uploads/2025/10/Sloane-Extending-Dining-Table-at-McDermotts-Furniture-7.jpg",
  living:
    "https://mcdermotts.ie/wp-content/uploads/2025/09/Pavon-Barnwood-Extending-Dining-Table-at-McDermotts-Furniture-1.jpg",
  garden:
    "https://mcdermotts.ie/wp-content/uploads/2026/03/Rikke-Pendant-Lamp-by-COCO-Maison-D40cm-at-McDermotts-Furniture-Ennis-Castlebar-3.jpg",
  accessories:
    "https://mcdermotts.ie/wp-content/uploads/2026/03/Elien-Vase-by-COCO-Maison-at-McDermotts-Furniture-Ennis-Castlebar-4.jpg",
};

export const homepage = {
  img,

  nav: [
    { label: "Garden Furniture", href: "/category/garden-furniture" },
    { label: "New In", href: "/category/latest-arrivals" },
    { label: "Sofas & Chairs", href: "/category/all-sofas" },
    { label: "Mattresses", href: "/category/all-mattresses" },
    { label: "Bedroom", href: "/category/bedroom-furniture" },
    { label: "Living Room", href: "/category/living-room-furniture" },
    { label: "Dining", href: "/category/dining-room-furniture" },
    { label: "XOOON", href: "/category/xooon-ireland" },
    { label: "Accessories", href: "/category/all-accessories" },
  ],

  departments: [
    {
      label: "Sofas",
      href: "/category/all-sofas",
      image: img.sofas,
      alt: "Selene sofa range by Fama in the McDermott's showroom",
    },
    {
      label: "Mattresses",
      href: "/category/all-mattresses",
      image: img.mattresses,
      alt: "King Koil mattress dressed on a divan base",
    },
    {
      label: "Bedroom",
      href: "/category/bedroom-furniture",
      image: img.bedroom,
      alt: "Casera bedframe by Willis & Gambier styled with bedside lockers",
    },
    {
      label: "Dining",
      href: "/category/dining-room-furniture",
      image: img.dining,
      alt: "Sloane extending dining table set with chairs",
    },
    {
      label: "Living",
      href: "/category/living-room-furniture",
      image: img.living,
      alt: "Pavon barnwood table in a living room setting",
    },
    {
      label: "Garden",
      href: "/category/garden-furniture",
      image: img.garden,
      alt: "Outdoor seating display in the Castlebar showroom",
    },
  ],

  /* Four static picks, no prices (DS rule) — descriptors verified against the
     live catalogue. Axel by Fama is showroom-only (not in the online catalogue),
     so its card links to the sofas category. */
  picks: [
    {
      brand: "Fama",
      title: "Axel Modular Sofa",
      descriptor: "Reclining, modular, made to order in your fabric",
      href: "/category/all-sofas",
      image: img.sofas,
      alt: "Axel modular sofa by Fama in a showroom setting",
    },
    {
      brand: "King Koil",
      title: "Dromoland Castle Mattress",
      descriptor: "Handmade in Kildare to the hotel's own spec",
      href: "/product/dromoland-castle-king-mattress-by-king-koil",
      image: img.mattresses,
      alt: "Dromoland Castle mattress by King Koil on a dressed bed",
    },
    {
      brand: "XOOON",
      title: "Trenton Range",
      descriptor: "Retro-slatted oak for living and dining",
      href: "/category/trenton-by-xooon",
      image: img.living,
      alt: "Trenton oak sideboard by XOOON with slatted doors",
    },
    {
      brand: "Stressless",
      title: "Consul Recliner & Stool",
      descriptor: "The original recliner, sold with its matching stool",
      href: "/product/stressless-consul-classic-recliner-in-batick-mole",
      image: img.bedroom,
      alt: "Stressless Consul recliner and stool in leather",
    },
  ],

  brands: [
    "Stressless",
    "Parker Knoll",
    "Harrison Spinks",
    "King Koil",
    "Coco Maison",
    "Hjort Knudsen",
    "Respa",
    "Willis & Gambier",
    "Calia Italia",
    "Himolla",
    "Alexander & James",
  ],

  showrooms: [
    {
      eyebrow: "Co. Mayo · Flagship",
      name: "Castlebar",
      address:
        "Spencer Street, Castlebar — both sides of the street, with free customer parking behind the stone building.",
      hours: [
        { days: "Mon – Sat", time: "9:30 – 18:00" },
        { days: "Sun & Bank Holidays", time: "Closed" },
      ],
      phone: "094 90 22500",
      directions:
        "https://www.google.com/maps/dir//McDermotts+House+Furnishers+Ltd.,+Spencer+St,+Castlebar,+Co.+Mayo",
    },
    {
      eyebrow: "Co. Clare · Our newest showroom",
      name: "Ennis",
      address: "Station Road, Ennis — parking on the Old Gaol Road side.",
      hours: [
        { days: "Mon – Sat", time: "9:30 – 18:00" },
        { days: "Sun & Bank Holidays", time: "12:00 – 17:00" },
      ],
      note: "We open most bank holidays. Check Google or call us before travelling.",
      phone: "065 68 66233",
      directions: "https://www.google.com/maps/place/McDermotts+House+Furnishers+Ennis",
    },
  ],

  pillars: [
    {
      title: "Nationwide delivery & assembly",
      body: "Our own crews deliver and assemble everywhere in Ireland — led by a core team with 140 years' combined experience. One contribution fee, no surprise charges on the day.",
    },
    {
      title: "Family-run since 1964",
      body: "Three generations on Spencer Street, Castlebar. The same values, the same faces, and a team that actually knows the stock.",
    },
    {
      title: "90-night mattress trial",
      body: "Sleep on it for three months. If it isn't right, we'll work with you to put it right.",
    },
  ],

  tiles: [
    {
      title: "Gift vouchers",
      reason: "The present for the person who knows exactly what they want.",
      cta: "Buy a voucher",
      href: "/product/mcdermotts-gift-voucher",
    },
    {
      title: "Clearance & outlet",
      reason: "Ex-floor models and overstock — reduced hard, ready to go.",
      cta: "Shop the outlet",
      href: "/category/cracking-brand-clearance",
    },
    {
      title: "Cushions & accessories",
      reason:
        "Coco Maison, Richmond Interiors and more — the finishing touches that pull a room together.",
      cta: "Browse accessories",
      href: "/category/all-accessories",
    },
    {
      title: "Our story",
      reason: "From a toy and grocery shop on Spencer Street to one of the West's best-known showrooms.",
      cta: "Read our story",
      href: "https://mcdermotts.ie/about/",
    },
  ],
} as const;
