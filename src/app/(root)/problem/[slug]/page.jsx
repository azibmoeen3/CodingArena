import { notFound } from "next/navigation";
import LeetCodeClone from "@/components/leetcode-clone";
import { getProblemByIdentifier } from "@/services/problemService";

export default async function ProblemPage({ params }) {
  const { slug } = await params;
  const problem = await getProblemByIdentifier(slug);

  if (!problem) {
    return notFound();
  }

  return <LeetCodeClone problem={problem} />;
}
