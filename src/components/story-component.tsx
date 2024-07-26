"use client";
/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/KhhfkUl08Ae
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
import { getNextStoryPart, getStory } from "@/app/actions";
import { NextStoryPart, Story } from "@/app/models/models";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { responseHaveError } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingComponent } from "./loading-component";

interface Props {
  id: string;
  dict: any;
  lang: string
}

export function StoryComponent({ id, dict, lang }: Props) {
  const router = useRouter();

  const [authError, setAuthError] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState<string[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [theme, setTheme] = useState("light");
  const [textSize, setTextSize] = useState("text-base");

  const [loading, setLoading] = useState(true);

  async function fetchStory() {
    let response = await getStory(id);
    if (responseHaveError(response, setAuthError)) {
      return;
    }
    response = response as Story;
    setTitle(response.title);
    setStory(response.story);
    setChoices(response.choices);
    setCurrentPage(response.story.length - 1);
    setLoading(false);
  }

  useEffect(() => {
    fetchStory();
  }, []);

  useEffect(() => {
    if (authError) {
      router.replace("/login");
    }
  }, [authError, router]);

  function changeTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  async function handleChoice(choice: string) {
    setChoices([]);
    setLoading(true);
    let response = await getNextStoryPart(id, choice, lang);
    if (responseHaveError(response, setAuthError)) {
      return;
    }
    response = response as NextStoryPart;
    setStory((prev) => [...prev, response.story]);
    setCurrentPage(currentPage + 1);
    setChoices(response.choices);
    setLoading(false);
  }

  if (loading) {
    return (
      <LoadingComponent
        title={dict["storyView.loading.title"]}
        message={dict["storyView.loading.message"]}
      />
    );
  }

  const baseClassName = theme + " " + textSize;

  return (
    <div className={baseClassName}>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="#" className="text-xl font-bold" prefetch={false}>
              {title}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <TextIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {dict["storyView.menu.fontSize"]}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button
                    variant="ghost"
                    onClick={(e) => setTextSize("text-base")}
                  >
                    {dict["storyView.menu.fontSize.small"]}
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button
                    variant="ghost"
                    onClick={(e) => setTextSize("text-lg")}
                  >
                    {dict["storyView.menu.fontSize.medium"]}
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button
                    variant="ghost"
                    onClick={(e) => setTextSize("text-xl")}
                  >
                    {dict["storyView.menu.fontSize.big"]}
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => changeTheme()}>
                <Button variant="ghost" size="icon">
                  <MoonIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => router.push(`/${lang}`)}>
                <Button variant="ghost" size="icon">
                  <CloseIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg prose-neutral text-justify">
              {story[currentPage]}
            </div>
            <div className="w-auto grid grid-cols-1 gap-4 mt-4">
              {currentPage === story.length - 1 &&
                choices.map((choice, index) => (
                  <Button
                    key={index}
                    size="lg"
                    onClick={(e) => handleChoice(choice)}
                    style={{ whiteSpace: "normal", overflow: "visible" }}
                  >
                    {choice}
                  </Button>
                ))}
            </div>
          </div>
        </main>
        <div className="flex justify-between px-4 md:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage <= 0}
            onClick={(e) => setCurrentPage(currentPage - 1)}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="sr-only">{dict["storyView.page.previous"]}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === story.length - 1}
            onClick={(e) => setCurrentPage(currentPage + 1)}
          >
            <ArrowRightIcon className="w-5 h-5" />
            <span className="sr-only">{dict["storyView.page.next"]}</span>
          </Button>
        </div>
        <footer className="bg-background border-t px-4 py-3 flex justify-center">
        </footer>
      </div>
    </div>
  );
}

function CloseIcon(props: any) {
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
      <path d="M19 5L4.99998 19M5.00001 5L19 19" />
    </svg>
  );
}

function MoonIcon(props: any) {
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
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function TextIcon(props: any) {
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
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    </svg>
  );
}

function ArrowLeftIcon(props: any) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon(props: any) {
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
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
