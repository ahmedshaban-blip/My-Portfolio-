import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Github, ExternalLink, Smartphone } from "lucide-react";

type Project = {
  title: string;
  role: string;
  description: string;
  techStack: string[];
  features: string[];
  github: string;
  demo: string;
};

const Projects = () => {
  const flutterProjects: Project[] = [
    {
  title: "Enjez Mobile Application",
  role: "React Native / Cross-Platform Developer",
  description:
    "Cross-platform mobile app that connects users with trusted home service providers, allowing service discovery, booking, and payment management with role-based access.",
  techStack: [
    "React Native",
    "Expo",
    "JavaScript",
    "Firebase Authentication",
    "Firestore",
    "React Navigation",
    "React Context API",
    "NativeWind (Tailwind CSS)",
    "React Native Paper",
    "PayPal Integration",
  ],
  features: [
    "User authentication with role-based navigation (Client / Admin)",
    "Browse, search, and filter home services by category",
    "Personalized service recommendations based on booking history",
    "Detailed service pages with pricing, duration, and images",
    "Multi-step service booking with date and time selection",
    "Booking status tracking (Pending, Confirmed, Completed, Cancelled)",
    "Integrated PayPal payments with offline payment option",
    "User profile management and password change with re-authentication",
    "Admin dashboard for managing services and bookings",
    "Built-in AI chatbot for user assistance",
  ],
  github: "https://github.com/ahmedshaban-blip/EnjezMobileAppVersion",
  demo: "https://drive.google.com/file/d/1Dx9eljBBLQm1gtG8V3AGdzn2NEwKEnpc/view?usp=sharing",
},

    {
      title: "E-Commerce Application",
      role: "Flutter Developer",
      description:
        "Cross-platform e-commerce app with authentication, product browsing, cart, and secure Stripe payments.",
      techStack: ["Flutter", "Dart", "Cubit", "Firebase Auth", "Stripe API", "REST APIs", "Responsive UI"],
      features: [
        "User registration and login with secure auth",
        "Product listing with category filtering",
        "Real-time cart management and checkout",
        "Stripe payment integration with secure handling",
        "Modern, responsive e-commerce UI for Android & iOS",
      ],
      github: "https://github.com/ahmedshaban-blip/CodeAlpha_E-Commerce-Application",
      demo: "https://github.com/ahmedshaban-blip/CodeAlpha_E-Commerce-Application",
    },
    {
      title: "Movies Application",
      role: "Flutter Developer",
      description: "Movie browsing app using TMDb API with elegant UI and clean Cubit architecture.",
      techStack: ["Flutter", "Dart", "Cubit/Bloc", "Dio", "GetIt", "TMDb API", "Clean Architecture"],
      features: [
        "View now-playing and upcoming movies",
        "Detailed movie information pages",
        "Favorites management",
        "Light and dark themes",
        "Bilingual support (English & Arabic)",
        "Fully responsive design with clean architecture",
      ],
      github: "https://github.com/ahmedshaban-blip/Flutter_Movies_App",
      demo: "https://github.com/ahmedshaban-blip/Flutter_Movies_App",
    },
    {
      title: "Coffee Application",
      role: "Flutter Developer",
      description: "Coffee ordering experience with smooth animations and delivery tracking.",
      techStack: ["Flutter", "Dart", "Cubit/Bloc", "Equatable", "OpenStreetMap", "Animations"],
      features: [
        "Animated welcome and onboarding screens",
        "Categorized home screen with search and offers",
        "Product detail page with size selection and favorites",
        "Order screen with editable address and payment summary",
        "Real-time delivery tracking using OpenStreetMap",
      ],
      github: "https://github.com/ahmedshaban-blip/CoffeeApplication",
      demo: "https://github.com/ahmedshaban-blip/CoffeeApplication",
    },
    {
      title: "RSS Reader Pro",
      role: "Flutter Developer",
      description:
        "Modern RSS reader app with clean architecture, article parsing, smooth UI, and external browser integration.",
      techStack: ["Flutter", "Dart", "Clean Architecture", "Cubit/Bloc", "http", "xml", "url_launcher", "share_plus", "Equatable"],
      features: [
        "Fetch and parse RSS feed from any URL",
        "Paginated article listing with featured images",
        "Detailed article view with full description",
        "Automatic image extraction from RSS item content",
        "Efficient pagination with Load More functionality",
        "Open articles in external web browser",
        "Share article links easily",
        "Modern animated UI with gradients and custom clippers",
      ],
      github: "https://github.com/ahmedshaban-blip/rss-reader",
      demo: "https://github.com/ahmedshaban-blip/rss-reader",
    },
    {
      title: "Flashcard Quiz Application",
      role: "Flutter Developer",
      description: "Flashcard-based study app with CRUD and progress tracking.",
      techStack: ["Flutter", "Dart", "Cubit", "SharedPreferences", "Material 3"],
      features: [
        "Flip animation for question/answer",
        "Full CRUD for flashcards",
        "Study mode with navigation and progress tracking",
        "Persistent local storage",
        "Responsive UI and robust error handling",
      ],
      github: "https://github.com/ahmedshaban-blip/CodeAlpha_FlashCardQuizApplication",
      demo: "https://github.com/ahmedshaban-blip/CodeAlpha_FlashCardQuizApplication",
    },
    {
      title: "Currency Converter",
      role: "Flutter Developer",
      description: "Real-time currency conversion with a live API.",
      techStack: ["Flutter", "Dart", "Cubit", "REST API"],
      features: ["Fetch live exchange rates", "Simple and responsive UI"],
      github: "https://github.com/ahmedshaban-blip/currency_converter",
      demo: "https://github.com/ahmedshaban-blip/currency_converter",
    },
    {
      title: "Scan QR",
      role: "Flutter Developer",
      description: "Barcode / QR scanner app.",
      techStack: ["Flutter", "Dart", "barcode_scan"],
      features: ["Scan and display QR/barcode data"],
      github: "https://github.com/ahmedshaban-blip/scan_qr",
      demo: "https://github.com/ahmedshaban-blip/scan_qr",
    },
    {
      title: "Scientific Research Discover",
      role: "Flutter Developer",
      description: "App to search, filter, and bookmark academic papers using public APIs.",
      techStack: ["Flutter", "Dart", "Cubit", "REST API"],
      features: ["Search academic papers", "Filter and bookmark research"],
      github: "https://github.com/ahmedshaban-blip/scientific_research_discover",
      demo: "https://github.com/ahmedshaban-blip/scientific_research_discover",
    },
    {
      title: "Random Quote Generator",
      role: "Flutter Developer",
      description: "Lightweight app that shows random motivational quotes.",
      techStack: ["Flutter", "Dart", "Cubit"],
      features: ["Display random quotes", "Simple, clean UI"],
      github: "https://github.com/ahmedshaban-blip/CodeAlpha_RandomQuoteGenerator",
      demo: "https://github.com/ahmedshaban-blip/CodeAlpha_RandomQuoteGenerator",
    },
  ];

  const frontendProjects: Project[] = [
    {
      title: "Enjez Services Website",
      role: "Front-end Web Developer",
      description: "Service booking platform connecting users with agencies.",
      techStack: ["React 18", "Redux Toolkit", "Tailwind CSS", "Firebase Auth", "Firestore", "Push Notifications", "Stripe/PayPal", "React Router v6", "i18next"],
      features: [
        "Browse and book services with an intuitive flow",
        "Real-time booking confirmations and messaging between clients and providers",
        "Notifications for users and agencies",
        "Dynamic service CRUD for admins",
        "Customizable agency profiles",
        "Mobile-first design and real-time booking updates",
      ],
      github: "https://github.com/ahmedshaban-blip/Enjez",
      demo: "https://enjez.vercel.app/home",
    },
    {
      title: "E-Commerce Website",
      role: "Front-end Web Developer",
      description: "Full-featured e-commerce website with secure auth, cart, wishlist, and admin dashboard.",
      techStack: ["HTML5", "CSS3", "JavaScript (ES6+)", "Firebase Auth", "Firestore", "Supabase Storage", "PayPal SDK", "REST APIs"],
      features: [
        "User registration, login, and email verification",
        "Product browsing with category filtering and wishlist",
        "Real-time cart management and checkout",
        "PayPal integration for secure payments",
        "Admin dashboard for product CRUD, inventory tracking, order management, and analytics",
        "Responsive, fast-loading, and accessible UI",
      ],
      github: "https://github.com/ahmedshaban-blip/E-Commerce-WebSite",
      demo: "https://ahmedshaban-blip.github.io/E-Commerce-WebSite/project%20js%20team/LoginPage/loginPage.html",
    },
    {
      title: "Up-Course E-learning Website",
      role: "Front-end Web Developer",
      description: "E-learning platform with dual authentication, payments, and instructor dashboards.",
      techStack: ["React 18", "Redux Toolkit", "Tailwind CSS", "Vite", "Firebase Auth", "Firestore", "Supabase Storage", "PayPal SDK", "React Router v6", "i18next"],
      features: [
        "Email/password and Google OAuth authentication",
        "Course browsing, enrollment, and PayPal-powered payments",
        "Instructor dashboard with full course CRUD",
        "Media management via Supabase and YouTube playlist embedding",
        "Multi-language support (English & Arabic) and light/dark themes",
        "Analytics and mobile-first, accessible design",
      ],
      github: "https://github.com/ahmedshaban-blip/E-Learning-WebSite-With-React-JS",
      demo: "https://up-course-1.vercel.app/",
    },
  ];

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  const openDetails = (p: Project) => {
    setSelected(p);
    setOpen(true);
  };

  const gridCardClass = "glass hover-lift border-border/60 hover:shadow-xl transition-all rounded-2xl";

  const selectedShort = useMemo(() => {
    if (!selected) return null;
    return {
      ...selected,
      features: selected.features ?? [],
      techStack: selected.techStack ?? [],
    };
  }, [selected]);

  return (
    <section id="projects" className="py-24 section-light">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <div className="w-20 h-1 gradient-primary mx-auto rounded-full" />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A showcase of my work in Flutter mobile development and modern web applications
            </p>
          </div>

          <Tabs defaultValue="flutter" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="flutter" className="text-base">Flutter</TabsTrigger>
              <TabsTrigger value="frontend" className="text-base">Front-end</TabsTrigger>
            </TabsList>

            <TabsContent value="flutter" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {flutterProjects.map((project, index) => (
                  <Card key={index} className={gridCardClass}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Smartphone className="h-8 w-8 text-primary" />
                        <Badge variant="outline" className="text-xs">{project.role}</Badge>
                      </div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="text-base">{project.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-semibold text-sm mb-2 text-muted-foreground">Tech Stack</p>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.slice(0, 8).map((tech, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.github} target="_blank" rel="noopener noreferrer">
                            <Github className="mr-2 h-4 w-4" /> GitHub
                          </a>
                        </Button>

                        <Button size="sm" className="gradient-primary text-white" asChild>
                          <a href={project.demo} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Demo
                          </a>
                        </Button>

                        <Button size="sm" variant="secondary" onClick={() => openDetails(project)}>
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="frontend" className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {frontendProjects.map((project, index) => (
                  <Card key={index} className={gridCardClass}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <ExternalLink className="h-8 w-8 text-secondary" />
                        <Badge variant="outline" className="text-xs">{project.role}</Badge>
                      </div>
                      <CardTitle className="text-2xl">{project.title}</CardTitle>
                      <CardDescription className="text-base">{project.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-semibold text-sm mb-2 text-muted-foreground">Tech Stack</p>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.slice(0, 10).map((tech, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.github} target="_blank" rel="noopener noreferrer">
                            <Github className="mr-2 h-4 w-4" /> GitHub
                          </a>
                        </Button>

                        <Button size="sm" className="bg-secondary text-secondary-foreground hover:opacity-90" asChild>
                          <a href={project.demo} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Live
                          </a>
                        </Button>

                        <Button size="sm" variant="secondary" onClick={() => openDetails(project)}>
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedShort?.title}</DialogTitle>
                <DialogDescription>{selectedShort?.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedShort?.techStack?.map((t, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Key Features</p>
                  <ul className="space-y-2 text-sm">
                    {selectedShort?.features?.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedShort?.github && (
                    <Button variant="outline" asChild>
                      <a href={selectedShort.github} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" /> GitHub
                      </a>
                    </Button>
                  )}
                  {selectedShort?.demo && (
                    <Button className="gradient-primary text-white" asChild>
                      <a href={selectedShort.demo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Open
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default Projects;
