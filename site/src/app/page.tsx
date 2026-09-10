import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Axes from "@/components/Axes";
import Pipeline from "@/components/Pipeline";
import Compare from "@/components/Compare";
import Ladder from "@/components/Ladder";
import Terminal from "@/components/Terminal";
import Benchmarks from "@/components/Benchmarks";
import Community from "@/components/Community";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main>
      <Nav />
      <aside className="border-b border-line px-5 py-4 text-center text-sm">
        H-Mode derivative. All numerical benchmark results and comparison samples
        below are historical upstream evidence, not measurements of H-Mode.
      </aside>
      <Hero />
      <Stats />
      <Axes />
      <Pipeline />
      <Terminal />
      <Compare />
      <Ladder />
      <Benchmarks />
      <Community />
      <Faq />
      <Footer />
    </main>
  );
}
