import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Server, Palette, Check, LogOut } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useSettingsStore } from "../stores/settingsStore";
import { api } from "../services/api";
import { authenticate, clearAuth } from "../services/auth";
import { COLORS, DARK_COLORS } from "../config/constants";

export default function SettingsScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;
  const { serverUrl, apiToken, setServerUrl, setApiToken, setTheme, setConnected, isConnected } =
    useSettingsStore();

  const [editUrl, setEditUrl] = useState(serverUrl);
  const [editToken, setEditToken] = useState(apiToken);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!editUrl.trim()) return;
    setIsConnecting(true);
    try {
      const result = await authenticate(editUrl.trim(), editToken.trim());
      api.configure(result.token, editUrl.trim());
      setServerUrl(editUrl.trim());
      setApiToken(result.token);
      setConnected(true);
      Alert.alert("Connecté", "Connecté au serveur avec succès");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      Alert.alert("Erreur", message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearAuth();
    setServerUrl("");
    setApiToken("");
    setConnected(false);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>
          Paramètres
        </Text>

        <Card>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            <Server size={14} color={colors.primary} /> Serveur
          </Text>

          {!isConnected ? (
            <>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, marginBottom: 12 }}>
                Connectez-vous à votre serveur de synchronisation OpenWhispr pour accéder à vos notes et transcriptions.
              </Text>
              <Input
                placeholder="URL du serveur (ex: https://sync.example.com)"
                value={editUrl}
                onChangeText={setEditUrl}
                autoCapitalize="none"
                autoCorrect={false}
                style={{ marginBottom: 8 }}
              />
              <Input
                placeholder="Token d'API"
                value={editToken}
                onChangeText={setEditToken}
                secureTextEntry
                autoCapitalize="none"
                style={{ marginBottom: 12 }}
              />
              <Button
                onPress={handleConnect}
                loading={isConnecting}
                disabled={!editUrl.trim()}
              >
                Connecter
              </Button>
            </>
          ) : (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.success,
                  }}
                />
                <Text style={{ fontSize: 13, color: colors.success, fontWeight: "500" }}>
                  Connecté
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, marginBottom: 4 }}>
                {serverUrl}
              </Text>
              <Button variant="destructive" size="sm" onPress={handleDisconnect}>
                <LogOut size={14} color={colors.primaryForeground} />
                Déconnecter
              </Button>
            </>
          )}
        </Card>

        <Card>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            <Palette size={14} color={colors.primary} /> Apparence
          </Text>
          <Button variant="outline" onPress={toggleTheme}>
            {theme === "dark" ? "🌙 Mode sombre" : "☀️ Mode clair"}
          </Button>
          <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 8 }}>
            Actuellement : {theme === "dark" ? "Sombre" : "Clair"}
          </Text>
        </Card>

        <Card>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
            OpenWhispr Mobile
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            Version 1.0.0 — Client mobile pour serveur de synchronisation OpenWhispr
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
