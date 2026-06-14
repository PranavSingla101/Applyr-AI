import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/homepage/Hero";
import { Features } from "@/components/homepage/Features";
import { Testimonial } from "@/components/homepage/Testimonial";
import { BottomCTA } from "@/components/homepage/BottomCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonial />
        <BottomCTA />
      </main>
      <Footer />
    </>
  );
}
