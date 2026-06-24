import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme, useAuth, useAnalytics } from "@/core/providers";
import { Button, Input, Text } from "@/components/ui";

export default function UpdateProfileScreen() {
  const { getThemeValue } = useTheme();
  const { customer, updateProfile } = useAuth();
  const navigation = useNavigation<any>();
  const { screen } = useAnalytics();

  const [firstName, setFirstName] = useState(customer?.firstName ?? "");
  const [lastName, setLastName] = useState(customer?.lastName ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [acceptsMarketing, setAcceptsMarketing] = useState(customer?.acceptsMarketing ?? false);
  const [submitting, setSubmitting] = useState(false);

  const colors = {
    bg: getThemeValue("colors.background"),
    muted: getThemeValue("colors.muted"),
  };

  useEffect(() => {
    screen("UpdateProfile");
  }, []);

  if (!customer) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.content, { alignItems: "center", justifyContent: "center" }]}>
          <Text>Please sign in.</Text>
          <View style={{ marginTop: 12 }}>
            <Button onPress={() => navigation.navigate("AccountLogin")}>Sign In</Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await updateProfile({
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        acceptsMarketing,
      } as any);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Could not save", e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h2">Edit profile</Text>
        <Text variant="body" style={{ color: colors.muted, marginTop: 4, marginBottom: 20 }}>
          Signed in as {customer.email}
        </Text>

        <View style={{ gap: 14 }}>
          <Input label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <Input label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 555 555 5555"
            keyboardType="phone-pad"
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

        <View style={{ marginTop: 16, gap: 8 }}>
          <Button onPress={onSubmit} isLoading={submitting}>Save changes</Button>
          <Button variant="outline" onPress={() => navigation.goBack()}>Cancel</Button>
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
});
