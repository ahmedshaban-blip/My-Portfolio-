import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Github, ExternalLink, Smartphone, Globe, Code2, Zap } from "lucide-react";

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
  // FULL ORIGINAL FLUTTER DATA
  const flutterProjects: Project[] = [
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

  // FULL ORIGINAL FRONTEND DATA
  const frontendProjects: Project[] = [
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

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  const ProjectCard = ({ project, isFlutter }: { project: Project; isFlutter: boolean }) => (
    <Card className="group glass-effect rounded-3xl md:rounded-[2.5rem] overflow-hidden hover:border-blue-500/50 transition-all duration-500 flex flex-col h-full border-border">
      <CardHeader className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
            {isFlutter ? <Smartphone size={24} className="md:w-7 md:h-7" /> : <Globe size={24} className="md:w-7 md:h-7" />}
          </div>
          <Badge variant="outline" className="border-border px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold tracking-wider uppercase">
            {project.role}
          </Badge>
        </div>
        
        <CardTitle className="text-xl md:text-2xl font-bold mb-2 md:mb-3 group-hover:text-blue-500 transition-colors">
          {project.title}
        </CardTitle>
        <CardDescription className="text-sm md:text-md text-muted-foreground line-clamp-2 mb-4 md:mb-6 leading-relaxed">
          {project.description}
        </CardDescription>

        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8">
          {project.techStack.map((tech, i) => (
            <span key={i} className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-muted-foreground bg-secondary/50 border border-border px-2 md:px-3 py-1 rounded-full">
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-auto pt-4 md:pt-6 border-t border-border">
          <Button variant="link" className="p-0 text-blue-500 hover:text-blue-600 text-xs md:text-sm" asChild>
            <a href={project.github} target="_blank" rel="noopener noreferrer">
              <Github size={14} className="md:w-4 md:h-4 mr-1.5 md:mr-2" /> Github
            </a>
          </Button>
          
          <div className="ml-auto flex gap-1.5 md:gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full text-[10px] md:text-xs px-3 md:px-4 h-8 md:h-9 bg-secondary border-border hover:bg-accent text-foreground" 
              onClick={() => { setSelected(project); setOpen(true); }}
            >
              Details
            </Button>
            <Button 
              size="sm" 
              className="rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all px-3 md:px-4 h-8 md:h-9 font-bold" 
              asChild
            >
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={12} className="md:w-3.5 md:h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <section id="projects" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] md:text-xs font-bold tracking-widest uppercase">
              <Zap size={12} className="md:w-3.5 md:h-3.5" /> My Portfolio
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-gradient tracking-tight">Engineering Excellence</h2>
            <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4">
              A comprehensive list of my work, ranging from complex mobile architectures to high-performance web applications.
            </p>
          </div>

          <Tabs defaultValue="flutter" className="w-full">
            <div className="flex justify-center mb-10 md:mb-16 overflow-x-auto pb-4 no-scrollbar">
              <TabsList className="bg-secondary/50 border border-border p-1 md:p-1.5 rounded-full h-12 md:h-16 inline-flex min-w-max">
                <TabsTrigger value="flutter" className="rounded-full px-6 md:px-12 text-sm md:text-lg font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                  Mobile Apps <span className="hidden sm:inline ml-1">({flutterProjects.length})</span>
                </TabsTrigger>
                <TabsTrigger value="frontend" className="rounded-full px-6 md:px-12 text-sm md:text-lg font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                  Web Projects <span className="hidden sm:inline ml-1">({frontendProjects.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="flutter" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in duration-700">
              {flutterProjects.map((project, idx) => (
                <ProjectCard key={idx} project={project} isFlutter={true} />
              ))}
            </TabsContent>

            <TabsContent value="frontend" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in duration-700">
              {frontendProjects.map((project, idx) => (
                <ProjectCard key={idx} project={project} isFlutter={false} />
              ))}
            </TabsContent>
          </Tabs>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-[95vw] md:max-w-2xl glass-effect border-border rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 text-foreground">{selected?.title}</DialogTitle>
                <DialogDescription className="text-sm md:text-lg text-muted-foreground leading-relaxed">
                  {selected?.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 md:space-y-10 mt-6 md:mt-8">
                <div>
                  <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-3 md:mb-4">Tech Stack Integration</h4>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {selected?.techStack?.map((t, i) => (
                      <Badge key={i} variant="outline" className="bg-secondary/50 border-border text-foreground px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-3 md:mb-4">Core Deliverables</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {selected?.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 md:gap-3 text-muted-foreground text-xs md:text-sm leading-snug">
                        <Code2 size={16} className="text-blue-500 mt-0.5 shrink-0 md:w-4 md:h-4" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 md:pt-8 border-t border-border">
                   <Button className="flex-1 rounded-full h-12 md:h-14 bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-500/20 text-sm md:text-base" asChild>
                    <a href={selected?.demo} target="_blank" rel="noopener noreferrer">Live Preview</a>
                   </Button>
                   <Button variant="outline" className="flex-1 rounded-full h-12 md:h-14 border-border bg-background text-foreground hover:bg-accent font-bold text-sm md:text-base transition-colors" asChild>
                    <a href={selected?.github} target="_blank" rel="noopener noreferrer">Source Code</a>
                   </Button>
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