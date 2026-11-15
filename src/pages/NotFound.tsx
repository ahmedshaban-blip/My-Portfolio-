import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="space-y-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">404</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          This page doesn't exist.
        </h1>
        <p className="text-muted-foreground">
          The link may be outdated, or the address was mistyped.
        </p>
        <Button asChild className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to portfolio
          </Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;
