import React, { useEffect } from "react";
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { Trash2, Mic } from "lucide-react-native";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { useTranscriptionStore } from "../stores/transcriptionStore";
import { useSettingsStore } from "../stores/settingsStore";
import { COLORS, DARK_COLORS } from "../config/constants";
import type { Transcription } from "../types";

export default function TranscriptionsScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;
  const { transcriptions, isLoading, fetchTranscriptions, deleteTranscription } =
    useTranscriptionStore();

  useEffect(() => {
    fetchTranscriptions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = (item: Transcription) => {
    Alert.alert(
      "Supprimer la transcription",
      "Êtes-vous sûr de vouloir supprimer cette transcription ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            if (item.cloud_id) deleteTranscription(item.cloud_id);
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Transcription }) => (
    <Card style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary + "15",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Mic size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}
            numberOfLines={3}
          >
            {item.text}
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            {item.provider && (
              <Badge variant="outline">{item.provider}</Badge>
            )}
            {item.is_processed && (
              <Badge variant="success">Traité</Badge>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={{ padding: 4 }}
        >
          <Trash2 size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20, flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground, marginBottom: 16 }}>
          Transcriptions
        </Text>

        {isLoading ? (
          <View style={{ gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={80} />
            ))}
          </View>
        ) : (
          <FlatList
            data={transcriptions}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Mic size={40} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 14 }}>
                  Aucune transcription
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
