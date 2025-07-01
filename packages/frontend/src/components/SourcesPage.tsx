import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Fab,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useState, useCallback } from "react";
import {
  useSources,
  type Source,
  type SourceInsert,
} from "../hooks/useSources";

interface SourceDialogProps {
  open: boolean;
  source?: Source | null;
  onClose: () => void;
  onSave: (data: SourceInsert) => Promise<void>;
}

function SourceDialog({ open, source, onClose, onSave }: SourceDialogProps) {
  const [formData, setFormData] = useState<SourceInsert>({
    name: source?.name || "",
    url: source?.url || "",
    description: source?.description || "",
    source_type: source?.source_type || "website",
    is_active: source?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange =
    (field: keyof SourceInsert) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (formError) setFormError(null);
    };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name?.trim()) {
      setFormError("Name ist erforderlich");
      return;
    }
    if (!formData.url?.trim()) {
      setFormError("URL ist erforderlich");
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        name: "",
        url: "",
        description: "",
        source_type: "website",
        is_active: true,
      });
    } catch (err) {
      setFormError("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {source ? "Quelle bearbeiten" : "Neue Quelle hinzufügen"}
      </DialogTitle>
      <DialogContent>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={handleChange("name")}
            required
            disabled={saving}
            placeholder="z.B. Förderdatenbank des Bundes"
          />

          <TextField
            label="URL"
            value={formData.url}
            onChange={handleChange("url")}
            required
            disabled={saving}
            placeholder="https://example.com"
          />

          <TextField
            label="Beschreibung"
            value={formData.description || ""}
            onChange={handleChange("description")}
            multiline
            rows={3}
            disabled={saving}
            placeholder="Kurze Beschreibung der Quelle..."
          />

          <TextField
            label="Typ"
            value={formData.source_type}
            onChange={handleChange("source_type")}
            disabled={saving}
            placeholder="website, rss, api, etc."
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active || false}
                onChange={handleChange("is_active")}
                disabled={saving}
              />
            }
            label="Aktiv (Crawling aktiviert)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Abbrechen
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={20} /> : "Speichern"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function SourcesPage() {
  const {
    sources,
    loading,
    error,
    refetch,
    createSource,
    updateSource,
    deleteSource,
    toggleActive,
  } = useSources();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  const handleCreateSource = useCallback(
    async (data: SourceInsert) => {
      await createSource(data);
    },
    [createSource]
  );

  const handleEditSource = useCallback(
    async (data: SourceInsert) => {
      if (editingSource) {
        await updateSource(editingSource.id, data);
      }
    },
    [editingSource, updateSource]
  );

  const handleDeleteSource = useCallback(
    async (id: number) => {
      if (window.confirm("Quelle wirklich löschen?")) {
        await deleteSource(id);
      }
    },
    [deleteSource]
  );

  const openCreateDialog = () => {
    setEditingSource(null);
    setDialogOpen(true);
  };

  const openEditDialog = (source: Source) => {
    setEditingSource(source);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingSource(null);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Erneut versuchen
            </Button>
          }
        >
          Fehler beim Laden der Quellen: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Crawling-Quellen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verwalten Sie die Websites und APIs, die nach Fördermitteln
            durchsucht werden.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={refetch}
            disabled={loading}
            title="Aktualisieren"
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Neue Quelle
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Chip label={`${sources.length} Quellen gesamt`} variant="outlined" />
        <Chip
          label={`${sources.filter((s) => s.is_active).length} aktiv`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`${sources.filter((s) => !s.is_active).length} inaktiv`}
          color="error"
          variant="outlined"
        />
      </Box>

      {/* Sources Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : sources.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Noch keine Quellen vorhanden
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Fügen Sie Ihre erste Crawling-Quelle hinzu, um mit der Datensammlung
            zu beginnen.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Erste Quelle hinzufügen
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {sources.map((source) => (
            <Grid item xs={12} md={6} lg={4} key={source.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" component="h3" noWrap>
                      {source.name}
                    </Typography>
                    <Chip
                      label={source.is_active ? "Aktiv" : "Inaktiv"}
                      size="small"
                      color={source.is_active ? "success" : "error"}
                      variant="outlined"
                      onClick={() => toggleActive(source.id)}
                      sx={{ cursor: "pointer" }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {source.url}
                  </Typography>

                  {source.description && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {source.description}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    {source.source_type && (
                      <Chip
                        label={source.source_type}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => openEditDialog(source)}
                    title="Bearbeiten"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteSource(source.id)}
                    title="Löschen"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={openCreateDialog}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" }, // Only show on mobile
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create/Edit Dialog */}
      <SourceDialog
        open={dialogOpen}
        source={editingSource}
        onClose={closeDialog}
        onSave={editingSource ? handleEditSource : handleCreateSource}
      />
    </Box>
  );
}
