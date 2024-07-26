"use client";
/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/hpadcfPbkUj
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
import { deleteStory, getStories } from "@/app/actions";
import { StoryDescription } from "@/app/models/models";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { responseHaveError } from "@/lib/utils";
import { Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingComponent } from "./loading-component";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
const isoCountriesLanguages = require("iso-countries-languages");

interface Props {
  dict: any;
  lang: string;
}

export function HomeComponent({ dict, lang }: Props) {
  const router = useRouter();

  const [authError, setAuthError] = useState(false);
  const [stories, setStories] = useState<StoryDescription[]>();

  const currentLanguage = isoCountriesLanguages.getLanguage(lang, lang);
  const allLanguages = isoCountriesLanguages.getSupportedLangs() as string[];

  async function init() {
    const stories = await getStories();
    if (responseHaveError(stories, setAuthError)) {
      return;
    }
    setStories(stories as StoryDescription[]);
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (authError) {
      router.replace("/login");
    }
  }, [authError, router]);

  async function removeStory(id: string) {
    const newStories = stories!.filter((story) => story.id !== id);
    setStories(newStories);
    await deleteStory(id);
  }

  if (!stories) {
    return (
      <LoadingComponent
        title={dict["home.loading.title"]}
        message={dict["home.loading.message"]}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{dict["home.stories"]}</h1>
        <div className="flex items-center gap-4">
          <Select onValueChange={(e) => router.replace(`/${e}`)}>
            <SelectTrigger>
              <SelectValue placeholder={currentLanguage} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {allLanguages.map((l) => (
                  <SelectItem value={l} key={l}>
                    <div className="flex items-center">
                      <PlusIcon className="w-5 h-5" />
                      <span className="ml-2">
                        {isoCountriesLanguages.getLanguage(lang, l)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => router.replace(`${lang}/logout`)}
          >
            <span>{dict["home.button.logout"]}</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex justify-end">
          <Button
            variant="outline"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => router.push(`${lang}/create-story`)}
          >
            <PlusIcon className="w-5 h-5" />
            <span>{dict["home.button.newStory"]}</span>
          </Button>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{dict["home.stories"]}</h2>
          {stories.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">
                  {dict["home.noStories.header"]}
                </h2>
                <p className="text-muted-foreground">
                  {dict["home.noStories.desc"]}
                </p>
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => router.push(`${lang}/create-story`)}
                  >
                  <PlusIcon className="w-5 h-5" />
                  <span>{dict["home.button.newStory"]}</span>
                </Button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <Link key={story.id} href={`${lang}/story/${story.id}`}>
                <Card key={story.id} className="bg-card text-card-foreground">
                  <CardHeader>
                    <CardTitle>{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {dict[`story.genre`]}:{" "}
                      {dict[`story.genre.${story.genre}`]}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {dict["home.card.updated"]}:{" "}
                      {story.lastUpdated.toUTCString()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        removeStory(story.id);
                      }}
                    >
                      <Trash2Icon className="w-5 h-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
