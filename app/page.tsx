// Internal workspace sites can read the authenticated OpenAI user from the
// forwarded request headers:
//
// import { headers } from "next/headers";
//
// export default async function Home() {
//   const requestHeaders = await headers();
//   const email = requestHeaders.get("oai-authenticated-user-email");
//   const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
//   const fullName =
//     encodedFullName &&
//     requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
//       "percent-encoded-utf-8"
//       ? decodeURIComponent(encodedFullName)
//       : null;
//   const displayName = fullName ?? email;
//   // ...
// }

"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.replace(`/app.html${window.location.search}${window.location.hash}`);
  }, []);
  return <main className="grid min-h-screen place-items-center bg-[#f4efe4] font-sans text-[#30332f]">正在開啟社交動物檔案…</main>;
}
