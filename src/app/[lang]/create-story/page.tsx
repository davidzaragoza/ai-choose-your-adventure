import { getDictionary } from "@/app/dictionaries/dictionaries";
import { CreateStoryFormComponent } from "@/components/create-story-form-component";

type Props = {
  params: { [lang: string]: string };
};

export default async function CreateStory({ params: { lang } }: Props) {
  const dict = await getDictionary(lang);

  return (
    <CreateStoryFormComponent dict={dict} lang={lang}/>
  )
}
