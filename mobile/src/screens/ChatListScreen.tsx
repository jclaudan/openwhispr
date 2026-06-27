import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MessageSquare, Plus, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChatStore } from "../stores/chatStore";
import { useSettingsStore } from "../stores/settingsStore";
import { COLORS, DARK_COLORS } from "../config/constants";
import type { Conversation } from "../types";

export default function ChatListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;

  const { conversations, loading, fetchConversations, createConversation, deleteConversation } =
    useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleCreate = useCallback(async () => {
    const conv = await createConversation();
    if (conv?.cloud_id) {
      navigation.navigate("ChatDetail", { cloudId: conv.cloud_id, title: conv.title });
    }
  }, [createConversation, navigation]);

  const handleDelete = useCallback(
    (conv: Conversation) => {
      Alert.alert("Supprimer", `Supprimer "${conv.title}" ?`, [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => conv.cloud_id && deleteConversation(conv.cloud_id),
        },
      ]);
    },
    [deleteConversation],
  );

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.convItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() =>
        navigation.navigate("ChatDetail", { cloudId: item.cloud_id, title: item.title })
      }
      onLongPress={() => handleDelete(item)}
    >
      <MessageSquare size={20} color={colors.primary} />
      <Text style={[styles.convTitle, { color: colors.foreground }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Trash2 size={16} color={colors.destructive} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Agent</Text>
        <TouchableOpacity onPress={handleCreate} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Plus size={20} color={COLORS.primaryForeground} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : conversations.length === 0 ? (
        <View style={styles.empty}>
          <MessageSquare size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Aucune conversation
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Appuyez sur + pour créer une conversation avec votre agent
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 24, fontWeight: "700" },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  loader: { marginTop: 40 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 8, textAlign: "center" },
  list: { padding: 16 },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  convTitle: { flex: 1, fontSize: 16, fontWeight: "500" },
});
