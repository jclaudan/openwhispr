import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Home, FileText, History, Settings } from "lucide-react-native";
import { useSettingsStore } from "../stores/settingsStore";
import { COLORS, DARK_COLORS } from "../config/constants";

import HomeScreen from "../screens/HomeScreen";
import NotesListScreen from "../screens/NotesListScreen";
import NoteDetailScreen from "../screens/NoteDetailScreen";
import TranscriptionsScreen from "../screens/TranscriptionsScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const NotesStack = createNativeStackNavigator();

function NotesStackScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;

  return (
    <NotesStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <NotesStack.Screen name="NotesList" component={NotesListScreen} />
      <NotesStack.Screen name="NoteDetail" component={NoteDetailScreen} />
    </NotesStack.Navigator>
  );
}

export default function AppNavigator() {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.foreground,
          border: colors.border,
          notification: colors.destructive,
        },
        fonts: {
          regular: { fontFamily: "System", fontWeight: "400" },
          medium: { fontFamily: "System", fontWeight: "500" },
          bold: { fontFamily: "System", fontWeight: "700" },
          heavy: { fontFamily: "System", fontWeight: "800" },
        },
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            backgroundColor: isDark ? colors.surface1 : colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "500",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Accueil",
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Notes"
          component={NotesStackScreen}
          options={{
            tabBarLabel: "Notes",
            tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Transcriptions"
          component={TranscriptionsScreen}
          options={{
            tabBarLabel: "Transcriptions",
            tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: "Paramètres",
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
