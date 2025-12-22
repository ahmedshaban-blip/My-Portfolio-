import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/use-scrollspy";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#home", id: "home", label: "Home" },
    { href: "#about", id: "about", label: "About" },
    { href: "#skills", id: "skills", label: "Skills" },
    { href: "#projects", id: "projects", label: "Projects" },
    { href: "#experience", id: "experience", label: "Experience" },
    { href: "#contact", id: "contact", label: "Contact" },
  ];

  const activeId = useScrollSpy(navLinks.map((l) => l.id));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDownloadCV = (type: "flutter" | "frontend") => {
    const link = document.createElement("a");
    if (type === "flutter") {
      link.href = "/Ahmed Shaban--Flutter Developer.pdf";
      link.download = "Ahmed-Shaban-Flutter-CV.pdf";
    } else {
      link.href = "/Ahmed Shaban Front--End Web Developer.pdf";
      link.download = "Ahmed-Shaban-Frontend-CV.pdf";
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="h-16 grid grid-cols-[1fr_auto_1fr] items-center">
          <a
            href="#home"
            className="text-xl md:text-2xl font-bold gradient-text col-start-1"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#home");
            }}
          >
            Ahmed Shaban
          </a>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6 col-start-2">
            {navLinks.map((link) => {
              const isActive = activeId === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-primary" : "text-foreground/75 hover:text-foreground"
                  )}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="hidden md:flex items-center justify-end gap-2 col-start-3">
            <ModeToggle />
            <Button size="sm" onClick={() => handleDownloadCV("flutter")} className="gradient-primary text-white">
              Flutter CV
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDownloadCV("frontend")}>
              Front-end CV
            </Button>
          </div>

          {/* Mobile button */}
          <div className="md:hidden flex items-center justify-end gap-2 col-start-3">
            <ModeToggle />
            <button
              className="text-foreground p-2 rounded-lg hover:bg-accent transition"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-5 animate-fade-in">
            <div className="glass rounded-2xl p-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={cn(
                    "block py-2 px-2 rounded-lg text-sm font-medium transition",
                    activeId === link.id ? "bg-accent text-primary" : "text-foreground/80 hover:bg-accent"
                  )}
                >
                  {link.label}
                </a>
              ))}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button onClick={() => handleDownloadCV("flutter")} className="gradient-primary text-white">
                  Flutter CV
                </Button>
                <Button variant="outline" onClick={() => handleDownloadCV("frontend")}>
                  Front-end CV
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
