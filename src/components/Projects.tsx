import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, Smartphone } from "lucide-react";

const Projects = () => {
  const flutterProjects = [
    {
      title: "E-Commerce Application",
      role: "Flutter Developer",
      description:
        "Cross-platform e-commerce app with authentication, product browsing, cart, and secure Stripe payments.",
      techStack: [
        "Flutter",
        "Dart",
        "Cubit",
        "Firebase Auth",
        "Stripe API",
        "REST APIs",
        "Responsive UI",
      ],
      features: [
        "User registration and login with secure auth",
        "Product listing with category filtering",
        "Real-time cart management and checkout",
        "Stripe payment integration with secure handling",
        "Modern, responsive e-commerce UI for Android & iOS",
      ],
      github: "#",
      demo: "#",
    },
    {
      title: "Movies Application",
      role: "Flutter Developer",
      description:
        "Movie browsing app using TMDb API with elegant UI and clean Cubit architecture.",
      techStack: [
        "Flutter",
        "Dart",
        "Cubit/Bloc",
        "Dio",
        "GetIt",
        "TMDb API",
        "Clean Architecture",
      ],
      features: [
        "View now-playing and upcoming movies",
        "Detailed movie information pages",
        "Favorites management",
        "Light and dark themes",
        "Bilingual support (English & Arabic)",
        "Fully responsive design with clean architecture",
      ],
      github: "#",
      demo: "#",
    },
    {
      title: "Coffee Application",
      role: "Flutter Developer",
      description:
        "Coffee ordering experience with smooth animations and delivery tracking.",
      techStack: [
        "Flutter",
        "Dart",
        "Cubit/Bloc",
        "Equatable",
        "OpenStreetMap",
        "Animations",
      ],
      features: [
        "Animated welcome and onboarding screens",
        "Categorized home screen with search and offers",
        "Product detail page with size selection and favorites",
        "Order screen with editable address and payment summary",
        "Real-time delivery tracking using OpenStreetMap",
      ],
      github: "#",
      demo: "#",
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
      github: "#",
      demo: "#",
    },
    {
      title: "Currency Converter",
      role: "Flutter Developer",
      description: "Real-time currency conversion with a live API.",
      techStack: ["Flutter", "Dart", "Cubit", "REST API"],
      features: ["Fetch live exchange rates", "Simple and responsive UI"],
      github: "#",
      demo: "#",
    },
    {
      title: "Scan QR",
      role: "Flutter Developer",
      description: "Barcode / QR scanner app.",
      techStack: ["Flutter", "Dart", "barcode_scan"],
      features: ["Scan and display QR/barcode data"],
      github: "#",
      demo: "#",
    },
    {
      title: "Scientific Research Discover",
      role: "Flutter Developer",
      description: "App to search, filter, and bookmark academic papers using public APIs.",
      techStack: ["Flutter", "Dart", "Cubit", "REST API"],
      features: ["Search academic papers", "Filter and bookmark research"],
      github: "#",
      demo: "#",
    },
    {
      title: "Random Quote Generator",
      role: "Flutter Developer",
      description: "Lightweight app that shows random motivational quotes.",
      techStack: ["Flutter", "Dart", "Cubit"],
      features: ["Display random quotes", "Simple, clean UI"],
      github: "#",
      demo: "#",
    },
  ];

  const frontendProjects = [
    {
      title: "E-Commerce Website",
      role: "Front-end Web Developer",
      description:
        "Full-featured e-commerce website with secure auth, cart, wishlist, and admin dashboard.",
      techStack: [
        "HTML5",
        "CSS3",
        "JavaScript (ES6+)",
        "Firebase Auth",
        "Firestore",
        "Supabase Storage",
        "PayPal SDK",
        "REST APIs",
      ],
      features: [
        "User registration, login, and email verification",
        "Product browsing with category filtering and wishlist",
        "Real-time cart management and checkout",
        "PayPal integration for secure payments",
        "Admin dashboard for product CRUD, inventory tracking, order management, and analytics",
        "Responsive, fast-loading, and accessible UI",
      ],
      github: "#",
      demo: "#",
    },
    {
      title: "Up-Course E-learning Website",
      role: "Front-end Web Developer",
      description:
        "E-learning platform with dual authentication, payments, and instructor dashboards.",
      techStack: [
        "React 18",
        "Redux Toolkit",
        "Tailwind CSS",
        "Vite",
        "Firebase Auth",
        "Firestore",
        "Supabase Storage",
        "PayPal SDK",
        "React Router v6",
        "i18next",
      ],
      features: [
        "Email/password and Google OAuth authentication",
        "Course browsing, enrollment, and PayPal-powered payments",
        "Instructor dashboard with full course CRUD",
        "Media management via Supabase and YouTube playlist embedding",
        "Multi-language support (English & Arabic) and light/dark themes",
        "Analytics and mobile-first, accessible design",
      ],
      github: "#",
      demo: "#",
    },
    {
      title: "Enjez Services Website",
      role: "Front-end Web Developer",
      description: "Service booking platform connecting users with agencies.",
      techStack: [
        "React 18",
        "Redux Toolkit",
        "Tailwind CSS",
        "Firebase Auth",
        "Firestore",
        "Push Notifications",
        "Stripe/PayPal",
        "React Router v6",
        "i18next",
      ],
      features: [
        "Browse and book services with an intuitive flow",
        "Real-time booking confirmations and messaging between clients and providers",
        "Notifications for users and agencies",
        "Dynamic service CRUD for admins",
        "Customizable agency profiles",
        "Mobile-first design and real-time booking updates",
      ],
      github: "#",
      demo: "#",
    },
  ];

  return (
    <section id="projects" className="py-20 section-light">
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
              <TabsTrigger value="flutter" className="text-base">
                Flutter Projects
              </TabsTrigger>
              <TabsTrigger value="frontend" className="text-base">
                Front-end Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flutter" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {flutterProjects.map((project, index) => (
                  <Card key={index} className="hover-lift border-border/50 hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Smartphone className="h-8 w-8 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {project.role}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="text-base">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                          Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                          Key Features
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {project.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.github} target="_blank" rel="noopener noreferrer">
                            <Github className="mr-2 h-4 w-4" /> GitHub
                          </a>
                        </Button>
                        <Button size="sm" className="gradient-primary text-white" asChild>
                          <a href={project.demo} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> View Project
                          </a>
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
                  <Card key={index} className="hover-lift border-border/50 hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <ExternalLink className="h-8 w-8 text-secondary" />
                        <Badge variant="outline" className="text-xs">
                          {project.role}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{project.title}</CardTitle>
                      <CardDescription className="text-base">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                          Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                          Key Features
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {project.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-secondary mt-1">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.github} target="_blank" rel="noopener noreferrer">
                            <Github className="mr-2 h-4 w-4" /> GitHub
                          </a>
                        </Button>
                        <Button size="sm" className="bg-secondary text-secondary-foreground hover:opacity-90" asChild>
                          <a href={project.demo} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default Projects;
