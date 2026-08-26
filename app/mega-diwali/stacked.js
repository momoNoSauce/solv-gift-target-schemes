// Flow B, stacked variant (backup). Every crossed tier shows "Secured", so the page
// reads as a stack of guaranteed gifts. The scheme pays one gift only (highest slab),
// so this variant can mislead. It stays as a reference; the one-gift design lives at
// /mega-diwali (index.js).
// Design decisions:
//   - One customer is enrolled in one category ladder (BG inclusion decides which).
//     The page renders the enrolled ladder. There is no category switch.
//   - The next gift is the emotional center: a large product photo, the exact gap
//     amount, and a progress bar from the previous slab to the next slab. Local
//     progress keeps the bar moving at a visible rate.
//   - The full 8-slab ladder renders as a vertical road with product photos.
//     Tier states: Secured, Next (with the gap amount), Locked.
//   - The one-gift rule appears on the page in full.
//   - Delivery has a date and a channel: the team orders the gift on Amazon after the
//     window closes, and Amazon delivers it to the shop address.
import React from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { F } from '../../src/theme';
import { IconBack } from '../../src/icons';
import GiftGlyph from '../../src/gifts/icons';
import { CAMPAIGN, LADDERS, MEMBER, GM, lakh, ladderState } from '../../src/gifts/data';
import { indianPrice } from '../../src/data';

// Flow B palette: one dark header, one gold accent, white cards.
const K = {
  night: '#1B1240',
  night2: '#31205E',
  gold: '#F2B84B',
  goldDeep: '#B4700F',
  ink: '#1A1A1A',
  sub: '#6B6B6B',
  line: '#E5E7EB',
  paper: '#FFFFFF',
  bg: '#F7F7F7',
  green: '#1E8E3E',
  greenBg: '#E9F5EC',
  amberBg: '#FDF3E0',
};

function GiftThumb({ tier, size = 52, dim = false }) {
  if (tier.image) {
    return (
      <View style={[styles.thumb, { width: size, height: size, opacity: dim ? 0.45 : 1 }]}>
        <Image source={tier.image} style={{ width: size - 10, height: size - 10 }} resizeMode="contain" />
      </View>
    );
  }
  return (
    <View style={[styles.thumb, { width: size, height: size, opacity: dim ? 0.45 : 1 }]}>
      <GiftGlyph kind={tier.icon} size={size - 22} color={K.sub} strokeWidth={1.7} />
    </View>
  );
}

