import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import PageBackdrop from "@/components/fx/PageBackdrop";
import SourcesContent from "@/components/SourcesContent";

export const metadata: Metadata = {
  title: "Sources & Citations",
  description: "The research, data sources and technology credits behind CLT CommunityHub.",
};

export default function SourcesPage() {
  return (
    <div className="bg-site relative min-h-screen overflow-hidden">
      <PageBackdrop />
      <Navbar />
      <main id="main" tabIndex={-1} className="relative z-10 px-4 pb-24 pt-36 outline-none md:px-12">
        <SourcesContent />
      </main>
      <SiteFooter />
    </div>
  );
}
