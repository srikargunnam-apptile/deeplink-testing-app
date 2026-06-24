import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme, useAuth, useAnalytics } from "@/core/providers";
import { Button, Input, Text } from "@/components/ui";

export default function AccountRegisterScreen() {
  const { getThemeValue } = useTheme();
  const { signup } = useAuth();
  const navigation = useNavigation<any>();
  const { screen } = useAnalytics();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const colors = {
    bg: getThemeValue("colors.background"),
    muted: getThemeValue("colors.muted"),
    primary: getThemeValue("colors.primary"),
  };

  useEffect(() => {
    screen("AccountRegister");
  }, []);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Email and password are required.");
      return;
    }
    if (password.length < 5) {
      Alert.alert("Password too short", "Use at least 5 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signup({ email, password, firstName, lastName, acceptsMarketing });
      navigation.replace?.("Account");
    } catch (e) {
      Alert.alert("Sign up failed", e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h2">Create your account</Text>
        <Text variant="body" style={{ color: colors.muted, marginTop: 4, marginBottom: 20 }}>
          Sign up to track orders and check out faster.
        </Text>

        <View style={{ gap: 14 }}>
          <Input label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <Input label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 5 characters"
            secureTextEntry
            textContentType="newPassword"
          />
        </View>

        <View style={styles.marketingRow}>
          <View style={{ flex: 1 }}>
            <Text variant="label">Marketing emails</Text>
            <Text variant="caption" style={{ color: colors.muted }}>
              Get notified about new collections and sales.
            </Text>
          </View>
          <Switch value={acceptsMarketing} onValueChange={setAcceptsMarketing} />
        </View>

        <View style={{ marginTop: 16 }}>
          <Button onPress={onSubmit} isLoading={submitting}>Create Account</Button>
        </View>

        <View style={styles.footer}>
          <Text variant="body">Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate("AccountLogin")}>
            <Text variant="label" style={{ color: colors.primary }}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  marketingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
});
