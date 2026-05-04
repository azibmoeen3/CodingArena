"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Code, Trophy, Users, BarChart2, BookOpen, Menu, X, Settings2, UserCircle } from "lucide-react";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { name: "Problems", href: "/problems", icon: Code },
  { name: "Community", href: "/community", icon: Users },
  { name: "Profile", href: "/profile", icon: UserCircle },
  { name: "Admin", href: "/admin", icon: Settings2 },
];

export function Navbar() {
  const { userId } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.primaryEmailAddress?.emailAddress === "azibmaher771@gmail.com";
  const filteredNavItems = navItems.filter(item => {
    if (item.name === "Admin") return isAdmin;
    if (item.name === "Profile") return !!userId;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center rounded-lg bg-primary/10 w-9 h-9 group-hover:bg-primary/20 transition-all duration-300 overflow-hidden border border-primary/20">
            <Image 
              src="/logo.png" 
              alt="CodeArena Logo" 
              width={36} 
              height={36} 
              className="object-contain"
            />
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">
            Code<span className="text-primary">Arena</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >

                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {!userId ? (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
