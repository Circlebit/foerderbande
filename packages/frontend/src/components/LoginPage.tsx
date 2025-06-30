import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { signIn, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));

      // Clear errors when user starts typing
      if (error) clearError();
      if (formError) setFormError(null);
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic form validation
    if (!formData.email.trim()) {
      setFormError("Bitte E-Mail-Adresse eingeben");
      return;
    }
    if (!formData.password.trim()) {
      setFormError("Bitte Passwort eingeben");
      return;
    }

    try {
      await signIn(formData.email.trim(), formData.password);
      // Success - user will be redirected by App component
    } catch (err) {
      // Error is already handled by useAuth hook
      console.error("Login error:", err);
    }
  };

  const displayError = formError || error;

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              fomo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Funding Opportunity Monitor
            </Typography>
          </Box>

          {displayError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => {
                clearError();
                setFormError(null);
              }}
            >
              {displayError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="E-Mail-Adresse"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              disabled={loading}
              required
              autoComplete="email"
              autoFocus
            />

            <TextField
              label="Passwort"
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              disabled={loading}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Anmelden...
                </Box>
              ) : (
                "Anmelden"
              )}
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 3,
            }}
          >
            Für Zugang wenden Sie sich an den Administrator
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
