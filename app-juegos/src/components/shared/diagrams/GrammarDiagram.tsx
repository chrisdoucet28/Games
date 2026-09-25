import type { ComponentType } from "react";
import { PresentPerfectVsPastSimpleDiagram } from "./PresentPerfectVsPastSimpleDiagram";

export type DiagramProps = { variant: "screen" | "print"; accentColor?: string };

// One diagram component per topic id, added opt-in as each is built — most topics have none of
// these yet, which is fine; TopicDiagram below renders nothing when a topic id isn't in this map.
// Keyed by the same topic id used everywhere else (TOPIC_OPTIONS/LESSONS), so adding the next
// topic's diagram is a one-line addition here plus a new sibling component file — nothing else
// that renders TopicDiagram (LessonContent, LearnScreen's print, LessonPlanScreen's on-screen
// slideshow and print) needs to change.
const TOPIC_DIAGRAMS: Record<string, ComponentType<DiagramProps>> = {
  present_perfect_vs_past_simple: PresentPerfectVsPastSimpleDiagram,
};

export function TopicDiagram({ topicId, variant, accentColor }: { topicId: string; variant: "screen" | "print"; accentColor?: string }) {
  const Diagram = TOPIC_DIAGRAMS[topicId];
  if (!Diagram) return null;
  return <Diagram variant={variant} accentColor={accentColor} />;
}
