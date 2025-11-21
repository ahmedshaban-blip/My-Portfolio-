import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    "Firebase Console",
    "Flutter Animations",
    "Responsive UI",
    "Stripe Integration",
    "PayPal Integration",
    "Flutter Test",
    "Git & GitHub",
    "Android Studio",
    "VS Code",
    "UI/UX Implementation",
  ];

  const frontendSkills = [
    "HTML5",
    "CSS3",
    "JavaScript (ES6+)",
    "React 18",
    "Redux Toolkit",
    "Tailwind CSS",
    "Vite",
    "Firebase Auth",
    "Firestore",
    "Supabase Storage",
    "PayPal SDK",
    "RESTful APIs",
    "React Router v6",
    "i18next",
    "Formik",
    "Local Storage",
    "Responsive Design",
    "Accessible UI",
    "SPA Architecture",
    "Git & GitHub",
    "Vercel",
    "Modern Build Tools",
  ];

  return (
    <section id="skills" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Technical <span className="gradient-text">Skills</span>
            </h2>
            <div className="w-20 h-1 gradient-primary mx-auto rounded-full" />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Expertise across mobile and web development with modern frameworks and tools
            </p>
          </div>

          <Tabs defaultValue="flutter" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="flutter" className="text-base">
                Flutter Skills
              </TabsTrigger>
              <TabsTrigger value="frontend" className="text-base">
                Front-end Skills
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flutter" className="space-y-6">
              <Card className="p-8 border-border/50">
                <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                  <span className="text-3xl">📱</span>
                  Flutter & Mobile Development
                </h3>
                <div className="flex flex-wrap gap-3">
                  {flutterSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-4 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="frontend" className="space-y-6">
              <Card className="p-8 border-border/50">
                <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                  <span className="text-3xl">💻</span>
                  Front-end Web Development
                </h3>
                <div className="flex flex-wrap gap-3">
                  {frontendSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-4 py-2 text-sm font-medium hover:bg-secondary hover:text-secondary-foreground transition-colors cursor-default"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default Skills;
