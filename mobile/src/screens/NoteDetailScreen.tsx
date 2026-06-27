import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, SafeAreaView, ScrollView, Alert } from "react-native";
import { Trash2, ArrowLeft } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { useNotesStore } from "../stores/notesStore";
import { useSettingsStore } from "../stores/settingsStore";
import { COLORS, DARK_COLORS } from "../config/constants";
import type { Note } from "../types";

export default function NoteDetailScreen({ route, navigation }: any) {
  const { noteId } = route.params;
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;
  const { notes, updateNote, deleteNote } = useNotesStore();
  const note = notes.find((n) => n.cloud_id === noteId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = useCallback(async () => {
    if (!noteId) return;
    await updateNote(noteId, { title, content } as Partial<Note>);
  }, [noteId, title, content, updateNote]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Supprimer la note",
      "Êtes-vous sûr de vouloir supprimer cette note ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            if (noteId) {
              await deleteNote(noteId);
              navigation.goBack();
            }
          },
        },
      ],
    );
  }, [noteId, deleteNote, navigation]);

  if (!note) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 20, gap: 12 }}>
          <Skeleton height={24} width="60%" />
          <Skeleton height={200} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Button variant="ghost" size="sm" onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={colors.foreground} />
          </Button>
          <Badge variant={note.note_type === "meeting" ? "success" : "outline"}>
            {note.note_type}
          </Badge>
          <View style={{ flex: 1 }} />
          <Button variant="destructive" size="sm" onPress={handleDelete}>
            <Trash2 size={14} color={colors.primaryForeground} />
          </Button>
        </View>

        <Card style={{ marginBottom: 16 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            onBlur={handleSave}
            placeholder="Titre"
            placeholderTextColor={colors.mutedForeground}
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.foreground,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingBottom: 12,
              marginBottom: 12,
            }}
          />
          <TextInput
            value={content}
            onChangeText={setContent}
            onBlur={handleSave}
            placeholder="Contenu de la note..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
            style={{
              fontSize: 14,
              color: colors.foreground,
              lineHeight: 22,
              minHeight: 200,
            }}
          />
        </Card>

        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
            Créée le {new Date(note.created_at).toLocaleDateString()}
          </Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>·</Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
            Modifiée le {new Date(note.updated_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
