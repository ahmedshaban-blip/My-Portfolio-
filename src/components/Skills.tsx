import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";

const Skills = () => {
  const flutterSkills = [
    "Flutter & Dart",
    "Clean Architecture (MVVM)",
    "Bloc",
    "Cubit",
    "GetX",
    "Provider",
    "REST APIs",
    "JSON Parsing",
    "Firebase Authentication",
    "Firestore",
    "Firebase Storage",
    "Push Notifications",
    "Flutter Animations",
    "Responsive UI",
    "Stripe Integration",
    "PayPal Integration",
    "Git & GitHub",
  ];

  const frontendSkills = [
    "HTML5",
    "CSS3",
    "JavaScript (ES6+)",
    "React 18",
    "Redux Toolkit",
    "Tailwind CSS",
    "Vite",
    "React Router v6",
    "RESTful APIs",
    "Firebase Auth",
    "Firestore",
    "Supabase Storage",
    "i18next",
    "Accessible UI",
    "SPA Architecture",
    "Vercel",
    "Git & GitHub",
  ];

  const chip =
    "px-4 py-2 text-sm font-medium rounded-full border border-border/60 bg-background/50 hover:bg-accent transition-colors cursor-default";

  return (
    <section id="skills" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <RevealOnScroll>
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Technical <span className="gradient-text">Skills</span>
              </h2>
              <div className="w-20 h-1 gradient-primary mx-auto rounded-full" />
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Focused stack for building production-ready mobile and web apps.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <Tabs defaultValue="flutter" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                <TabsTrigger value="flutter" className="text-base">Flutter</TabsTrigger>
                <TabsTrigger value="frontend" className="text-base">Front-end</TabsTrigger>
              </TabsList>

              <TabsContent value="flutter">
                <Card className="glass p-8 border-border/60 rounded-3xl">
                  <h3 className="text-2xl font-semibold mb-6">Flutter & Mobile</h3>
                  <div className="flex flex-wrap gap-3">
                    {flutterSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className={chip}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="frontend">
                <Card className="glass p-8 border-border/60 rounded-3xl">
                  <h3 className="text-2xl font-semibold mb-6">Front-end Web</h3>
                  <div className="flex flex-wrap gap-3">
                    {frontendSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className={chip}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

export default Skills;
