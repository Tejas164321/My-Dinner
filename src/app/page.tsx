'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChefHat, UserCog, User } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="glow-effect-1"></div>
      <div className="glow-effect-2"></div>
      <div className="z-10 flex flex-col items-center text-center animate-in fade-in-0 slide-in-from-top-12 duration-1000">
        <div className="mb-6 rounded-full border border-primary/20 bg-primary/10 p-4 shadow-lg">
          <ChefHat className="h-14 w-14 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-transparent md:text-7xl bg-clip-text bg-gradient-to-br from-white to-gray-400">
          Welcome to Messo
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          The seamless, modern, and smart way to manage your canteen and mess facility.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="text-lg px-8 py-6 transition-transform hover:scale-105">
              <Link href="/admin"><UserCog /> Admin Dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 transition-transform hover:scale-105">
              <Link href="/student"><User /> Student Dashboard</Link>
            </Button>
        </div>
      </div>
    </main>
  );
}
