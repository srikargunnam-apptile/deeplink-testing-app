import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme, useAuth, useAnalytics } from "@/core/providers";
import { Button, Input, Text } from "@/components/ui";

export default function AccountLoginScreen() {
  const { getThemeValue } = useTheme();
  const { login, customer } = useAuth();
  const navigation = useNavigation<any>();
  const { screen } = useAnalytics();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const colors = {
    bg: getThemeValue("colors.background"),
    muted: getThemeValue("colors.muted"),
    primary: getThemeValue("colors.primary"),
  };

  useEffect(() => {
    screen("AccountLogin");
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (customer) {
      navigation.replace?.("Account");
    }
  }, [customer]);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login({ email, password });
      navigation.replace?.("Account");
    } catch (e) {
      Alert.alert("Login failed", e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <View style={styles.content}>
        <Text variant="h2">Welcome back</Text>
        <Text variant="body" style={{ color: colors.muted, marginTop: 4, marginBottom: 20 }}>
          Sign in to continue shopping.
        </Text>

        <View style={{ gap: 14 }}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />
        </View>

        <View style={{ alignItems: "flex-end", marginTop: 8 }}>
          <Pressable onPress={() => navigation.navigate("ResetPassword")}>
            <Text variant="caption" style={{ color: colors.primary }}>
              Forgot password?
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 16 }}>
          <Button onPress={onSubmit} isLoading={submitting}>Sign In</Button>
        </View>

        <View style={styles.footer}>
          <Text variant="body">Don’t have an account? </Text>
          <Pressable onPress={() => navigation.navigate("AccountRegister")}>
            <Text variant="label" style={{ color: colors.primary }}>Create one</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, flex: 1 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
});
