import { Briefcase, GraduationCap, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Experience = () => {
  const courses = [
    "Deep Dive into Clean Architecture in Flutter",
    "Flutter Advanced – Clean Architecture & MVVM",
    "Flutter – Animations from Zero to Hero",
    "Mastering Flutter: Responsive & Adaptive UI Design",
    "Complete Flutter & Dart Development Course",
    "HTML, CSS, and JavaScript (ITI)",
    "React Native Web Application (ITI)",
    "Payment Integration: Stripe, PayPal & More (ITI)",
  ];

  return (
    <section id="experience" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Experience & <span className="gradient-text">Education</span>
            </h2>
            <div className="w-20 h-1 gradient-primary mx-auto rounded-full" />
          </div>

          <div className="space-y-8">
            {/* Experience */}
            <Card className="p-8 border-border/50 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Front-end and Cross-Platform Developer (Internship)
                    </h3>
                    <p className="text-lg text-primary font-semibold">
                      Information Technology Institute (ITI)
                    </p>
                    <p className="text-muted-foreground">July 2025 – Present</p>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>
                        Developed production-ready mobile screens using Flutter and Dart with clean UI/UX
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>
                        Implemented state management (Bloc, Cubit, GetX) in multiple mini-projects
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>
                        Integrated REST APIs, handled JSON parsing, error states, and loading
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>
                        Developed features with Firebase Authentication, Firestore, Storage, and
                        notifications
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>
                        Built engaging web UIs using React, Redux Toolkit, and Tailwind CSS
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>Worked with payment integrations (Stripe, PayPal)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>
                        Collaborated via Git & GitHub (branches, PRs, code reviews)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>
                        Followed Clean Architecture and participated in debugging and code review sessions
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Education */}
            <Card className="p-8 border-border/50 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-secondary-foreground" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Bachelor's Degree in Computer Science</h3>
                    <p className="text-lg text-secondary font-semibold">
                      Faculty of Computer and Information, Minya University
                    </p>
                    <p className="text-muted-foreground">September 2020 – January 2025</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">
                      Graduation Project: <span className="text-primary">A+</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Courses & Certifications */}
            <Card className="p-8 border-border/50 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Award className="h-6 w-6 text-primary" />
                Selected Courses & Certifications
              </h3>
              <div className="flex flex-wrap gap-3">
                {courses.map((course, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="px-4 py-2 text-sm border-primary/30 hover:bg-accent transition-colors"
                  >
                    {course}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
