import { ReactNode } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput, TextInputProps,
  KeyboardAvoidingView, Platform, StyleProp, ViewStyle, TextStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../context/AppContext';

export const C = {
  blue: '#0A6E9F', teal: '#14B8A6', dark: '#0F172A', gray: '#64748B',
  line: '#E2E8F0', mint: '#CCFBF1', lightBlue: '#F0F9FF', soft: '#F8FAFC',
  red: '#EF4444', lightRed: '#FEF2F2', orange: '#F59E0B', lightOrange: '#FFFBEB',
  green: '#10B981', lightGreen: '#ECFDF5', white: '#FFFFFF',
};

export type IconName = keyof typeof Ionicons.glyphMap;

export function Blobs() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: C.teal, opacity: 0.15 }} />
      <View style={{ position: 'absolute', bottom: -80, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: C.mint, opacity: 0.5 }} />
    </View>
  );
}

export function Screen({ title, subtitle, back = true, scroll = true, blobs = true, children }: {
  title?: string; subtitle?: string; back?: boolean; scroll?: boolean; blobs?: boolean; children: ReactNode;
}) {
  const body = (
    <>
      {title ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          {back && (
            <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginRight: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="chevron-back" size={24} color={C.dark} />
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.dark, flexShrink: 1 }}>{title}</Text>
            {subtitle ? <Text style={{ fontSize: 14, color: C.gray, marginTop: 2, fontWeight: '500', flexShrink: 1 }}>{subtitle}</Text> : null}
          </View>
        </View>
      ) : null}
      {children}
    </>
  );
  
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      {blobs && <Blobs />}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {body}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, padding: 24, paddingBottom: 120 }}>{body}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Logo({ size = 1 }: { size?: number }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 80 * size, height: 80 * size, borderRadius: 40 * size, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Ionicons name="heart" size={40 * size} color={C.teal} />
      </View>
      <Text style={{ fontSize: 24 * size, fontWeight: '900', color: C.dark, letterSpacing: 2 }}>SASPI</Text>
      <Text style={{ fontSize: 13 * size, color: C.gray, textAlign: 'center', fontWeight: '500', marginTop: 8 }}>
        {'Sistema de Acompanhamento de\nSaúde para Pessoas Idosas'}
      </Text>
    </View>
  );
}

export const H1 = ({ children, size = 26 }: { children: ReactNode; size?: number }) => (
  <Text style={{ fontSize: size, fontWeight: '800', color: C.dark, letterSpacing: -0.5, flexShrink: 1 }}>{children}</Text>
);

export const Muted = ({ children, size = 15, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) => (
  <Text style={[{ fontSize: size, color: C.gray, lineHeight: size * 1.4, flexShrink: 1 }, style]}>{children}</Text>
);

export const Section = ({ children, right }: { children: ReactNode; right?: string }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
    <Text style={{ fontSize: 18, fontWeight: '800', color: C.dark, flexShrink: 1 }}>{children}</Text>
    {right ? <Text style={{ fontSize: 14, color: C.teal, fontWeight: '700' }}>{right}</Text> : null}
  </View>
);

export function Card({ children, bg = '#fff', border = C.line, style, onPress }: {
  children: ReactNode; bg?: string; border?: string; style?: StyleProp<ViewStyle>; onPress?: () => void;
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress}
      style={[{ backgroundColor: bg, borderWidth: 1, borderColor: border, borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }, style]}>
      {children}
    </Pressable>
  );
}

export function IconBox({ name, color = C.blue, bg = C.lightBlue, size = 46 }: { name: IconName; color?: string; bg?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 16, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={name} size={size * 0.5} color={color} />
    </View>
  );
}

export function Badge({ text, color = C.teal, bg = C.mint }: { text: string; color?: string; bg?: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Text style={{ fontSize: 12, fontWeight: '800', color }}>{text}</Text>
    </View>
  );
}

