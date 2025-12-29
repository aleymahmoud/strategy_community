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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Venue Layouts</h1>
        <Link
          href="/layouts/new"
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          + Create Layout
        </Link>
      </div>

      {layouts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No layouts yet</p>
          <Link href="/layouts/new" className="text-purple-500 hover:underline">
            Create your first layout
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layouts.map((layout) => (
            <div key={layout.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {layout.name}
                </h2>
                {layout.isTemplate && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">
                    Template
                  </span>
                )}
              </div>
              {layout.description && (
                <p className="text-gray-600 text-sm mb-4">{layout.description}</p>
              )}
              <div className="text-sm text-gray-500 space-y-1">
                <p>{layout._count.sections} sections</p>
                <p>{layout._count.events} events using this layout</p>
                <p>
                  Size: {layout.width}x{layout.height}px
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex gap-4">
                <Link
                  href={`/layouts/${layout.id}/edit`}
                  className="text-purple-500 hover:underline"
                >
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
