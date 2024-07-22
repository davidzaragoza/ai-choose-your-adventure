"use client"

import { useParams } from "next/navigation";

export default function Story() {
  const params = useParams<{ id: string }>();
  console.log(params);

  return <>Story {params.id}</>;
}
