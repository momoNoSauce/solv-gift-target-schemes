// viewholder_cdc_quiz.xml + QuizBottomSheetFragment.kt — the CDC quiz bottom sheet that
// pays Jumbocoins, and its completed state.
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Sheet from '../../src/components/Sheet';
import { IconJumboCoins } from '../../src/icons';
import { Q, QM, QUIZ } from '../../src/coins/theme';
import QuestionChip from '../../src/coins/QuestionChip';
import OptionRow from '../../src/coins/OptionRow';
import Svg, { Path } from 'react-native-svg';
import { JIX_GENIUS } from '../../src/coins/jixLogo';

export default function QuizSheet() {
  const [completed, setCompleted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const question = QUIZ.questions[index];

  return (
    <Sheet>
        <View>
          <View style={styles.handle} />

          {!completed ? (
            <ScrollView>
              {/* icQuizLogo: ic_jix_genius, 152x32 */}
              <Svg width={152} height={32} viewBox={JIX_GENIUS.viewBox} style={styles.quizLogo}>
                {JIX_GENIUS.paths.map((p, i) => (
                  <Path key={i} d={p.d} fill={p.fill} />
                ))}
              </Svg>
              {/* questionRecyclerView — one chip per question */}
              <View style={styles.questionNav}>
                {QUIZ.questions.map((q, i) => {
                  const answered = answers[i] !== undefined;
                  const state = !answered ? 'unmarked' : answers[i] === q.answerIndex ? 'correct' : 'wrong';
                  return (
                    <QuestionChip
                      key={i}
                      index={i}
                      reward={QUIZ.coinsPerQuestion}
                      state={state}
                      isLast={i === QUIZ.questions.length - 1}
                      onPress={() => setIndex(i)}
                    />
                  );
                })}
              </View>

              <View style={styles.questionRow}>
                <Text style={styles.questionIndex} allowFontScaling={false}>{index + 1}</Text>
                <Text style={styles.dot} allowFontScaling={false}>.</Text>
                <Text style={styles.questionText} allowFontScaling={false}>{question.text}</Text>
              </View>

              {/* optionRecyclerView: marginTop 16, rows from option_viewholder_binding */}
              <View style={{ marginTop: 16, marginHorizontal: 16 }}>
                {question.options.map((o, i) => {
                  const marked = answers[index];
                  const answered = marked !== undefined;
                  const isCorrect = i === question.answerIndex;
                  const state = !answered
                    ? 'plain'
                    : marked === i
                    ? (isCorrect ? 'correct' : 'wrong')
                    : isCorrect
                    ? 'correct'
                    : 'plain';
                  return (
                    <OptionRow
                      key={i}
                      text={o}
                      selected={marked === i}
                      state={state}
                      showGuiding
                      onPress={() => (answered ? null : setAnswers({ ...answers, [index]: i }))}
                    />
                  );
                })}
              </View>

              <View style={styles.actionRow}>
                {index > 0 ? (
                  <Pressable onPress={() => setIndex(index - 1)}>
                    <Text style={styles.navAction} allowFontScaling={false}>{QM._previous_question}</Text>
                  </Pressable>
                ) : <View />}
                <Pressable
                  onPress={() => (index < QUIZ.questions.length - 1 ? setIndex(index + 1) : setCompleted(true))}
                >
                  <Text style={styles.navAction} allowFontScaling={false}>{QM._next_question} ›</Text>
                </Pressable>
              </View>
            </ScrollView>
          ) : null}

          {completed ? (
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
              <Text style={styles.completedText} allowFontScaling={false}>{QM._quiz_completed_text}</Text>
              <Text style={styles.completedTitle} allowFontScaling={false}>{QUIZ.title}</Text>

              <View style={styles.rewardEarnedRow}>
                <Text style={styles.rewardEarnedText} allowFontScaling={false}>{QM._total_jumbocoins_earned_text}</Text>
                <Text style={styles.rewardEarnedNumber} allowFontScaling={false}>{QUIZ.earnedCoins}</Text>
                <IconJumboCoins size={20} />
              </View>

              <View style={styles.questionNav}>
                {QUIZ.questions.map((q, i) => (
                  <QuestionChip
                    key={i}
                    index={i}
                    reward={QUIZ.coinsPerQuestion}
                    state="correct"
                    isLast={i === QUIZ.questions.length - 1}
                  />
                ))}
              </View>

              <View style={styles.ownedRow}>
                <Text style={styles.ownedMessage} allowFontScaling={false}>{QM._jumbocoins_owned_text}</Text>
                <View style={styles.ownedBox}>
                  <Text style={styles.ownedNumber} allowFontScaling={false}>{QUIZ.ownedCoins}</Text>
                </View>
                <View style={styles.ownedCoin}>
                  <IconJumboCoins size={25} />
                </View>
              </View>

              <Text style={styles.closeText} allowFontScaling={false}>{QM._close_text}</Text>
            </ScrollView>
          ) : null}

        </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  // roundedLineLayout: 48x6, cardBackgroundColor light_grey_4, 8dp corners
  handle: { width: 48, height: 6, borderRadius: 8, backgroundColor: '#D1D1D1', alignSelf: 'center', marginTop: 16 },
  quizLogo: { marginTop: 24, alignSelf: 'center' },
  questionNav: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  questionRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16 },
  questionIndex: { color: Q.greyMineShaft, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Medium' },
  dot: { color: Q.greyMineShaft, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Medium' },
  questionText: { flex: 1, marginLeft: 4, marginRight: 16, color: Q.greyMineShaft, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Medium' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 16, paddingHorizontal: 16 },
  navAction: { color: Q.blue4, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Regular' },
  completedText: { marginTop: 16, color: Q.black, fontSize: 12, lineHeight: 14.4, fontFamily: 'Roboto-Medium' },
  completedTitle: { marginTop: 10, color: Q.black, fontSize: 20, lineHeight: 24.0, fontFamily: 'Roboto-Medium', textAlign: 'center' },
  rewardEarnedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  rewardEarnedText: { margin: 8, color: Q.black, fontSize: 18, lineHeight: 21.6, fontFamily: 'Roboto-Regular' },
  rewardEarnedNumber: { marginHorizontal: 8, color: Q.black, fontSize: 18, lineHeight: 21.6, fontFamily: 'Roboto-Bold' },
  ownedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26 },
  ownedMessage: { color: Q.grey9, fontSize: 12, lineHeight: 14.4, fontFamily: 'Roboto-Medium' },
  // outline_green_cornered_border
  ownedBox: { marginHorizontal: 30, borderWidth: 2, borderColor: '#e6e6e6', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  ownedNumber: { paddingLeft: 10, color: Q.black, fontSize: 12, lineHeight: 14.4, fontFamily: 'Roboto-Medium' },
  ownedCoin: { marginLeft: -15 },
  closeText: { marginTop: 26, padding: 8, textAlign: 'center', color: Q.textBlue, fontSize: 16, lineHeight: 19.2, fontFamily: 'Roboto-Regular' },
});
