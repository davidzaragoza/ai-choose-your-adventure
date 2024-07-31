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
  lang: string;
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

  const [isSpeaking, setIsSpeaking] = useState(false);

  async function fetchStory() {
    let response = await getStory(id);
    if (responseHaveError(response, setAuthError)) {
      return;
    }
    response = response as Story;
    setTitle(response.title);
    setStory(response.story);
    setChoices(response.choices);
    if (response.status === "FINISHED") {
      setCurrentPage(0);
    } else {
      setCurrentPage(response.story.length - 1);
    }
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

  const synth = window.speechSynthesis;
  function stopSpeak() {
    synth.cancel();
    setIsSpeaking(false);
  }

  function speak() {
    if (synth.speaking) {
      synth.cancel();
    }
    const utterThis = new SpeechSynthesisUtterance(story[currentPage]);
    utterThis.lang = lang;
    synth.speak(utterThis);
    setIsSpeaking(true);
  }

  useEffect(() => {
    if (isSpeaking) {
      speak();
    }
  }, [currentPage]);

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
                {isSpeaking ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      stopSpeak();
                    }}
                  >
                    <SpeakerOffIcon className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      speak();
                    }}
                  >
                    <SpeakerIcon className="w-5 h-5" />
                  </Button>
                )}
              </DropdownMenuTrigger>
            </DropdownMenu>
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
              <DropdownMenuTrigger
                asChild
                onClick={(e) => router.push(`/${lang}`)}
              >
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
        <footer className="bg-background border-t px-4 py-3 flex justify-center"></footer>
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

function SpeakerIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.46968 1.05085C7.64122 1.13475 7.75 1.30904 7.75 1.5V13.5C7.75 13.691 7.64122 13.8653 7.46968 13.9492C7.29813 14.0331 7.09377 14.0119 6.94303 13.8947L3.2213 11H1.5C0.671571 11 0 10.3284 0 9.5V5.5C0 4.67158 0.671573 4 1.5 4H3.2213L6.94303 1.10533C7.09377 0.988085 7.29813 0.966945 7.46968 1.05085ZM6.75 2.52232L3.69983 4.89468C3.61206 4.96294 3.50405 5 3.39286 5H1.5C1.22386 5 1 5.22386 1 5.5V9.5C1 9.77615 1.22386 10 1.5 10H3.39286C3.50405 10 3.61206 10.0371 3.69983 10.1053L6.75 12.4777V2.52232ZM10.2784 3.84804C10.4623 3.72567 10.7106 3.77557 10.833 3.95949C12.2558 6.09798 12.2558 8.90199 10.833 11.0405C10.7106 11.2244 10.4623 11.2743 10.2784 11.1519C10.0944 11.0296 10.0445 10.7813 10.1669 10.5973C11.4111 8.72728 11.4111 6.27269 10.1669 4.40264C10.0445 4.21871 10.0944 3.97041 10.2784 3.84804ZM12.6785 1.43044C12.5356 1.2619 12.2832 1.24104 12.1147 1.38386C11.9462 1.52667 11.9253 1.77908 12.0681 1.94762C14.7773 5.14488 14.7773 9.85513 12.0681 13.0524C11.9253 13.2209 11.9462 13.4733 12.1147 13.6161C12.2832 13.759 12.5356 13.7381 12.6785 13.5696C15.6406 10.0739 15.6406 4.92612 12.6785 1.43044Z"></path>
    </svg>
  );
}

function SpeakerOffIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.72361 1.05279C7.893 1.13749 8 1.31062 8 1.5V13.5C8 13.6894 7.893 13.8625 7.72361 13.9472C7.55421 14.0319 7.35151 14.0136 7.2 13.9L3.33333 11H1.5C0.671573 11 0 10.3284 0 9.5V5.5C0 4.67158 0.671573 4 1.5 4H3.33333L7.2 1.1C7.35151 0.986371 7.55421 0.968093 7.72361 1.05279ZM7 2.5L3.8 4.9C3.71345 4.96491 3.60819 5 3.5 5H1.5C1.22386 5 1 5.22386 1 5.5V9.5C1 9.77614 1.22386 10 1.5 10H3.5C3.60819 10 3.71345 10.0351 3.8 10.1L7 12.5V2.5ZM14.8536 5.14645C15.0488 5.34171 15.0488 5.65829 14.8536 5.85355L13.2071 7.5L14.8536 9.14645C15.0488 9.34171 15.0488 9.65829 14.8536 9.85355C14.6583 10.0488 14.3417 10.0488 14.1464 9.85355L12.5 8.20711L10.8536 9.85355C10.6583 10.0488 10.3417 10.0488 10.1464 9.85355C9.95118 9.65829 9.95118 9.34171 10.1464 9.14645L11.7929 7.5L10.1464 5.85355C9.95118 5.65829 9.95118 5.34171 10.1464 5.14645C10.3417 4.95118 10.6583 4.95118 10.8536 5.14645L12.5 6.79289L14.1464 5.14645C14.3417 4.95118 14.6583 4.95118 14.8536 5.14645Z"></path>
    </svg>
  );
}
