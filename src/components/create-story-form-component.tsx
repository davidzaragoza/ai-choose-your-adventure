"use client";
/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/Xs2RwI22ksb
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import { beginStory as createStory } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { LoadingComponent } from "./loading-component";
import { responseHaveError } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Props {
  dict: any;
  lang: string
}

export function CreateStoryFormComponent({ dict, lang }: Props) {
  const router = useRouter();

  const [authError, setAuthError] = useState(false);

  const [title, setTitle] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!fieldsSet()) return;
    setLoading(true);
    const storyId = await createStory(title, genre, lang);
    if (responseHaveError(storyId, setAuthError)) {
      setLoading(false);
      return;
    }
    router.push(`/${lang}/story/${storyId}`);
  }

  function fieldsSet() {
    return title.length > 0 && genre.length > 0;
  }
  if (loading) {
    return (
      <LoadingComponent
        title={dict["newStory.loading.title"]}
        message={dict["newStory.loading.message"]}
      />
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{dict["newStory.title"]}</CardTitle>
          <CardDescription>{dict["newStory.subtitle"]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                {dict["newStory.field.title.label"]}
              </Label>
              <Input
                id="title"
                placeholder={dict["newStory.field.title.placeholder"]}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="genre">
                {dict["newStory.field.genre.label"]}
              </Label>
              <Select onValueChange={(e) => setGenre(e)}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={dict["newStory.field.genre.placeholder"]}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="fiction">{dict["story.genre.fiction"]}</SelectItem>
                    <SelectItem value="non-fiction">{dict["story.genre.non-fiction"]}</SelectItem>
                    <SelectItem value="fantasy">{dict["story.genre.fantasy"]}</SelectItem>
                    <SelectItem value="mystery">{dict["story.genre.mystery"]}</SelectItem>
                    <SelectItem value="romance">{dict["story.genre.romance"]}</SelectItem>
                    <SelectItem value="sci-fi">{dict["story.genre.sci-fi"]}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              disabled={!fieldsSet() || loading}
              onClick={handleSubmit}
            >
              Crear Historia
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
