import { HomeComponent } from "@/components/home-component";
import { getDictionary } from "@/app/dictionaries/dictionaries";

type Props = {
  params: { [lang: string]: string };
};

export default async function Home({ params: { lang } }: Props) {
  const dict = await getDictionary(lang);

  return (
    <>
      <HomeComponent dict={dict} />
    </>
  );
}
