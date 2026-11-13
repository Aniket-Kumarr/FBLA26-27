import type { Metadata } from "next";
import DashboardNavbar from "@/components/DashboardNavbar";
import SourcesContent from "@/components/SourcesContent";

export const metadata: Metadata = {
  title: "Sources & Citations",
};

export default function DashboardSourcesPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <DashboardNavbar />
      <main id="main" tabIndex={-1} className="relative z-10 px-4 pb-32 pt-36 outline-none md:px-12">
        <SourcesContent />
      </main>
    </div>
  );
}
