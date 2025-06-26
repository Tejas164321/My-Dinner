import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="glow-effect"></div>
      <div className="z-10 flex flex-col items-center text-center">
        <div className="mb-4 rounded-full border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
          <UtensilsCrossed className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-transparent md:text-7xl bg-clip-text bg-gradient-to-br from-white to-gray-400">
          MessoMate
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A smart, modern, and progressive mess management system for colleges and hostels.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link href="/student">Student Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
