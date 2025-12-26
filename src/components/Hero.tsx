import { ArrowRight, Github, Linkedin, Mail, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
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
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Dynamic Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="space-y-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Open for new opportunities</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-tight text-gradient">
            Building Modern <br /> 
            <span className="text-blue-600 dark:text-blue-500">Mobile & Web</span> Solutions
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-300">
            I am Ahmed Shaban, a Computer Science graduate specializing in 
            <span className="text-foreground font-bold"> Flutter</span>, 
            <span className="text-foreground font-bold"> React Native</span>, and 
            <span className="text-foreground font-bold"> React</span>. 
            I build high-performance, cross-platform experiences with clean code.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6 animate-in fade-in duration-1000 delay-500">
            <Button 
              size="lg" 
              className="rounded-full h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95" 
              onClick={() => scrollToSection("projects")}
            >
              View Projects <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-2">
               <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full h-14 px-8 glass-effect border-border hover:bg-accent transition-all active:scale-95" 
                onClick={() => handleDownloadCV("flutter")}
              >
                <Download className="mr-2 w-4 h-4" /> Flutter CV
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full h-14 px-8 glass-effect border-border hover:bg-accent transition-all active:scale-95" 
                onClick={() => handleDownloadCV("frontend")}
              >
                <Download className="mr-2 w-4 h-4" /> Frontend CV
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-8 pt-12 animate-in fade-in duration-1000 delay-700">
            {[
              { icon: Github, href: "https://github.com/ahmedshaban-blip" },
              { icon: Linkedin, href: "https://www.linkedin.com/in/ahmedshaban-dev" },
              { icon: Mail, href: "mailto:ahmed.shabaan.dev@gmail.com" }
            ].map((social, i) => (
              <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-600 dark:hover:text-white transition-all transform hover:scale-125">
                <social.icon className="w-7 h-7" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;