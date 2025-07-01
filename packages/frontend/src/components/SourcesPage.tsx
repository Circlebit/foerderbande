import {
  Box,
  Typography,
  Button,
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
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
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

  // Debug log
  console.log(
    "SourcesPage: sources =",
    sources,
    "loading =",
    loading,
    "error =",
    error
  );

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

  const handleToggleActive = useCallback(
    async (id: number) => {
      await toggleActive(id);
    },
    [toggleActive]
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

  // Column definitions for DataGrid - simplified for debugging
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 2,
      minWidth: 200,
    },
    {
      field: "url",
      headerName: "URL",
      flex: 2,
      minWidth: 250,
    },
    // {
    //   field: "source_type",
    //   headerName: "Typ",
    //   width: 120,
    // },
    {
      field: "is_active",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.is_active ? "Aktiv" : "Inaktiv"}
          color={params.row.is_active ? "success" : "error"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Aktionen",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={params.row.is_active ? "Deaktivieren" : "Aktivieren"}>
            <IconButton
              size="small"
              onClick={() => handleToggleActive(params.row.id)}
              color={params.row.is_active ? "success" : "default"}
            >
              {params.row.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Bearbeiten">
            <IconButton size="small" onClick={() => openEditDialog(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Löschen">
            <IconButton
              size="small"
              onClick={() => handleDeleteSource(params.row.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
    <Box
      sx={{
        height: "98vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          p: 3,
        }}
      >
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

        {/* DataGrid */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={sources}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            disableRowSelectionOnClick
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          />
        </Box>
      </Box>

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
