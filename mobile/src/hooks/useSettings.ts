import { useEffect } from "react";
import { useSettingsStore } from "../stores/settingsStore";

export function useSettings() {
  const store = useSettingsStore();

  useEffect(() => {
    store.hydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return store;
}
