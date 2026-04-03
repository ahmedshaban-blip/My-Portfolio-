import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { Magnetic } from "@/components/animations/Magnetic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    const subject = encodeURIComponent(`Portfolio Contact - ${data.name}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}\n`
    );

    // FIX #5: Use anchor element instead of window.location.href
    const mailtoLink = document.createElement("a");
    mailtoLink.href = `mailto:ahmed.shabaan.dev@gmail.com?subject=${subject}&body=${body}`;
    mailtoLink.click();

    toast({
      title: "Opening email…",
      description: "Your email client should open with the message pre-filled.",
    });

    reset();
  };

  return (
    <section id="contact" className="section-padding relative">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          <RevealOnScroll>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase border border-accent/20">
                <Mail size={14} /> Get In Touch
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Let's Work <span className="text-gradient">Together</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Available for Flutter mobile apps, front-end web projects, and remote opportunities.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <RevealOnScroll delay={0.1}>
                <Card className="modern-card border-border/50 rounded-xl p-5 group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-1 text-foreground">Email</h3>
                      <a
                        href="mailto:ahmed.shabaan.dev@gmail.com"
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        ahmed.shabaan.dev@gmail.com
                      </a>
                    </div>
                  </div>
                </Card>
              </RevealOnScroll>

              <RevealOnScroll delay={0.2}>
                <Card className="modern-card border-border/50 rounded-xl p-5 group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform duration-300">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-1 text-foreground">Phone / WhatsApp</h3>
                      <a
                        href="tel:+201114975104"
                        className="text-muted-foreground hover:text-accent transition-colors text-sm"
                      >
                        (+20) 1114975104
                      </a>
                    </div>
                  </div>
                </Card>
              </RevealOnScroll>

              <RevealOnScroll delay={0.3}>
                <Card className="modern-card border-border/50 rounded-xl p-5 group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-success/10 text-success group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-1 text-foreground">Location</h3>
                      <p className="text-muted-foreground text-sm">Minya, Egypt</p>
                      <p className="text-xs text-muted-foreground mt-1">Available to relocate</p>
                    </div>
                  </div>
                </Card>
              </RevealOnScroll>
            </div>

            <RevealOnScroll delay={0.2}>
              <Card className="modern-card border-border/50 rounded-xl p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="name" className="text-sm font-medium mb-2 block text-foreground">
                      Name
                    </label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Your name"
                      className="border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium mb-2 block text-foreground">
                      Email
                    </label>
                    <Input
                      id="email"
                      {...register("email")}
                      type="email"
                      placeholder="your.email@example.com"
                      className="border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="message" className="text-sm font-medium mb-2 block text-foreground">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      placeholder="Tell me about your project..."
                      rows={5}
                      className="border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary transition-all resize-none"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Magnetic strength={0.15}>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </Magnetic>
                </form>
              </Card>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
