export type Project = {
  title: string;
  role: string;
  description: string;
  techStack: string[];
  features: string[];
  github: string;
  demo: string;
};

export const flutterProjects: Project[] = [
  {
    title: "Enjez Mobile Application",
    role: "Cross-Platform Developer",
    description: "Connects users with trusted home service providers, allowing booking and payment management.",
    techStack: ["React Native", "Expo", "Firebase", "PayPal", "RAG Technique"],
    features: [
      "Role-based access (Client / Provider)",
      "Advanced Recommendation System for personalized services",
      "Intelligent AI Chatbot integrated with RAG technique",
      "Secure PayPal payment integration",
      "Real-time service discovery and tracking"
    ],
    github: "https://github.com/ahmedshaban-blip/EnjezMobileAppVersion",
    demo: "https://drive.google.com/file/d/1Dx9eljBBLQm1gtG8V3AGdzn2NEwKEnpc/view?usp=sharing",
  },
  {
    title: "E-Commerce Application",
    role: "Flutter Developer",
    description: "Full e-commerce experience with product browsing, cart, and secure Stripe payments.",
    techStack: ["Flutter", "Dart", "Cubit", "Firebase Auth", "Stripe API"],
    features: ["Secure authentication", "Real-time cart", "Stripe payment integration", "Responsive UI"],
    github: "https://github.com/ahmedshaban-blip/CodeAlpha_E-Commerce-Application",
    demo: "https://github.com/ahmedshaban-blip/CodeAlpha_E-Commerce-Application",
  },
  {
    title: "Movies Application",
    role: "Flutter Developer",
    description: "Movie browsing app using TMDb API with clean Cubit architecture and elegant UI.",
    techStack: ["Flutter", "Dart", "Dio", "TMDb API", "Clean Architecture"],
    features: ["Upcoming movies", "Favorites management", "Bilingual support", "Light/Dark themes"],
    github: "https://github.com/ahmedshaban-blip/Flutter_Movies_App",
    demo: "https://github.com/ahmedshaban-blip/Flutter_Movies_App",
  },
  {
    title: "Coffee Application",
    role: "Flutter Developer",
    description: "Coffee ordering experience with smooth animations and real-time delivery tracking.",
    techStack: ["Flutter", "Dart", "Cubit", "OpenStreetMap", "Animations"],
    features: ["Onboarding screens", "Size selection", "Real-time delivery tracking", "Order summary"],
    github: "https://github.com/ahmedshaban-blip/CoffeeApplication",
    demo: "https://github.com/ahmedshaban-blip/CoffeeApplication",
  },
  {
    title: "RSS Reader Pro",
    role: "Flutter Developer",
    description: "Modern RSS reader with article parsing, clean architecture, and smooth UI.",
    techStack: ["Flutter", "Dart", "XML Parsing", "Url Launcher", "Share Plus"],
    features: ["Fetch RSS feeds", "Article pagination", "Image extraction", "Social sharing"],
    github: "https://github.com/ahmedshaban-blip/rss-reader",
    demo: "https://github.com/ahmedshaban-blip/rss-reader",
  },
  {
    title: "Flashcard Quiz",
    role: "Flutter Developer",
    description: "Study app using flashcards with flip animations and progress tracking.",
    techStack: ["Flutter", "Dart", "Cubit", "SharedPreferences"],
    features: ["Flip animations", "Full CRUD", "Study mode", "Local storage persistence"],
    github: "https://github.com/ahmedshaban-blip/CodeAlpha_FlashCardQuizApplication",
    demo: "https://github.com/ahmedshaban-blip/CodeAlpha_FlashCardQuizApplication",
  },
  {
    title: "Currency Converter",
    role: "Flutter Developer",
    description: "Real-time currency conversion tool using a live exchange rate API.",
    techStack: ["Flutter", "Dart", "Cubit", "REST API"],
    features: ["Live exchange rates", "Fast calculation", "Clean interface"],
    github: "https://github.com/ahmedshaban-blip/currency_converter",
    demo: "https://github.com/ahmedshaban-blip/currency_converter",
  },
  {
    title: "Scan QR",
    role: "Flutter Developer",
    description: "Fast and lightweight Barcode and QR code scanner application.",
    techStack: ["Flutter", "Dart", "Barcode Scan Library"],
    features: ["Instant scanning", "Display QR data", "Copy to clipboard"],
    github: "https://github.com/ahmedshaban-blip/scan_qr",
    demo: "https://github.com/ahmedshaban-blip/scan_qr",
  },
  {
    title: "Scientific Research Discover",
    role: "Flutter Developer",
    description: "Discover, filter, and bookmark academic papers using public APIs.",
    techStack: ["Flutter", "Dart", "REST API", "State Management"],
    features: ["Academic search", "Filtering tools", "Personal bookmarks"],
    github: "https://github.com/ahmedshaban-blip/scientific_research_discover",
    demo: "https://github.com/ahmedshaban-blip/scientific_research_discover",
  },
  {
    title: "Random Quote Generator",
    role: "Flutter Developer",
    description: "Motivational tool providing daily random quotes with a minimalist design.",
    techStack: ["Flutter", "Dart", "Cubit"],
    features: ["Daily quotes", "Instant generation", "Clean typography"],
    github: "https://github.com/ahmedshaban-blip/CodeAlpha_RandomQuoteGenerator",
    demo: "https://github.com/ahmedshaban-blip/CodeAlpha_RandomQuoteGenerator",
  },
];

export const frontendProjects: Project[] = [
  {
    title: "Enjez Services Website",
    role: "Frontend Web Developer",
    description: "Service booking platform connecting users with professional agencies.",
    techStack: ["React 18", "Redux Toolkit", "Tailwind CSS", "Stripe", "AI Integration"],
    features: [
      "Agency and Client dashboards",
      "Smart Recommendation System for users",
      "AI Chatbot with RAG support for automated assistance",
      "Secure Stripe payment integration",
      "Real-time agency messaging system"
    ],
    github: "https://github.com/ahmedshaban-blip/Enjez",
    demo: "https://enjez.vercel.app/home",
  },
  {
    title: "E-Commerce Website",
    role: "Frontend Web Developer",
    description: "Comprehensive store with auth, wishlist, and admin analytics dashboard.",
    techStack: ["JavaScript", "Firebase Auth", "Firestore", "PayPal SDK"],
    features: ["Admin Dashboard", "Inventory tracking", "Order management", "PayPal integration"],
    github: "https://github.com/ahmedshaban-blip/E-Commerce-WebSite",
    demo: "https://ahmedshaban-blip.github.io/E-Commerce-WebSite/project%20js%20team/LoginPage/loginPage.html",
  },
  {
    title: "Up-Course E-learning",
    role: "Frontend Web Developer",
    description: "E-learning platform with dual auth, payments, and media management.",
    techStack: ["React 18", "Redux", "Supabase", "PayPal", "Vite"],
    features: ["Instructor Dashboard", "YouTube Integration", "Course CRUD", "Enrollment system"],
    github: "https://github.com/ahmedshaban-blip/E-Learning-WebSite-With-React-JS",
    demo: "https://up-course-1.vercel.app/",
  },
];
