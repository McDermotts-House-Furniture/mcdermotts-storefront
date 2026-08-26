/* Content for /about/find-us — verbatim from the live page (fetched
   2026-08-27), same "copy verbatim, imagery is placeholder" convention as
   the rest of this prototype's content files. Deliberately separate from
   homepage.showrooms in lib/homepage-data.ts: that's a condensed teaser for
   the homepage's own showroom block, this is the full page it links out to
   — the two shouldn't be forced to share one shape just because the data
   overlaps. */

export const findUs = {
  /* "House Furnishers", not the live page's "Furniture & Interiors" (Declan,
     2026-08-27) — "Interiors" reads as curtains, doors, hard flooring, not
     what's actually sold here. Matches the name used everywhere else on the
     site (page titles, etc.). */
  eyebrow: "McDermott's House Furnishers · Family Run Since 1964",
  title: "Visit Our Showrooms",
  standfirst: "Two showrooms, free customer parking at both, and a team that will let you browse at your own pace.",
  showrooms: [
    {
      eyebrow: "Our Flagship Showroom",
      name: "Castlebar",
      /* Real showroom clip from the live page, verified 200/video-mp4
         (fetched 2026-08-27). */
      videoSrc: "https://mcdermotts.ie/wp-content/uploads/2026/07/IMG_6684-2.mp4",
      description:
        "Trading on Spencer Street for generations, McDermott's spans both sides of the street. On one side you'll find our main furniture store along with our carpet department. Directly across the road are our Mattress & Bedroom showroom, our dedicated FAMA & XOOON displays, and our Garden Furniture & Outlet. Our full range is on display here.",
      address: "Spencer Street\nCastlebar, Co. Mayo\nF23 Y520",
      hours: [
        { days: "Mon – Sat", time: "9:30am – 6:00pm" },
        { days: "Sun & Bank Hol", time: "Closed" },
      ],
      parking:
        "Free customer car park with an automatic barrier. Enter Spencer Court just off the roundabout, take the first right, and our car park is on the right beside the public car park. Walk straight into the showroom through our Beds, XOOON & FAMA entrance at the back.",
      directions:
        "https://www.google.com/maps/dir//McDermotts+House+Furnishers+Ltd.,+Spencer+St,+Gorteendrunagh,+Castlebar,+Co.+Mayo/@53.8531665,-9.3026553,16z/data=!4m9!4m8!1m0!1m5!1m1!1s0x48595d9f8efc0089:0xf23507ea0220349a!2m2!1d-9.2949871!2d53.8538758!3e0?entry=ttu",
      phone: "094 90 22500",
      phoneHref: "tel:0949022500",
    },
    {
      eyebrow: "Our Brand New State-of-the-Art Showroom",
      name: "Ennis",
      /* Real drone shot from the live page, verified 200/video-mp4 (fetched
         2026-08-27). */
      videoSrc: "https://mcdermotts.ie/wp-content/uploads/2025/10/McDermotts-Station-Rd.-Ennis-Drone-Shot-2.mp4",
      description:
        "Our brand new Ennis showroom is a bright, modern space in the former Madden's Furniture building on Station Road, a short walk from the Old Ground Hotel. Inside you'll find a curated selection of our best brands, including FAMA, XOOON, Coco Maison, Hjort Knudsen, King Koil, Harrison Spinks, Respa and Willis & Gambier, with Sunday opening every week.",
      address: "Station Road\nEnnis, Co. Clare\nV95 KV81",
      hours: [
        { days: "Mon – Sat", time: "9:30am – 6:00pm" },
        { days: "Sunday", time: "12:00pm – 5:00pm" },
        { days: "Bank Holidays", time: "12:00pm – 5:00pm*" },
      ],
      note: "*We open most bank holidays. Check Google or call us before travelling.",
      parking:
        "Free customer parking on the Old Gaol Road side of the showroom. Our front door faces the Station Road junction.",
      directions:
        "https://www.google.com/maps/place/McDermotts+House+Furnishers/@52.8409803,-8.9805931,826m/data=!3m1!1e3!4m6!3m5!1s0x485b6d3a4fcfb335:0x5de86260a792d6ff!8m2!3d52.8409803!4d-8.9805931!16s%2Fg%2F11xyq6wqw_?entry=ttu",
      phone: "065 68 66233",
      phoneHref: "tel:0656866233",
    },
  ],
  closing: "Can't make it in? Email us at sales@mcdermotts.ie — nationwide delivery & assembly available.",
} as const;
