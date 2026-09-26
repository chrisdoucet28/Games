import type { ComponentType } from "react";
import { PresentPerfectVsPastSimpleDiagram } from "./PresentPerfectVsPastSimpleDiagram";
import { PrepositionsOfPlaceDiagram } from "./PrepositionsOfPlaceDiagram";
import { BasicWordOrderDiagram } from "./BasicWordOrderDiagram";
import { WhatTimeIsItDiagram } from "./WhatTimeIsItDiagram";
import { PresentSimpleDiagram } from "./PresentSimpleDiagram";
import { DaysDatesPrepositionsTimeDiagram } from "./DaysDatesPrepositionsTimeDiagram";
import { PossessiveAdjectivesPronounsDiagram } from "./PossessiveAdjectivesPronounsDiagram";
import { ToBeDiagram } from "./ToBeDiagram";
import { AuxiliaryVerbsBeDoDiagram } from "./AuxiliaryVerbsBeDoDiagram";
import { ThereIsAreDiagram } from "./ThereIsAreDiagram";
import { CanCantDiagram } from "./CanCantDiagram";
import { PresentContinuousA1Diagram } from "./PresentContinuousA1Diagram";
import { PossessiveSDiagram } from "./PossessiveSDiagram";
import { PastSimpleDiagram } from "./PastSimpleDiagram";
import { PresentSimpleVsContinuousDiagram } from "./PresentSimpleVsContinuousDiagram";
import { FutureWillGoingToDiagram } from "./FutureWillGoingToDiagram";
import { FirstConditionalDiagram } from "./FirstConditionalDiagram";

export type DiagramProps = { variant: "screen" | "print"; accentColor?: string };

// One diagram component per topic id, added opt-in as each is built — most topics have none of
// these yet, which is fine; TopicDiagram below renders nothing when a topic id isn't in this map.
// Keyed by the same topic id used everywhere else (TOPIC_OPTIONS/LESSONS), so adding the next
// topic's diagram is a one-line addition here plus a new sibling component file — nothing else
// that renders TopicDiagram (LessonContent, LearnScreen's print, LessonPlanScreen's on-screen
// slideshow and print) needs to change.
const TOPIC_DIAGRAMS: Record<string, ComponentType<DiagramProps>> = {
  present_perfect_vs_past_simple: PresentPerfectVsPastSimpleDiagram,
  prepositions_place: PrepositionsOfPlaceDiagram,
  basic_word_order: BasicWordOrderDiagram,
  what_time_is_it: WhatTimeIsItDiagram,
  present_simple: PresentSimpleDiagram,
  days_dates_prepositions_time: DaysDatesPrepositionsTimeDiagram,
  possessive_adjectives_pronouns: PossessiveAdjectivesPronounsDiagram,
  to_be: ToBeDiagram,
  auxiliary_verbs_be_do: AuxiliaryVerbsBeDoDiagram,
  there_is_are: ThereIsAreDiagram,
  can_cant: CanCantDiagram,
  present_continuous_a1: PresentContinuousA1Diagram,
  possessive_s: PossessiveSDiagram,
  past_simple: PastSimpleDiagram,
  present_simple_vs_continuous: PresentSimpleVsContinuousDiagram,
  future_will_going_to: FutureWillGoingToDiagram,
  first_conditional: FirstConditionalDiagram,
};

export function TopicDiagram({ topicId, variant, accentColor }: { topicId: string; variant: "screen" | "print"; accentColor?: string }) {
  const Diagram = TOPIC_DIAGRAMS[topicId];
  if (!Diagram) return null;
  return <Diagram variant={variant} accentColor={accentColor} />;
}
