// Dedicated gallery photos; excluded from backgrounds and apartment galleries.
export const galleryImages = [
  { src: "/images/sunita/4.jpg", title: "Sunita — a private space", category: "Spaces", number: "01" },
  { src: "/images/theresa/2.jpg", title: "Theresa — interior details", category: "Interiors", number: "02" },
  { src: "/images/sunita/5.jpg", title: "Sunita — everyday comfort", category: "Living", number: "03" },
  { src: "/images/theresa/3.jpg", title: "Theresa — a closer look", category: "Interiors", number: "04" },
  { src: "/images/sunita/6.jpg", title: "Sunita — room to unwind", category: "Spaces", number: "05" },
  { src: "/images/theresa/4.jpg", title: "Theresa — feel at home", category: "Living", number: "06" },
];

export const reservedGalleryImages = new Set(galleryImages.map(image => image.src));
