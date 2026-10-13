import { useEffect, useRef, useState } from "react";
import { Check, Clock, Copy, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { Magnetic } from "@/components/animations/Magnetic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const CONTACT_EMAIL = "ahmed.shabaan.dev@gmail.com";
const NAME_MAX = 100;
const EMAIL_MAX = 254;
const MESSAGE_MAX = 2000;
// Conservative mailto URL budget: long URLs are truncated by some mail clients.
const MAILTO_MAX_LENGTH = 1800;

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(NAME_MAX, `Name must be at most ${NAME_MAX} characters`),
  email: z
    .string()
    .email("Invalid email address")
    .max(EMAIL_MAX, `Email must be at most ${EMAIL_MAX} characters`),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(MESSAGE_MAX, `Message must be at most ${MESSAGE_MAX} characters`),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const [mailtoBlocked, setMailtoBlocked] = useState(false);
  const copyTimer = useRef<number | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const messageValue = watch("message") ?? "";

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) {
        window.clearTimeout(copyTimer.current);
      }
    };
  }, []);

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
      } else {
        const fallback = document.createElement("textarea");
        fallback.value = CONTACT_EMAIL;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.opacity = "0";
        document.body.appendChild(fallback);
        fallback.select();
        document.execCommand("copy");
        fallback.remove();
      }
      setCopied(true);
      toast.success("Email address copied.", { description: CONTACT_EMAIL });
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed.", {
        description: `Please copy it manually: ${CONTACT_EMAIL}`,
      });
    }
  };

  // No backend send endpoint exists in this repo (no EmailJS/Formspree/contact
  // API route), so the honest handoff is the visitor's own email app via
  // mailto, with a copy-email fallback when mailto is unavailable or too long.
  const onSubmit = async (data: ContactForm) => {
    const subject = encodeURIComponent(`Portfolio Contact - ${data.name}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}\n`
    );
    const href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    if (href.length > MAILTO_MAX_LENGTH) {
      setMailtoBlocked(true);
      toast.error("Message is too long for an email link.", {
        description:
          "Shorten your message, or copy the email address below and send it from your email app instead.",
      });
      return;
    }

    try {
      const mailtoLink = document.createElement("a");
      mailtoLink.href = href;
      mailtoLink.rel = "noopener";
      document.body.appendChild(mailtoLink);
      mailtoLink.click();
      mailtoLink.remove();

      toast.success("Opening your email app…", {
        description:
          "Your message is pre-filled there. Nothing is sent until you press Send.",
      });
      setMailtoBlocked(false);
      reset();
    } catch {
      setMailtoBlocked(true);
      toast.error("Could not open your email app.", {
        description:
          "Copy the email address below and send your message manually — your text is preserved.",
      });
    }
  };

  return (
    <section id="contact" className="section-padding relative">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          <RevealOnScroll>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-accent">
                <Mail size={14} aria-hidden="true" />
                <span>05 · Get in touch</span>
                <span className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" aria-hidden="true" />
                <span className="tabular-nums tracking-normal text-muted-foreground">
                  replies within 24h
                </span>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                  Have a mobile or web role? Let&apos;s talk.
                </h2>
                <p className="max-w-md text-muted-foreground text-base md:text-right md:text-lg leading-relaxed">
                  Available for Flutter mobile apps, front-end web projects, and remote opportunities.
                </p>
              </div>
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} className="text-success" aria-hidden="true" />
                Usually replies within 24 hours · Cairo, Egypt (GMT+2)
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
                      maxLength={NAME_MAX}
                      dir="auto"
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
                      maxLength={EMAIL_MAX}
                      dir="ltr"
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
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="message" className="text-sm font-medium block text-foreground">
                        Message
                      </label>
                      <span
                        className="text-xs text-muted-foreground tabular-nums"
                        aria-live="polite"
                      >
                        {messageValue.length}/{MESSAGE_MAX}
                      </span>
                    </div>
                    <Textarea
                      id="message"
                      {...register("message")}
                      placeholder="Tell me about your project..."
                      rows={5}
                      maxLength={MESSAGE_MAX}
                      dir="auto"
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

                  <p className="text-xs text-muted-foreground">
                    Recommended: open your email app with the message pre-filled — nothing
                    is sent until you press Send there. No email app? Use Copy address below.
                  </p>

                  {mailtoBlocked && (
                    <div
                      role="alert"
                      className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
                    >
                      <p className="font-medium text-foreground">
                        Your email app could not be opened automatically.
                      </p>
                      <p className="mt-1 text-muted-foreground break-words">
                        Copy {CONTACT_EMAIL} and paste your message into a new email —
                        your text above is preserved.
                      </p>
                    </div>
                  )}

                  <Magnetic strength={0.15}>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Opening…
                        </span>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Open Email App
                        </>
                      )}
                    </Button>
                  </Magnetic>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyEmail}
                    className="w-full border-border/50"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy email address
                      </>
                    )}
                  </Button>
                  <p className="pt-1 text-center text-xs text-muted-foreground">
                    Currently full-time at Truck World · Open to remote Flutter / React roles — 2 apps live on Google Play.
                  </p>
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
