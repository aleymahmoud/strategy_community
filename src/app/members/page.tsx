import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getMembers() {
  return prisma.member.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Members</h1>
        <Link
          href="/members/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add Member
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No members yet</p>
          <Link
            href="/members/new"
            className="text-blue-500 hover:underline"
          >
            Add your first member
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Phone
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Join Date
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.email || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/members/${member.id}`}
                      className="text-blue-500 hover:underline mr-4"
                    >
                      View
                    </Link>
                    <Link
                      href={`/members/${member.id}/edit`}
                      className="text-gray-500 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
