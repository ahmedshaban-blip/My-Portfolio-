import { useEffect, useState } from "react";
import { Menu, X, Download, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// مكون ModeToggle المطور للتبديل المباشر بضغطة واحدة
const ModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="rounded-full border-border glass-effect bg-background/50">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="rounded-full border-border glass-effect bg-background/50 hover:bg-accent transition-all duration-300"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const links = [
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Experience", href: "#experience" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-6 left-0 right-0 z-[100] px-4">
      <nav className={cn(
        "max-w-6xl mx-auto transition-all duration-500 rounded-full border relative",
        isScrolled 
          ? "bg-background/95 backdrop-blur-xl border-border shadow-lg py-3 px-8" 
          : "bg-transparent border-transparent py-5 px-6"
      )}>
        <div className="flex items-center justify-between">
          <a href="#home" className="text-xl font-bold tracking-tighter whitespace-nowrap hover:opacity-80 transition-opacity">
            AHMED <span className="text-blue-500">SHABAN</span>
          </a>

          {/* روابط سطح المكتب */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* أزرار الأكشن لسطح المكتب */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle />
            <Button 
              size="sm" 
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 transition-all active:scale-95 shadow-md shadow-blue-500/20"
              onClick={() => handleDownloadCV("flutter")}
            >
              <Download className="w-4 h-4 mr-2" /> Flutter CV
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-full bg-background/50 backdrop-blur-sm px-5 border-border hover:bg-accent transition-all active:scale-95"
              onClick={() => handleDownloadCV("frontend")}
            >
              <Download className="w-4 h-4 mr-2" /> Frontend CV
            </Button>
          </div>

          {/* أيقونة المنيو للموبايل */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <button 
              className="text-foreground p-2 rounded-full hover:bg-accent transition-colors" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* قائمة الموبايل المنسدلة - تم حل مشكلة الشفافية كلياً */}
        {isOpen && (
          <div className="absolute top-[calc(100%+1.5rem)] left-0 right-0 p-8 bg-background border border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-[2.5rem] md:hidden animate-in fade-in slide-in-from-top-6 duration-300 z-[110]">
             <div className="flex flex-col gap-6">
                {links.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className="text-center text-xl font-bold text-foreground hover:text-blue-500 transition-colors py-2 border-b border-border/50 last:border-none" 
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                
                {/* أزرار التحميل للموبايل */}
                <div className="grid grid-cols-1 gap-4 pt-6">
                  <Button 
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white w-full h-14 text-lg font-bold transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                    onClick={() => { handleDownloadCV("flutter"); setIsOpen(false); }}
                  >
                    <Download className="w-5 h-5 mr-2" /> Flutter CV
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-full bg-secondary border-border text-foreground w-full h-14 text-lg font-bold hover:bg-accent transition-all active:scale-95"
                    onClick={() => { handleDownloadCV("frontend"); setIsOpen(false); }}
                  >
                    <Download className="w-5 h-5 mr-2" /> Frontend CV
                  </Button>
                </div>
             </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;