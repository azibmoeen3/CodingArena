import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Trophy, Code2, Users, Target, CheckCircle, Zap, ArrowRight,
  BarChart2, BookOpen, Star, Terminal
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden animated-gradient">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container relative px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Zap className="h-3.5 w-3.5" />
                25+ Problems Available Now
              </div>

              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Master Coding{" "}
                  <span className="gradient-text">Interviews</span>
                </h1>
                <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl">
                  Practice real interview questions, sharpen your problem-solving
                  skills, and land your dream job at top tech companies.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-xl text-base">
                    Start Coding Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/problems">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border/50 hover:bg-secondary text-foreground px-8 rounded-xl text-base"
                  >
                    Browse Problems
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 border-b border-border/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "25+", label: "Coding Problems", icon: Terminal },
                { value: "4", label: "Languages", icon: Code2 },
                { value: "100+", label: "Test Cases", icon: CheckCircle },
                { value: "24/7", label: "Code Execution", icon: Zap },
              ].map((stat, i) => (
                <div key={i} className="text-center space-y-2">
                  <stat.icon className="h-5 w-5 text-primary mx-auto" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Everything You Need to <span className="gradient-text">Excel</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A comprehensive platform designed to help you crack any technical interview.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: "Curated Problems",
                  desc: "Hand-picked problems across arrays, strings, trees, DP and more — organized by difficulty.",
                },
                {
                  icon: Terminal,
                  title: "In-Browser IDE",
                  desc: "Write, run, and test code in JavaScript, Python, C++, and Java with Monaco Editor.",
                },
                {
                  icon: CheckCircle,
                  title: "Instant Judging",
                  desc: "Submit your solution and get real-time verdicts with runtime and memory stats.",
                },
                {
                  icon: Trophy,
                  title: "Weekly Contests",
                  desc: "Compete with developers worldwide. Solve problems under time pressure.",
                },
                {
                  icon: BarChart2,
                  title: "Progress Tracking",
                  desc: "Track solved problems, submission history, and performance analytics.",
                },
                {
                  icon: Users,
                  title: "Community",
                  desc: "Discuss approaches, share solutions, and learn from other developers.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-28 border-t border-border/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="glass-card rounded-2xl p-10 md:p-16 text-center glow-green">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Ready to Level Up?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Join CodeArena today and start solving real coding challenges.
              </p>
              <Link href="/problems">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 rounded-xl text-base">
                  Start Solving
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              © 2024 CodeArena. All rights reserved.
            </span>
          </div>
          <nav className="flex gap-6">
            <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="#">
              Terms
            </Link>
            <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
