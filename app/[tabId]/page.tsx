import { Main } from "../../components/main";
import { notFound } from "next/navigation";

const VALID_TABS = ["create", "view", "regular", "add"] as const;

export default async function Tabs({
  params,
}: {
  params: Promise<{ tabId: string }>;
}) {
  const { tabId } = await params;

  if (!VALID_TABS.includes(tabId as (typeof VALID_TABS)[number])) {
    notFound();
  }

  return <Main />;
}
