import React, { useEffect } from "react";
import { StatusBar, useColorScheme } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useSettingsStore } from "./src/stores/settingsStore";
import { api } from "./src/services/api";
import { getStoredToken, getStoredServerUrl } from "./src/services/auth";

export default function App() {
  const systemScheme = useColorScheme();
  const { theme, hydrate, setServerUrl, setApiToken, setConnected } = useSettingsStore();

  useEffect(() => {
    hydrate();

    const storedUrl = getStoredServerUrl();
    const storedToken = getStoredToken();
    if (storedUrl && storedToken) {
      api.configure(storedUrl, storedToken);
      setServerUrl(storedUrl);
      setApiToken(storedToken);
      setConnected(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isDark =
    theme === "dark" || (theme === "auto" && systemScheme === "dark");

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#09090b" : "#ffffff"}
      />
      <AppNavigator />
    </>
  );
}
