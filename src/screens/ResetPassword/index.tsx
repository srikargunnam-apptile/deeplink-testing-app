import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme, useAuth, useAnalytics } from "@/core/providers";
import { Button, Input, Text } from "@/components/ui";

export default function ResetPasswordScreen() {
  const { getThemeValue } = useTheme();
  const { recoverPassword } = useAuth();
  const navigation = useNavigation<any>();
  const { screen } = useAnalytics();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const colors = {
    bg: getThemeValue("colors.background"),
    muted: getThemeValue("colors.muted"),
  };

  useEffect(() => {
    screen("ResetPassword");
  }, []);

  const onSubmit = async () => {
    if (!email) {
      Alert.alert("Missing email", "Please enter the email address on your account.");
      return;
    }
    setSubmitting(true);
    try {
      await recoverPassword(email);
      setSent(true);
    } catch (e) {
      Alert.alert("Could not send reset email", e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <View style={styles.content}>
        <Text variant="h2">Reset your password</Text>
        <Text variant="body" style={{ color: colors.muted, marginTop: 4, marginBottom: 20 }}>
          Enter your email and we’ll send you a reset link.
        </Text>

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

        {sent && (
          <Text variant="body" style={{ color: colors.muted, marginTop: 16 }}>
            If an account exists for {email}, you’ll receive an email shortly.
          </Text>
        )}

        <View style={{ marginTop: 24, gap: 8 }}>
          <Button onPress={onSubmit} isLoading={submitting} disabled={sent}>
            {sent ? "Email sent" : "Send reset link"}
          </Button>
          <Button variant="outline" onPress={() => navigation.goBack()}>
            Back to sign in
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, flex: 1 },
});
