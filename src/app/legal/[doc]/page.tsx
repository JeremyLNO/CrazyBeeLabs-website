import { notFound } from "next/navigation";
import { LEGAL_DOCS, type LegalSlug } from "@/lib/content";
import { LegalView } from "@/components/legal/LegalView";

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ doc }));
}

const TITLES: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  refund: "Refund Policy",
  notice: "Legal Notice",
  apps: "Privacy Policy & Terms — Apps",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  return { title: TITLES[doc] ?? "Legal" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  if (!(LEGAL_DOCS as readonly string[]).includes(doc)) notFound();
  return <LegalView doc={doc as LegalSlug} />;
}
