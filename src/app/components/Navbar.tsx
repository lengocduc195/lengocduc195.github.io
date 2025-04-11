"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Publications", path: "/publications" },
  { name: "Blogs", path: "/blogs" },
  { name: "Skills", path: "/skills" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex gap-6">
      {links.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={`text-lg font-medium ${
            pathname === link.path
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-700 hover:text-blue-500"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
