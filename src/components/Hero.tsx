import { ArrowRight, Github, Linkedin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadCV = (type: "flutter" | "frontend") => {
    const link = document.createElement("a");
    if (type === "flutter") {
      link.href = "/public/Ahmed Shaban--Flutter Developer.pdf";
      link.download = "Ahmed-Shaban-Flutter-CV.pdf";
    } else {
      link.href = "/public/Ahmed Shaban Front--End Web Developer.pdf";
      link.download = "Ahmed-Shaban-Frontend-CV.pdf";
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 z-0" />

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold">
              Hi, I'm <span className="gradient-text">Ahmed Shaban</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-muted-foreground">
              Flutter Developer & Front-end Web Developer
            </h2>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fresh graduate with strong hands-on experience building
            cross-platform mobile apps with Flutter and modern web applications
            with React. Specialized in Clean Architecture, state management,
            REST APIs, and creating elegant, maintainable solutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="gradient-primary text-white hover:opacity-90 transition-opacity"
              onClick={() => scrollToSection("projects")}
            >
              View Flutter Projects <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("projects")}
            >
              View Front-end Projects
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleDownloadCV("flutter")}
            >
              Download Flutter CV
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleDownloadCV("frontend")}
            >
              Download Front-end CV
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex gap-6 justify-center pt-8">
            <a
              href="mailto:ahmed.shabaan.dev@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="h-6 w-6" />
            </a>
            <a
              href="https://github.com/ahmedshaban-blip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/ahmedshaban-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="tel:+201114975104"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Phone"
            >
              <Phone className="h-6 w-6" />
            </a>
          </div>

          {/* Location */}
          <p className="text-sm text-muted-foreground">
            📍 Minya, Egypt • Available to relocate
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
