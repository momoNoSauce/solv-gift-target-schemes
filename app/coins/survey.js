// bottomsheet_jix_survey.xml + JixSurveyBottomSheetFragment.kt — the JIX survey sheet that
// pays Jumbocoins, with its completion card.
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Sheet from '../../src/components/Sheet';
import { IconJumboCoins } from '../../src/icons';
import { Q, QM, SURVEY } from '../../src/coins/theme';
import OptionRow from '../../src/coins/OptionRow';

export default function SurveySheet() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const question = SURVEY.questions[index];

  return (
    <Sheet style={styles.sheet}>
        <View>
          {/* progressDotsLayout + rewardsLabel + buttonClose */}
          <View style={styles.topRow}>
            <View style={styles.dots}>
              {SURVEY.questions.map((_, i) => (
                <View key={i} style={[styles.dot, i <= index && styles.dotActive]} />
              ))}
            </View>
            <Text style={styles.rewardsLabel} allowFontScaling={false}>{SURVEY.rewardsLabel}</Text>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path fill={Q.black} d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </Svg>
          </View>

          {done ? (
            <>
              <Text style={styles.completionHeader} allowFontScaling={false}>{QM._survey_completion_header}</Text>
              <View style={styles.completionCard}>
                <Text style={styles.completionTitle} allowFontScaling={false}>{QM._survey_completed_text}</Text>
                <View style={{ marginTop: 16 }}>
                  <IconJumboCoins size={80} />
                </View>
                <Text style={styles.completionEarned} allowFontScaling={false}>
                  {QM._survey_earned_text.replace('%s', SURVEY.earned)}
                </Text>
                <Text style={styles.completionTotal} allowFontScaling={false}>
                  {QM._survey_total_in_account.replace('%s', SURVEY.total)}
                </Text>
                <Pressable style={styles.doneButton}>
                  <Text style={styles.doneText} allowFontScaling={false}>{QM._done}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <ScrollView>
              <Text style={styles.questionTitle} allowFontScaling={false}>{question.title}</Text>
              <Text style={styles.questionReward} allowFontScaling={false}>{question.reward}</Text>

              {question.input ? (
                <TextInput
                  style={styles.input}
                  placeholder={QM._jix_survey_input_hint}
                  placeholderTextColor={Q.grey9}
                  value={text}
                  onChangeText={setText}
                  multiline
                />
              ) : (
                // optionsRecyclerView: marginTop 12, rows from option_viewholder_binding
                <View style={{ marginTop: 12 }}>
                  {question.options.map((o, i) => (
                    <OptionRow
                      key={i}
                      text={o}
                      selected={answers[index] === i}
                      onPress={() => setAnswers({ ...answers, [index]: i })}
                    />
                  ))}
                </View>
              )}

              {/* actionsLayout: buttonPrevious (80dp, jix_button_skip) + buttonNext
                  (fills the rest, jix_button_next_disabled until an option is picked) */}
              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.skipButton}
                  onPress={() => (index < SURVEY.questions.length - 1 ? setIndex(index + 1) : setDone(true))}
                >
                  <Text style={styles.skipText} allowFontScaling={false}>Skip this Question</Text>
                </Pressable>
                <Pressable
                  style={[styles.nextButton, answers[index] === undefined && !text && styles.nextButtonDisabled]}
                  onPress={() => (index < SURVEY.questions.length - 1 ? setIndex(index + 1) : setDone(true))}
                >
                  <Text style={styles.nextText} allowFontScaling={false}>{QM._next_question}</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  // jix_survey_sheet_bg plus the sheet's own padding: 16 horizontal, 12 vertical
  sheet: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4, backgroundColor: '#e0e0e0' },
  dotActive: { backgroundColor: Q.lightGreen },
  rewardsLabel: { flex: 1, textAlign: 'center', color: Q.grey9, fontSize: 12, lineHeight: 14.4, fontFamily: 'Roboto-Medium' },
  questionTitle: { marginTop: 14, color: Q.black, fontSize: 16, lineHeight: 19.2, fontFamily: 'Roboto-Medium' },
  questionReward: { marginTop: 4, color: Q.grey9, fontSize: 12, lineHeight: 14.4, fontFamily: 'Roboto-Medium' },
  // jix_option_unselected / jix_option_selected
  option: { borderWidth: 1, borderColor: Q.lightGrey, borderRadius: 8, padding: 14, marginBottom: 8 },
  optionSelected: { borderColor: Q.lightGreen },
  optionText: { color: Q.black, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Regular' },
  input: { marginTop: 12, borderWidth: 1, borderColor: Q.lightGrey, borderRadius: 8, padding: 12, minHeight: 88, textAlignVertical: 'top', color: Q.black, fontFamily: 'Roboto-Regular' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  // jix_button_skip: white, radius 6, 1dp light_grey_1
  skipButton: { width: 80, minHeight: 40, borderRadius: 6, borderWidth: 1, borderColor: '#b1b1b1', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  skipText: { color: Q.grey9, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Medium', textAlign: 'center' },
  // jix_button_next_enabled: light_green, radius 6; disabled: disabled_btn #C9C9C9
  nextButton: { flex: 1, marginLeft: 10, minHeight: 40, borderRadius: 6, backgroundColor: Q.lightGreen, alignItems: 'center', justifyContent: 'center' },
  nextButtonDisabled: { backgroundColor: '#C9C9C9' },
  nextText: { color: Q.white, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Medium' },
  completionHeader: { marginTop: 8, color: Q.grey9, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Regular' },
  // jix_completion_card_bg
  completionCard: { marginTop: 10, borderRadius: 12, backgroundColor: Q.white, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#eeeeee' },
  completionTitle: { textAlign: 'center', color: Q.black, fontSize: 24, lineHeight: 28.8, fontFamily: 'Roboto-Medium' },
  completionEarned: { marginTop: 16, textAlign: 'center', color: Q.black, fontSize: 20, lineHeight: 24.0, fontFamily: 'Roboto-Medium' },
  completionTotal: { marginTop: 12, textAlign: 'center', color: Q.black, fontSize: 16, lineHeight: 19.2, fontFamily: 'Roboto-Regular' },
  doneButton: { marginTop: 20, alignSelf: 'stretch', backgroundColor: Q.shireGreen, borderRadius: 4, paddingVertical: 12, alignItems: 'center' },
  doneText: { color: Q.white, fontSize: 18, lineHeight: 21.6, fontFamily: 'Roboto-Medium' },
});
