import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Portfolio Contact - ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}\n`
    );

    window.location.href = `mailto:ahmed.shabaan.dev@gmail.com?subject=${subject}&body=${body}`;

    toast({
      title: "Opening email…",
      description: "Your email client should open with the message pre-filled.",
    });

    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-24 section-light">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Get In <span className="gradient-text">Touch</span>
            </h2>
            <div className="w-20 h-1 gradient-primary mx-auto rounded-full" />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Available for Flutter mobile apps, front-end web projects, and remote opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="glass p-6 hover-lift border-border/60 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl gradient-primary">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                    <a
                      href="mailto:ahmed.shabaan.dev@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      ahmed.shabaan.dev@gmail.com
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="glass p-6 hover-lift border-border/60 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-secondary">
                    <Phone className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Phone / WhatsApp</h3>
                    <a
                      href="tel:+201114975104"
                      className="text-muted-foreground hover:text-secondary transition-colors"
                    >
                      (+20) 1114975104
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="glass p-6 hover-lift border-border/60 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent">
                    <MapPin className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Location</h3>
                    <p className="text-muted-foreground">Minya, Egypt</p>
                    <p className="text-sm text-muted-foreground mt-1">Available to relocate</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="glass p-6 border-border/60 rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-2 block">Name</label>
                  <Input id="name" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">Email</label>
                  <Input id="email" name="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea id="message" name="message" placeholder="Tell me about your project..." rows={5} value={formData.message} onChange={handleChange} required />
                </div>

                <Button type="submit" className="w-full gradient-primary text-white">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