export default function MegaDiwaliHubStacked() {
  const router = useRouter();
  const ladder = LADDERS.find((l) => l.key === MEMBER.ladderKey);
  const { secured, next, remaining } = ladderState(ladder);

  const tiers = ladder.tiers;
  const prevAt = next ? (tiers[tiers.indexOf(next) - 1]?.at || 0) : 0;
  const localPct = next ? Math.min(100, Math.round(((ladder.currentValue - prevAt) / (next.at - prevAt)) * 100)) : 100;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <LinearGradient colors={[K.night, K.night2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <Pressable style={styles.back} onPress={() => router.back()} android_ripple={{ color: '#ffffff33', borderless: true }}>
            <IconBack size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerArt}>
            <GiftGlyph kind="sparkle" size={16} color={K.gold} />
            <GiftGlyph kind="diya" size={40} color={K.gold} strokeWidth={1.4} />
            <GiftGlyph kind="sparkle" size={16} color={K.gold} />
          </View>
          <Text style={styles.h1} allowFontScaling={false}>{CAMPAIGN.title}</Text>
          <Text style={styles.h2} allowFontScaling={false}>
            Your scheme: {ladder.label} • {CAMPAIGN.startLabel} to {CAMPAIGN.endLabel}
          </Text>
          <View style={styles.countChip}>
            <Text style={styles.countChipText} allowFontScaling={false}>{CAMPAIGN.daysLeft} days left</Text>
          </View>
        </LinearGradient>

        {/* Hero: money earned, then the next gift with its photo */}
        <View style={[styles.card, styles.hero]}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel} allowFontScaling={false}>Your purchases this window</Text>
            <Text style={styles.statValue} allowFontScaling={false}>{indianPrice(ladder.currentValue)}</Text>
          </View>
          <Text style={styles.scopeLine} allowFontScaling={false}>Counts: {ladder.scopeLine}</Text>

          {next ? (
            <>
              <View style={styles.heroStage}>
                {next.image ? (
                  <Image source={next.image} style={styles.heroImage} resizeMode="contain" />
                ) : (
                  <GiftGlyph kind={next.icon} size={90} color={K.goldDeep} strokeWidth={1.2} />
                )}
              </View>
              <Text style={styles.heroName} allowFontScaling={false}>{next.name}</Text>
              <Text style={styles.heroGap} allowFontScaling={false}>
                Buy for {indianPrice(remaining)} more before {CAMPAIGN.endLabel}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${localPct}%` }]} />
              </View>
              <View style={styles.barEnds}>
                <Text style={styles.barEnd} allowFontScaling={false}>{lakh(prevAt)}</Text>
                <Text style={styles.barEnd} allowFontScaling={false}>{lakh(next.at)}</Text>
              </View>
            </>
          ) : null}

          {secured ? (
            <View style={styles.securedRow}>
              <GiftThumb tier={secured} size={40} />
              <Text style={styles.securedText} allowFontScaling={false}>
                The {secured.shortName} is already yours. It ships after {CAMPAIGN.endLabel}.
              </Text>
              <GiftGlyph kind="check" size={20} color={K.green} strokeWidth={1.8} />
            </View>
          ) : (
            <View style={styles.securedRow}>
              <Text style={styles.noneText} allowFontScaling={false}>
                Cross the first slab ({lakh(tiers[0].at)}) to secure your first gift.
              </Text>
            </View>
          )}
        </View>

        {/* Gift road */}
        <Text style={styles.sectionTitle} allowFontScaling={false}>The gift ladder</Text>
        <View style={styles.card}>
          {tiers.map((t, i) => {
            const isSecured = ladder.currentValue >= t.at;
            const isNext = next && t.at === next.at;
            const isLastRow = i === tiers.length - 1;
            const dim = !isSecured && !isNext;
            return (
              <View key={t.at} style={styles.tierRow}>
                <View style={styles.rail}>
                  <View style={[styles.node, isSecured && styles.nodeSecured, isNext && styles.nodeNext]}>
                    {isSecured ? (
                      <GiftGlyph kind="check" size={14} color="#fff" strokeWidth={2.2} />
                    ) : (
                      <View style={[styles.nodeDot, isNext && { backgroundColor: K.goldDeep }]} />
                    )}
                  </View>
                  {!isLastRow ? <View style={[styles.railLine, isSecured && styles.railLineDone]} /> : null}
                </View>
                <View style={[styles.tierBody, !isLastRow && styles.tierBodyPad]}>
                  <View style={[styles.tierCard, isNext && styles.tierCardNext]}>
                    <GiftThumb tier={t} dim={dim} />
                    <View style={styles.tierText}>
                      <Text style={[styles.tierName, dim && styles.tierNameLocked]} allowFontScaling={false}>
                        {t.name}
                      </Text>
                      <Text style={styles.tierAt} allowFontScaling={false}>Buy for {indianPrice(t.at)}</Text>
                    </View>
                    {isSecured ? (
                      <Text style={[styles.tierState, { color: K.green }]} allowFontScaling={false}>Secured</Text>
                    ) : isNext ? (
                      <Text style={[styles.tierState, { color: K.goldDeep }]} allowFontScaling={false}>
                        {remaining >= 100000 ? lakh(remaining) : indianPrice(remaining)} to go
                      </Text>
                    ) : (
                      <Text style={[styles.tierState, { color: K.sub }]} allowFontScaling={false}>Locked</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
          <View style={styles.oneGiftRow}>
            <GiftGlyph kind="gift" size={18} color={K.sub} strokeWidth={1.7} />
            <Text style={styles.oneGiftText} allowFontScaling={false}>{GM._one_gift_rule}</Text>
          </View>
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle} allowFontScaling={false}>How it works</Text>
        <View style={styles.card}>
          {[
            ['1', `Buy in the window (${CAMPAIGN.startLabel} to ${CAMPAIGN.endLabel}). Every eligible order counts.`],
            ['2', 'Cross a slab to secure its gift. A higher slab replaces the lower gift.'],
            ['3', `After ${CAMPAIGN.endLabel}, we confirm your gift and deliver it by ${CAMPAIGN.deliverByLabel}.`],
          ].map(([n, line], i) => (
            <View key={n} style={[styles.stepRow, i > 0 && styles.stepDivider]}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText} allowFontScaling={false}>{n}</Text>
              </View>
              <Text style={styles.stepText} allowFontScaling={false}>{line}</Text>
            </View>
          ))}
        </View>

        {/* Delivery note */}
        <View style={[styles.card, styles.deliveryCard]}>
          <GiftGlyph kind="truck" size={22} color={K.ink} strokeWidth={1.6} />
          <Text style={styles.deliveryText} allowFontScaling={false}>{GM._delivery_note}</Text>
        </View>

        <Pressable style={styles.endStateLink} onPress={() => router.push('/mega-diwali/claim')}>
          <Text style={styles.endStateText} allowFontScaling={false}>
            Prototype: view the end-of-scheme state
          </Text>
        </Pressable>
        <Pressable style={styles.endStateLink} onPress={() => router.push('/mega-diwali')}>
          <Text style={styles.endStateText} allowFontScaling={false}>
            Prototype: view the one-gift design
          </Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: K.bg },
  header: { paddingBottom: 44, alignItems: 'center' },
  back: { position: 'absolute', left: 16, top: 14, width: 24, height: 24, zIndex: 2 },
  headerArt: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  h1: { marginTop: 10, color: '#fff', fontFamily: F.bold, fontSize: 22, lineHeight: 27 },
  h2: { marginTop: 4, color: '#CDC3EA', fontFamily: F.regular, fontSize: 13, lineHeight: 16 },
  countChip: { marginTop: 12, backgroundColor: K.gold, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  countChipText: { color: K.night, fontFamily: F.bold, fontSize: 12, lineHeight: 15 },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: K.paper, borderRadius: 12, borderWidth: 1, borderColor: K.line, padding: 16 },
  hero: { marginTop: -24 },
  statRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  statLabel: { fontFamily: F.regular, fontSize: 12, lineHeight: 15, color: K.sub },
  statValue: { fontFamily: F.bold, fontSize: 18, lineHeight: 22, color: K.ink },
  scopeLine: { marginTop: 2, fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: K.sub },

  heroStage: {
    marginTop: 14,
    height: 170,
    borderRadius: 10,
    backgroundColor: K.amberBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: { width: 200, height: 150 },
  heroName: { marginTop: 12, textAlign: 'center', fontFamily: F.bold, fontSize: 16, lineHeight: 20, color: K.ink },
  heroGap: { marginTop: 3, textAlign: 'center', fontFamily: F.medium, fontSize: 13, lineHeight: 16, color: K.goldDeep },
  barTrack: { marginTop: 12, height: 8, borderRadius: 4, backgroundColor: '#EFEAF9', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: K.gold },
  barEnds: { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' },
  barEnd: { fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: K.sub },

  securedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, backgroundColor: K.greenBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  securedText: { flex: 1, fontFamily: F.medium, fontSize: 12, lineHeight: 16, color: K.green },
  noneText: { flex: 1, fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: K.sub },

  sectionTitle: { marginTop: 20, marginHorizontal: 16, fontFamily: F.bold, fontSize: 16, lineHeight: 20, color: K.ink },

  thumb: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: K.line,
    backgroundColor: K.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierRow: { flexDirection: 'row' },
  rail: { width: 30, alignItems: 'center' },
  node: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: K.line, backgroundColor: K.paper, alignItems: 'center', justifyContent: 'center', zIndex: 1, marginTop: 14 },
  nodeSecured: { backgroundColor: K.green, borderColor: K.green },
  nodeNext: { borderColor: K.gold, backgroundColor: K.amberBg },
  nodeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: K.line },
  railLine: { flex: 1, width: 2, backgroundColor: K.line },
  railLineDone: { backgroundColor: K.green },
  tierBody: { flex: 1, marginLeft: 8 },
  tierBodyPad: { paddingBottom: 10 },
  tierCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: K.line, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  tierCardNext: { borderColor: K.gold, backgroundColor: '#FFFDF7' },
  tierText: { flex: 1 },
  tierName: { fontFamily: F.medium, fontSize: 13, lineHeight: 16, color: K.ink },
  tierNameLocked: { color: K.sub },
  tierAt: { marginTop: 2, fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: K.sub },
  tierState: { fontFamily: F.bold, fontSize: 11, lineHeight: 14 },
  oneGiftRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: K.line },
  oneGiftText: { flex: 1, fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: K.sub },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  stepDivider: { borderTopWidth: 1, borderTopColor: K.line },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: K.night, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  stepNumText: { color: '#fff', fontFamily: F.bold, fontSize: 12, lineHeight: 15 },
  stepText: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: K.ink },

  deliveryCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  deliveryText: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: K.ink },

  endStateLink: { marginTop: 16, alignItems: 'center' },
  endStateText: { fontFamily: F.medium, fontSize: 12, lineHeight: 15, color: K.sub, textDecorationLine: 'underline' },
});
