import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadCV(type: "flutter" | "frontend") {
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
}
