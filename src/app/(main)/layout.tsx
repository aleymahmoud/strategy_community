import Navbar from "@/components/ui/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  );
}
