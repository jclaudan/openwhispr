import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Send, ArrowLeft, Bot, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChatStore } from "../stores/chatStore";
import { useSettingsStore } from "../stores/settingsStore";
import { COLORS, DARK_COLORS } from "../config/constants";
import type { Message } from "../types";

export default function ChatDetailScreen({ route, navigation }: any) {
  const { cloudId } = route.params;
  const insets = useSafeAreaInsets();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;

  const { messages, loading, fetchMessages, sendMessage } = useChatStore();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const convMessages = messages[cloudId] || [];

  useEffect(() => {
    if (cloudId) fetchMessages(cloudId);
  }, [cloudId]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    await sendMessage(cloudId, text);
    setSending(false);
  }, [input, sending, cloudId, sendMessage]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        <View
          style={[
            styles.msgBubble,
            isUser
              ? [styles.msgBubbleUser, { backgroundColor: colors.primary }]
              : [styles.msgBubbleBot, { backgroundColor: colors.muted, borderColor: colors.border }],
          ]}
        >
          <View style={styles.msgHeader}>
            {isUser ? (
              <User size={14} color={COLORS.primaryForeground} />
            ) : (
              <Bot size={14} color={colors.foreground} />
            )}
            <Text
              style={[
                styles.msgRole,
                { color: isUser ? COLORS.primaryForeground : colors.mutedForeground },
              ]}
            >
              {isUser ? "Vous" : "Agent"}
            </Text>
          </View>
          <Text
            style={[
              styles.msgContent,
              { color: isUser ? COLORS.primaryForeground : colors.foreground },
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {route.params?.title || "Agent"}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {loading && convMessages.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : convMessages.length === 0 ? (
        <View style={styles.empty}>
          <Bot size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Démarrez une conversation
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Envoyez un message à votre agent
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={convMessages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
        />
      )}

      <View style={[styles.inputBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border },
          ]}
          placeholder="Écrivez un message..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || sending}
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
        >
          <Send size={18} color={input.trim() ? COLORS.primaryForeground : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "600", textAlign: "center" },
  loader: { marginTop: 40 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 8, textAlign: "center" },
  list: { padding: 16, paddingBottom: 8 },
  msgRow: { marginBottom: 12, flexDirection: "row" },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowBot: { justifyContent: "flex-start" },
  msgBubble: { maxWidth: "80%", borderRadius: 14, padding: 12 },
  msgBubbleUser: { borderBottomRightRadius: 4 },
  msgBubbleBot: { borderBottomLeftRadius: 4, borderWidth: 1 },
  msgHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  msgRole: { fontSize: 12, fontWeight: "600" },
  msgContent: { fontSize: 15, lineHeight: 20 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
