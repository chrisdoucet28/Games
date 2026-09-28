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
import { IrregularVerbsDiagram } from "./IrregularVerbsDiagram";
import { ZeroConditionalDiagram } from "./ZeroConditionalDiagram";
import { UsedToPastDiagram } from "./UsedToPastDiagram";
import { MakingQuestionsDiagram } from "./MakingQuestionsDiagram";
import { PresentContinuousA2Diagram } from "./PresentContinuousA2Diagram";
import { ComparativesSuperlativesDiagram } from "./ComparativesSuperlativesDiagram";
import { ComparativesDiagram } from "./ComparativesDiagram";
import { SuperlativesDiagram } from "./SuperlativesDiagram";
import { EquativesNonEquativesDiagram } from "./EquativesNonEquativesDiagram";
import { ConjunctionsDiagram } from "./ConjunctionsDiagram";
import { TooMuchManyDiagram } from "./TooMuchManyDiagram";
import { QuantifiersDiagram } from "./QuantifiersDiagram";
import { ModalsObligationDiagram } from "./ModalsObligationDiagram";
import { ModalsPossibilityDiagram } from "./ModalsPossibilityDiagram";
import { SubjectObjectQuestionsDiagram } from "./SubjectObjectQuestionsDiagram";
import { PresentPerfectDiagram } from "./PresentPerfectDiagram";
import { PhrasalVerbsDiagram } from "./PhrasalVerbsDiagram";
import { SoNeitherDiagram } from "./SoNeitherDiagram";
import { ModalVerbsDiagram } from "./ModalVerbsDiagram";
import { UnderstandingGetDiagram } from "./UnderstandingGetDiagram";
import { PreferRatherDiagram } from "./PreferRatherDiagram";
import { PassiveSimpleDiagram } from "./PassiveSimpleDiagram";
import { GetUsedToDiagram } from "./GetUsedToDiagram";
import { ReportedSpeechDiagram } from "./ReportedSpeechDiagram";
import { IndefinitePronounsDiagram } from "./IndefinitePronounsDiagram";
import { RelativeClausesDiagram } from "./RelativeClausesDiagram";
import { ClausesOfReasonDiagram } from "./ClausesOfReasonDiagram";
import { ClausesOfPurposeDiagram } from "./ClausesOfPurposeDiagram";
import { ClausesOfContrastDiagram } from "./ClausesOfContrastDiagram";
import { DependentPrepositionsDiagram } from "./DependentPrepositionsDiagram";
import { GerundsDiagram } from "./GerundsDiagram";
import { EdIngAdjectivesDiagram } from "./EdIngAdjectivesDiagram";
import { ArticlesDiagram } from "./ArticlesDiagram";
import { AdverbsDiagram } from "./AdverbsDiagram";
import { IntensifiersDiagram } from "./IntensifiersDiagram";
import { DoubleComparativesDiagram } from "./DoubleComparativesDiagram";
import { SecondConditionalDiagram } from "./SecondConditionalDiagram";
import { PastContinuousDiagram } from "./PastContinuousDiagram";
import { PastPerfectDiagram } from "./PastPerfectDiagram";
import { QuestionTagsDiagram } from "./QuestionTagsDiagram";
import { FutureContinuousDiagram } from "./FutureContinuousDiagram";
import { PresentPerfectContinuousDiagram } from "./PresentPerfectContinuousDiagram";
import { PastModalsDeductionDiagram } from "./PastModalsDeductionDiagram";
import { FutureInPastDiagram } from "./FutureInPastDiagram";
import { ThirdConditionalDiagram } from "./ThirdConditionalDiagram";
import { FuturePerfectDiagram } from "./FuturePerfectDiagram";
import { WishIfOnlyDiagram } from "./WishIfOnlyDiagram";
import { GerundsInfinitivesDiagram } from "./GerundsInfinitivesDiagram";
import { EmbeddedQuestionsDiagram } from "./EmbeddedQuestionsDiagram";
import { MixedConditionalsDiagram } from "./MixedConditionalsDiagram";
import { PassiveComplexDiagram } from "./PassiveComplexDiagram";
import { CausativeVerbsDiagram } from "./CausativeVerbsDiagram";
import { InversionDiagram } from "./InversionDiagram";
import { PassiveReportingStructuresDiagram } from "./PassiveReportingStructuresDiagram";
import { CleftSentencesDiagram } from "./CleftSentencesDiagram";
import { IntroducingOthersDiagram } from "./IntroducingOthersDiagram";
import { WhatDoYouDoDiagram } from "./WhatDoYouDoDiagram";
import { NumbersAndColoursDiagram } from "./NumbersAndColoursDiagram";
import { FamilyMembersDiagram } from "./FamilyMembersDiagram";
import { DailyRoutinesFrequencyDiagram } from "./DailyRoutinesFrequencyDiagram";

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
  irregular_verbs: IrregularVerbsDiagram,
  zero_conditional: ZeroConditionalDiagram,
  used_to_past: UsedToPastDiagram,
  making_questions: MakingQuestionsDiagram,
  present_continuous_a2: PresentContinuousA2Diagram,
  comparatives_superlatives: ComparativesSuperlativesDiagram,
  comparatives: ComparativesDiagram,
  superlatives: SuperlativesDiagram,
  equatives_non_equatives: EquativesNonEquativesDiagram,
  conjunctions: ConjunctionsDiagram,
  too_much_many: TooMuchManyDiagram,
  quantifiers: QuantifiersDiagram,
  modals_obligation: ModalsObligationDiagram,
  modals_possibility: ModalsPossibilityDiagram,
  subject_object_questions: SubjectObjectQuestionsDiagram,
  present_perfect: PresentPerfectDiagram,
  phrasal_verbs: PhrasalVerbsDiagram,
  so_neither: SoNeitherDiagram,
  modal_verbs: ModalVerbsDiagram,
  understanding_get: UnderstandingGetDiagram,
  prefer_rather: PreferRatherDiagram,
  passive_simple: PassiveSimpleDiagram,
  get_used_to: GetUsedToDiagram,
  reported_speech: ReportedSpeechDiagram,
  indefinite_pronouns: IndefinitePronounsDiagram,
  relative_clauses: RelativeClausesDiagram,
  clauses_of_reason: ClausesOfReasonDiagram,
  clauses_of_purpose: ClausesOfPurposeDiagram,
  clauses_of_contrast: ClausesOfContrastDiagram,
  dependent_prepositions: DependentPrepositionsDiagram,
  gerunds: GerundsDiagram,
  ed_ing_adjectives: EdIngAdjectivesDiagram,
  articles: ArticlesDiagram,
  adverbs: AdverbsDiagram,
  intensifiers_so_such_enough: IntensifiersDiagram,
  double_comparatives: DoubleComparativesDiagram,
  second_conditional: SecondConditionalDiagram,
  past_continuous: PastContinuousDiagram,
  past_perfect: PastPerfectDiagram,
  question_tags: QuestionTagsDiagram,
  future_continuous: FutureContinuousDiagram,
  present_perfect_continuous: PresentPerfectContinuousDiagram,
  past_modals_deduction: PastModalsDeductionDiagram,
  future_in_past: FutureInPastDiagram,
  third_conditional: ThirdConditionalDiagram,
  future_perfect: FuturePerfectDiagram,
  wish_if_only: WishIfOnlyDiagram,
  gerunds_infinitives: GerundsInfinitivesDiagram,
  embedded_questions: EmbeddedQuestionsDiagram,
  mixed_conditionals: MixedConditionalsDiagram,
  passive_complex: PassiveComplexDiagram,
  causative_verbs: CausativeVerbsDiagram,
  inversion: InversionDiagram,
  passive_reporting_structures: PassiveReportingStructuresDiagram,
  cleft_sentences: CleftSentencesDiagram,
  introducing_others: IntroducingOthersDiagram,
  what_do_you_do: WhatDoYouDoDiagram,
  numbers_and_colours: NumbersAndColoursDiagram,
  family_members: FamilyMembersDiagram,
  daily_routines_frequency: DailyRoutinesFrequencyDiagram,
};

export function TopicDiagram({ topicId, variant, accentColor }: { topicId: string; variant: "screen" | "print"; accentColor?: string }) {
  const Diagram = TOPIC_DIAGRAMS[topicId];
  if (!Diagram) return null;
  return <Diagram variant={variant} accentColor={accentColor} />;
}
