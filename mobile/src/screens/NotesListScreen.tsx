import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Plus, FileText, FolderOpen } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Input } from "../components/ui/Input";
import { useNotesStore } from "../stores/notesStore";
import { useSettingsStore } from "../stores/settingsStore";
import { COLORS, DARK_COLORS } from "../config/constants";
import type { Note } from "../types";

export default function NotesListScreen({ navigation }: any) {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;
  const { notes, folders, isLoading, fetchNotes, fetchFolders, createNote, setActiveFolder, activeFolderId } = useNotesStore();
  const [showNewInput, setShowNewInput] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchNotes();
    fetchFolders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredNotes = activeFolderId
    ? notes.filter((n) => n.folder_id === activeFolderId)
    : notes;

  const handleCreate = async () => {
    const title = newTitle.trim() || "Untitled Note";
    await createNote(title, "", activeFolderId ?? undefined);
    setNewTitle("");
    setShowNewInput(false);
  };

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("NoteDetail", { noteId: item.cloud_id })}
      activeOpacity={0.7}
    >
      <Card style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}
              numberOfLines={2}
            >
              {item.content || "Empty note"}
            </Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 4 }}>
              {new Date(item.updated_at).toLocaleDateString()}
            </Text>
          </View>
          <Badge variant={item.note_type === "meeting" ? "success" : "outline"}>
            {item.note_type}
          </Badge>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderFolderBar = () => (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
      <TouchableOpacity
        onPress={() => setActiveFolder(null)}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: !activeFolderId ? colors.primary + "20" : "transparent",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: !activeFolderId ? colors.primary : colors.mutedForeground,
            fontWeight: "500",
          }}
        >
          Tous
        </Text>
      </TouchableOpacity>
      {folders.map((f) => (
        <TouchableOpacity
          key={f.id}
          onPress={() => setActiveFolder(f.id)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: activeFolderId === f.id ? colors.primary + "20" : "transparent",
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <FolderOpen size={12} color={activeFolderId === f.id ? colors.primary : colors.mutedForeground} />
          <Text
            style={{
              fontSize: 12,
              color: activeFolderId === f.id ? colors.primary : colors.mutedForeground,
              fontWeight: "500",
            }}
          >
            {f.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20, flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>
            Notes
          </Text>
          <Button size="sm" onPress={() => setShowNewInput(true)}>
            <Plus size={14} color={colors.primaryForeground} />
            Nouvelle
          </Button>
        </View>

        {renderFolderBar()}

        {showNewInput && (
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <Input
              placeholder="Titre de la note..."
              value={newTitle}
              onChangeText={setNewTitle}
              style={{ flex: 1 }}
              onSubmitEditing={handleCreate}
            />
            <Button size="sm" onPress={handleCreate}>
              Créer
            </Button>
          </View>
        )}

        {isLoading ? (
          <View style={{ gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={80} />
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderNote}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <FileText size={40} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 14 }}>
                  Aucune note
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
