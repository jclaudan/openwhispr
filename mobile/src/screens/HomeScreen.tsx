import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Mic, MicOff, FileText, History } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAudioRecording } from "../hooks/useAudioRecording";
import { useSettingsStore } from "../stores/settingsStore";
import { COLORS, DARK_COLORS } from "../config/constants";

export default function HomeScreen({ navigation }: any) {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;
  const { isRecording, isProcessing, error, startRecording, stopRecording } =
    useAudioRecording();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, alignItems: "center", gap: 24 }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: colors.foreground,
            marginTop: 20,
          }}
        >
          OpenWhispr
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.mutedForeground,
            textAlign: "center",
          }}
        >
          Appuyez sur le microphone pour dicter
        </Text>

        <Card
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: isRecording ? colors.destructive : colors.primary,
          }}
        >
          {isRecording ? (
            <MicOff size={48} color={colors.destructive} />
          ) : (
            <Mic size={48} color={colors.primary} />
          )}
        </Card>

        <Button
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          onPress={isRecording ? stopRecording : startRecording}
          loading={isProcessing}
          style={{ width: 200 }}
        >
          {isRecording ? "Arrêter" : "Enregistrer"}
        </Button>

        {isProcessing && (
          <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
            Transcription en cours...
          </Text>
        )}

        {error && (
          <Text style={{ color: colors.destructive, fontSize: 13 }}>
            {error}
          </Text>
        )}

        <View style={{ width: "100%", gap: 12, marginTop: 12 }}>
          <Button
            variant="outline"
            onPress={() => navigation.navigate("Notes")}
            style={{ justifyContent: "flex-start" }}
          >
            <FileText size={16} color={colors.foreground} />
            Notes
          </Button>
          <Button
            variant="outline"
            onPress={() => navigation.navigate("Transcriptions")}
            style={{ justifyContent: "flex-start" }}
          >
            <History size={16} color={colors.foreground} />
            Transcriptions
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
