export type ApartmentImagePair = { desktop: string; mobile: string };

// Each photo is reserved for exactly one background placement.
export const siteImages: Record<string, ApartmentImagePair> = {
  // All portrait photos are assigned; this final hero uses a landscape crop on mobile.
  "confirmation-hero": { desktop: "/images/sunita/2.jpg", mobile: "/images/sunita/3.jpg" },
  "booking-hero": { desktop: "/images/rahat/3.jpg", mobile: "/images/theresa/8.jpg" },
  "my-bookings-hero": { desktop: "/images/rahat/4.jpg", mobile: "/images/theresa/9.jpg" },
  "my-bookings-cta": { desktop: "/images/rahat/7.jpg", mobile: "/images/theresa/11.jpg" },
  "home-1": {
    "desktop": "/images/alexa/1.jpg",
    "mobile": "/images/alexa/6.jpg"
  },
  "home-2": {
    "desktop": "/images/alexa/2.jpg",
    "mobile": "/images/alexa/8.jpg"
  },
  "home-3": {
    "desktop": "/images/alexa/3.jpg",
    "mobile": "/images/alexa/9.jpg"
  },
  "home-4": {
    "desktop": "/images/alexa/4.jpg",
    "mobile": "/images/alexa/10.jpg"
  },
  "experience-1": {
    "desktop": "/images/caesar%20/3.jpg",
    "mobile": "/images/alexa/11.jpg"
  },
  "experience-2": {
    "desktop": "/images/caesar%20/4.jpg",
    "mobile": "/images/caesar%20/2.jpg"
  },
  "experience-3": {
    "desktop": "/images/caesar%20/7.jpg",
    "mobile": "/images/caesar%20/5.jpg"
  },
  "experience-4": {
    "desktop": "/images/caesar%20/8.jpg",
    "mobile": "/images/irene/1.jpg"
  },
  "experience-5": {
    "desktop": "/images/irene/3.jpg",
    "mobile": "/images/mafia/2.jpg"
  },
  "experience-6": {
    "desktop": "/images/irene/5.jpg",
    "mobile": "/images/mafia/3.jpg"
  },
  "about-1": {
    "desktop": "/images/irene/6.jpg",
    "mobile": "/images/monica/6.jpg"
  },
  "about-2": {
    "desktop": "/images/irene/7.jpg",
    "mobile": "/images/monica/9.jpg"
  },
  "about-3": {
    "desktop": "/images/irene/8.jpg",
    "mobile": "/images/pablo/5.jpg"
  },
  "apartments-1": {
    "desktop": "/images/mafia/1.jpg",
    "mobile": "/images/pablo/7.jpg"
  },
  "apartments-2": {
    "desktop": "/images/mafia/4.jpg",
    "mobile": "/images/pablo/8.jpg"
  },
  "apartments-3": {
    "desktop": "/images/mafia/5.jpg",
    "mobile": "/images/ragnar/1.jpg"
  },
  "amenities-1": {
    "desktop": "/images/monica/2.jpg",
    "mobile": "/images/ragnar/2.jpg"
  },
  "amenities-2": {
    "desktop": "/images/monica/3.jpg",
    "mobile": "/images/ragnar/3.jpg"
  },
  "gallery-1": {
    "desktop": "/images/monica/4.jpg",
    "mobile": "/images/ragnar/4.jpg"
  },
  "gallery-2": {
    "desktop": "/images/monica/5.jpg",
    "mobile": "/images/ragnar/10.jpg"
  },
  "contact-1": {
    "desktop": "/images/monica/7.jpg",
    "mobile": "/images/rahat/1.jpg"
  },
  "contact-2": {
    "desktop": "/images/pablo/1.jpg",
    "mobile": "/images/rahat/5.jpg"
  },
  "location-1": {
    "desktop": "/images/pablo/2.jpg",
    "mobile": "/images/rahat/6.jpg"
  },
  "location-2": {
    "desktop": "/images/pablo/3.jpg",
    "mobile": "/images/rahat/8.jpg"
  },
  "location-3": {
    "desktop": "/images/ragnar/5.jpg",
    "mobile": "/images/rahat/9.jpg"
  },
  "amenities-3": {
    "desktop": "/images/ragnar/6.jpg",
    "mobile": "/images/sunita/8.jpg"
  },
  "amenities-4": {
    "desktop": "/images/ragnar/7.jpg",
    "mobile": "/images/sunita/9.jpg"
  },
  "gallery-3": {
    "desktop": "/images/rahat/2.jpg",
    "mobile": "/images/theresa/1.jpg"
  }
};

export const apartmentBackgrounds: Record<string, ApartmentImagePair> = {
  "alexa": {
    "desktop": "/images/alexa/5.jpg",
    "mobile": "/images/alexa/12.jpg"
  },
  "caesar": {
    "desktop": "/images/caesar%20/9.jpg",
    "mobile": "/images/caesar%20/6.jpg"
  },
  "irene": {
    "desktop": "/images/irene/9.jpg",
    "mobile": "/images/irene/2.jpg"
  },
  "mafia": {
    "desktop": "/images/mafia/8.jpg",
    "mobile": "/images/mafia/7.jpg"
  },
  "monica": {
    "desktop": "/images/monica/8.jpg",
    "mobile": "/images/monica/10.jpg"
  },
  "pablo": {
    "desktop": "/images/pablo/4.jpg",
    "mobile": "/images/pablo/9.jpg"
  },
  "ragnar": {
    "desktop": "/images/ragnar/9.jpg",
    "mobile": "/images/ragnar/11.jpg"
  },
  "rahat": {
    "desktop": "/images/rahat/11.jpg",
    "mobile": "/images/rahat/12.jpg"
  },
  "sunita": {
    "desktop": "/images/sunita/7.jpg",
    "mobile": "/images/sunita/10.jpg"
  },
  "theresa": {
    "desktop": "/images/theresa/10.jpg",
    "mobile": "/images/theresa/12.jpg"
  }
};

export const reservedBackgroundImages = new Set(
  [...Object.values(siteImages), ...Object.values(apartmentBackgrounds)]
    .flatMap(image => [image.desktop, image.mobile]),
);