export function Item({ icon, title, sub, onPress, bg = '#fff', border = C.line, tint = C.blue, iconBg = C.lightBlue, right, titleColor = C.dark }: {
  icon: IconName; title: string; sub?: string; onPress?: () => void; bg?: string; border?: string;
  tint?: string; iconBg?: string; right?: ReactNode; titleColor?: string;
}) {
  return (
    <Card bg={bg} border={border} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <IconBox name={icon} color={tint} bg={iconBg} />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: titleColor, flexShrink: 1 }}>{title}</Text>
        {sub ? <Text style={{ fontSize: 13, color: C.gray, marginTop: 3, lineHeight: 18, flexShrink: 1 }}>{sub}</Text> : null}
      </View>
      {right}
      {onPress ? <Ionicons name="chevron-forward" size={20} color={C.line} style={{ marginLeft: 8 }} /> : null}
    </Card>
  );
}

export function Button({ text, onPress, outline = false, icon }: { text: string; onPress?: () => void; outline?: boolean; icon?: IconName }) {
  const label = (color: string) => (
    <>
      {icon ? <Ionicons name={icon} size={20} color={color} style={{ marginRight: 8 }} /> : null}
      <Text style={{ fontSize: 16, fontWeight: '800', color }}>{text}</Text>
    </>
  );
  const base = { height: 56, borderRadius: 16, alignItems: 'center' as const, justifyContent: 'center' as const, flexDirection: 'row' as const };
  
  if (outline) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [base, { borderWidth: 2, borderColor: C.teal, backgroundColor: pressed ? C.soft : '#fff' }]}>
        {label(C.teal)}
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <LinearGradient colors={[C.blue, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[base, { shadowColor: C.teal, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}>
        {label('#fff')}
      </LinearGradient>
    </Pressable>
  );
}

export function Input({ icon, label, right, ...p }: TextInputProps & { icon?: IconName; label?: string; right?: ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label ? <Text style={{ fontSize: 15, fontWeight: '700', color: C.dark, marginBottom: 8 }}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 56 }}>
        {icon ? <Ionicons name={icon} size={22} color={C.gray} style={{ marginRight: 12 }} /> : null}
        <TextInput placeholderTextColor="#94A3B8" {...p} style={{ flex: 1, fontSize: 16, color: C.dark, height: '100%' }} />
        {right}
      </View>
    </View>
  );
}

export function Segment({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.soft, borderRadius: 14, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: C.line }}>
      {items.map((i) => (
        <Pressable key={i} onPress={() => onChange(i)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: value === i ? '#fff' : 'transparent', shadowColor: value === i ? '#000' : 'transparent', shadowOpacity: 0.05, shadowRadius: 4, elevation: value === i ? 2 : 0 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: value === i ? C.dark : C.gray }}>{i}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Metric({ label, value, note, icon = 'heart' }: { label: string; value: string; note: string; icon?: IconName }) {
  return (
    <Card style={{ flex: 1, marginBottom: 0, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon} size={16} color={C.teal} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: C.gray, marginLeft: 6 }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: '800', color: C.dark, marginVertical: 6 }}>{value}</Text>
      <Text style={{ fontSize: 12, color: C.teal, fontWeight: '700' }}>{note}</Text>
    </Card>
  );
}

export function Bars({ data, color = C.blue }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8 }}>
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.4 + 0.6 * (v / max), borderRadius: 6 }} />
      ))}
    </View>
  );
}

export const Row = ({ children, gap = 12, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ flexDirection: 'row', gap }, style]}>{children}</View>
);

export default function Home() {
  const { elderly } = useApp();

  return (
    <Screen title="Início" back={false}>
      <View style={{ marginBottom: 8 }}>
        <H1 size={24}>Olá, {elderly}</H1>
        <Muted>Acompanhe sua saúde e rotina de cuidados.</Muted>
      </View>

      <Section>Resumo de saúde</Section>
      <Row>
        <Metric label="Pressão arterial" value="—" note="Sem registros" icon="pulse" />
        <Metric label="Frequência cardíaca" value="—" note="Sem registros" icon="heart" />
      </Row>

      <Section>Atalhos</Section>
      <Item
        icon="medkit-outline"
        title="Medicamentos"
        sub="Consulte os horários e registre as doses."
        onPress={() => router.push('/medications')}
      />
      <Item
        icon="calendar-outline"
        title="Consultas"
        sub="Acompanhe sua agenda de saúde."
        onPress={() => router.push('/appointments')}
      />
      <Button
        icon="add"
        text="Registrar sinais vitais"
        onPress={() => router.push('/new-record')}
      />
    </Screen>
  );
}