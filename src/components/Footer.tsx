import { Github, Linkedin, Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { contact, identity, social, whatsappUrl } from "@/data/profile";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About me", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socials = [
    { icon: Github, href: social.github, label: "GitHub" },
    { icon: Linkedin, href: social.linkedin, label: "LinkedIn" },
    { icon: WhatsAppIcon, href: whatsappUrl, label: "WhatsApp" },
    { icon: Mail, href: `mailto:${contact.email}`, label: "Email" },
  ];

  return (
    <footer className="relative border-t border-border/60 bg-background py-16">
      <div className="container mx-auto px-4">
        <RevealOnScroll>
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            {/* The closing beat: the quietest arrival on the page, one arrival for
                the whole footer — nothing here is a list. */}
            <p className="font-display text-lg font-bold tracking-tight text-foreground">
              {identity.name.display}
            </p>

            <nav aria-label="Footer" className="mt-6">
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-accent-strong"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 flex items-center gap-6">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground transition-interaction duration-200 hover:scale-110 hover:text-accent-strong"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            <div className="mt-8 space-y-1.5">
              <p className="text-xs text-muted-foreground">
                © {currentYear} {identity.name.display}. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Built with React, Vite, and Tailwind CSS.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </footer>
  );
};

export default Footer;
