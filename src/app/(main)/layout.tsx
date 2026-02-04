import Navbar from "@/components/ui/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 flex-1">
        {children}
      </main>
    </div>
  );
}
