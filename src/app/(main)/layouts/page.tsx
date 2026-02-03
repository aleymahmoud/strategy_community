import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getLayouts() {
  return prisma.layout.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { sections: true, events: true },
      },
    },
  });
}

export default async function LayoutsPage() {
  const layouts = await getLayouts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[#d4a537] text-sm font-semibold tracking-wider uppercase mb-1">Venue Management</p>
          <h1 className="text-4xl font-bold text-[#2d3e50]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Layouts
          </h1>
        </div>
        <Link
          href="/layouts/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#2d3e50] text-white font-semibold rounded-xl hover:bg-[#3d5068] transition-all shadow-lg shadow-[#2d3e50]/20 hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Layout
        </Link>
      </div>

      {layouts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-24 h-24 rounded-full bg-[#2d3e50]/5 flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-[#2d3e50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#2d3e50] mb-2">No layouts yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create venue layouts to manage seating arrangements for your events
          </p>
          <Link
            href="/layouts/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2d3e50] text-white font-semibold rounded-xl hover:bg-[#3d5068] transition-colors"
          >
            Create your first layout
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout, index) => (
            <div
              key={layout.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[#2d3e50]/5 transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Preview Area */}
              <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Grid Pattern Preview */}
                  <div className="w-32 h-24 relative">
                    <div className="absolute inset-0 grid grid-cols-4 gap-1">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-[#2d3e50]/10 rounded-sm group-hover:bg-[#d4a537]/20 transition-colors"
                          style={{ transitionDelay: `${i * 20}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {layout.isTemplate && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1.5 bg-[#d4a537] text-white text-xs font-semibold rounded-full shadow-lg">
                      Template
                    </span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-white/80 backdrop-blur text-[#2d3e50] text-xs font-medium rounded-lg">
                      {layout.width} × {layout.height}px
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-lg font-bold text-[#2d3e50] mb-2 group-hover:text-[#d4a537] transition-colors">
                  {layout.name}
                </h2>
                {layout.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{layout.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                    </svg>
                    {layout._count.sections} sections
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {layout._count.events} events
                  </span>
                </div>

                <Link
                  href={`/layouts/${layout.id}/edit`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#2d3e50]/5 text-[#2d3e50] font-medium rounded-xl hover:bg-[#2d3e50] hover:text-white transition-all group"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Layout
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
