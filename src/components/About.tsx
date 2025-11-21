import { GraduationCap, Code, Award, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";

const About = () => {
  const highlights = [
    {
      icon: GraduationCap,
      title: "Fresh Graduate",
      description: "Computer Science, Minya University",
    },
    {
      icon: Briefcase,
      title: "ITI Internship",
      description: "Front-end & Cross-Platform Developer",
    },
    {
      icon: Code,
      title: "Production Experience",
      description: "Multiple Flutter & React projects",
    },
    {
      icon: Award,
      title: "Clean Architecture",
      description: "State management & API integration expert",
    },
  ];

  return (
    <section id="about" className="py-20 section-light">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              About <span className="gradient-text">Me</span>
            </h2>
            <div className="w-20 h-1 gradient-primary mx-auto rounded-full" />
          </div>

          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              I'm a passionate developer with a <strong>Bachelor's Degree in Computer Science</strong> from
              the Faculty of Computer and Information, Minya University, where I graduated with an{" "}
              <strong>A+ in my final project</strong>. My academic journey gave me a solid foundation in
              software engineering, algorithms, and problem-solving.
            </p>

            <p>
              During my <strong>internship at the Information Technology Institute (ITI)</strong>, I worked
              as a Front-end and Cross-Platform Developer, gaining hands-on experience with{" "}
              <strong>Flutter, React, and cross-platform app development</strong>. This experience sharpened
              my skills in building production-ready applications with clean, maintainable code.
            </p>

            <p>
              I specialize in creating <strong>cross-platform mobile applications</strong> using Flutter with
              Clean Architecture, state management (Bloc, Cubit, GetX), and seamless API integrations. On
              the web side, I build <strong>responsive, modern web applications</strong> using React, Redux
              Toolkit, and Tailwind CSS, with experience in Firebase, Supabase, and payment gateway
              integrations like Stripe and PayPal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            {highlights.map((item, index) => (
              <Card
                key={index}
                className="p-6 hover-lift border-border/50 bg-card hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg gradient-primary">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
