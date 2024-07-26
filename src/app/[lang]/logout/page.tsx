"use client"

import { signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Logout() {
  const router = useRouter();
  const params = useParams<{ lang: string }>();

  useEffect(() => {
      signOut({ redirect: false });
      router.push(`/${params.lang}/login`);
  }, [router]);

  return <div></div>;
}