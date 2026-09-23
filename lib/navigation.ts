/**
 * Homepage section anchors shown to logged-out visitors. Lives outside
 * Navbar.tsx because that is a client module: a server component (Footer)
 * importing a plain value from a "use client" file gets a client reference,
 * not the array.
 */
export const MARKETING_LINKS = [
  { name: "Features", href: "/#features" },
  { name: "Company research", href: "/#research" },
  { name: "How it works", href: "/#get-started" },
];

export const APP_LINKS = [
  { name: "Find Jobs", href: "/find-jobs" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Profile", href: "/profile" },
];
