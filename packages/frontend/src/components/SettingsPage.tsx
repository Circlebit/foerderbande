import {
  Box,
  Paper,
  Typography,
  Divider,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Alert,
  Chip,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();

  // Mock settings state - später aus Supabase laden
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyDigest: false,
    relevanceThreshold: 0.7,
    favoriteKeywords: ["Demokratie", "Bildung", "Kultur"],
    excludeKeywords: ["Landwirtschaft", "Technik"],
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const handleSettingChange =
    (key: keyof typeof settings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const handleAddKeyword = (type: "favoriteKeywords" | "excludeKeywords") => {
    if (newKeyword.trim()) {
      setSettings((prev) => ({
        ...prev,
        [type]: [...prev[type], newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (
    type: "favoriteKeywords" | "excludeKeywords",
    index: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");

    // Simulate API call - später echte Implementierung
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Einstellungen
      </Typography>

      {saveStatus === "saved" && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Einstellungen erfolgreich gespeichert!
        </Alert>
      )}

      {/* User Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Benutzerinformationen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            E-Mail: {user?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User ID: {user?.id}
          </Typography>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Benachrichtigungen
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleSettingChange("emailNotifications")}
                />
              }
              label="E-Mail-Benachrichtigungen bei neuen relevanten Ausschreibungen"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.weeklyDigest}
                  onChange={handleSettingChange("weeklyDigest")}
                />
              }
              label="Wöchentliche Zusammenfassung per E-Mail"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Filter Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter-Einstellungen
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Relevanz-Schwellenwert
            </Typography>
            <TextField
              type="number"
              value={settings.relevanceThreshold}
              onChange={handleSettingChange("relevanceThreshold")}
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              size="small"
              sx={{ width: 120 }}
              helperText="Wert zwischen 0.0 und 1.0"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Favorite Keywords */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Bevorzugte Schlagwörter
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {settings.favoriteKeywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  onDelete={() =>
                    handleRemoveKeyword("favoriteKeywords", index)
                  }
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Neues Schlagwort hinzufügen"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddKeyword("favoriteKeywords");
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => handleAddKeyword("favoriteKeywords")}
                disabled={!newKeyword.trim()}
              >
                Hinzufügen
              </Button>
            </Box>
          </Box>

          {/* Exclude Keywords */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ausgeschlossene Schlagwörter
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {settings.excludeKeywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  onDelete={() => handleRemoveKeyword("excludeKeywords", index)}
                  color="error"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Schlagwort ausschließen"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddKeyword("excludeKeywords");
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => handleAddKeyword("excludeKeywords")}
                disabled={!newKeyword.trim()}
              >
                Hinzufügen
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          size="large"
        >
          {saveStatus === "saving" ? "Speichern..." : "Einstellungen speichern"}
        </Button>
      </Box>
    </Box>
  );
}
