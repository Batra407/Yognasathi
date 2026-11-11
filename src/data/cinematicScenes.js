/**
 * YojanaSathi — Cinematic Background Video Storyboard Configuration
 *
 * Defines the 6 authentic, high-quality Indian video scenes that cycle seamlessly
 * in the full-width Scale.com-style hero background.
 */

export const CINEMATIC_SCENES = [
  {
    id: "scene-1-nation",
    num: "01",
    category: "Nation & Landscapes",
    title: "The Scale and Horizons of India",
    tagline: "Vast geographical horizons from Himalayan peaks to coastal peninsulas.",
    videoSrc: "/videos/scene_landscape_1080p.webm", // 1920x1080 Full HD daylight mountain landscape
    posterSrc: "/images/scene_aerial.jpg",
    fallbackPoster: "/images/scene_aerial.jpg",
    duration: 8,
    theme: "aerial",
  },
  {
    id: "scene-2-agriculture",
    num: "02",
    category: "Agriculture & Farmers",
    title: "Sustaining the Nation's Agriculture",
    tagline: "Direct income support and mechanized subsidies for 140 million agricultural households.",
    videoSrc: "/videos/scene_rural_4k.webm", // 3840x2160 4K UHD rural pastoral countryside
    posterSrc: "/images/scene_farmer.jpg",
    fallbackPoster: "/images/scene_farmer.jpg",
    duration: 8,
    theme: "farming",
  },
  {
    id: "scene-3-education",
    num: "03",
    category: "Education & Youth",
    title: "Empowering Next-Generation Scholars",
    tagline: "Merit scholarships, tuition fee waivers, and STEM fellowships for aspiring students.",
    videoSrc: "/videos/scene_education.webm", // Indian students & classroom learning
    posterSrc: "/images/scene_student.jpg",
    fallbackPoster: "/images/scene_student.jpg",
    duration: 8,
    theme: "education",
  },
  {
    id: "scene-4-women",
    num: "04",
    category: "Women & Entrepreneurship",
    title: "Fostering Grassroots Micro-Enterprises",
    tagline: "Self-help group capital grants and collateral-free microcredit for women artisans.",
    videoSrc: "/videos/scene_weaving_1080p.webm", // 1920x1080 Full HD Indian handloom artisan weaving
    posterSrc: "/images/scene_women_entrepreneur.jpg",
    fallbackPoster: "/images/scene_women_entrepreneur.jpg",
    duration: 8,
    theme: "women",
  },
  {
    id: "scene-5-citizens",
    num: "05",
    category: "Services & Citizens",
    title: "Transparent, Accessible Entitlements",
    tagline: "Connecting citizens directly to verified state and central public assistance portals.",
    videoSrc: "/videos/scene_artisans.webm", // Traditional potter crafting & citizen welfare
    posterSrc: "/images/scene_microphone.jpg",
    fallbackPoster: "/images/scene_microphone.jpg",
    duration: 8,
    theme: "citizens",
  },
  {
    id: "scene-6-development",
    num: "06",
    category: "Modern India & Infrastructure",
    title: "Building Modern, Connected India",
    tagline: "Digital public infrastructure, modern expressways, and clean energy networks.",
    videoSrc: "/videos/scene_highway_1080p.webm", // 1920x1080 Full HD Himalayan modern transit highway in daylight
    posterSrc: "/images/scene_development.jpg",
    fallbackPoster: "/images/scene_development.jpg",
    duration: 8,
    theme: "development",
  },
];
