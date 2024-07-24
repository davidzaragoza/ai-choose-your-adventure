"use client";
import { HomeComponent } from "@/components/home-component";
import { useParams } from "next/navigation";

export default function Home() {
  const params = useParams<{ lang: string }>();
  return (
    <>
      <h1>Welcome</h1>
      <HomeComponent />
    </>
  )
}