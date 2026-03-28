"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export function AppBreadcrumb() {
  const pathname = usePathname();
  
  // Skip rendering on the root path if desired, or just show Dashboard
  if (!pathname || pathname === "/") return null;

  // Split pathname and remove empty strings
  const paths = pathname.split("/").filter((path) => path);

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {paths.length > 0 && paths[0] !== "dashboard" && (
           <Fragment>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${paths[0]}`}>{paths[0].charAt(0).toUpperCase() + paths[0].slice(1)}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
           </Fragment>
        )}

        {paths.length > 1 && paths.map((path, index) => {
          // Skip the first element if it's dashboard, we already hardcoded it
          if (index === 0 && path === "dashboard") return null;

          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

          return (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{formattedPath}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{formattedPath}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
