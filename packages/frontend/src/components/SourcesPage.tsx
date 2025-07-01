import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  Switch,
  Chip,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
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
    source_type: "website", // Fixed default value
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

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Nie";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Gerade eben";
    if (diffMinutes < 60) return `vor ${diffMinutes} Min`;
    if (diffHours < 24) return `vor ${diffHours} Std`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays === 1 ? "" : "en"}`;
    if (diffDays < 30)
      return `vor ${Math.floor(diffDays / 7)} Woche${
        Math.floor(diffDays / 7) === 1 ? "" : "n"
      }`;
    if (diffDays < 365)
      return `vor ${Math.floor(diffDays / 30)} Monat${
        Math.floor(diffDays / 30) === 1 ? "" : "en"
      }`;
    return date.toLocaleDateString("de-DE");
  };

  // Column definitions for DataGrid
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.name}
          </Typography>
          {params.row.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "url",
      headerName: "URL",
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {params.row.url}
        </Typography>
      ),
    },
    {
      field: "is_active",
      headerName: "Aktiv",
      width: 80,
      renderCell: (params) => (
        <Switch
          checked={params.row.is_active}
          onChange={() => handleToggleActive(params.row.id)}
          size="small"
          color="success"
        />
      ),
    },
    {
      field: "last_crawled_at",
      headerName: "Letzte Suche",
      width: 130,
      renderCell: (params) => {
        const lastCrawled = params.row.last_crawled_at;
        const relativeTime = formatRelativeTime(lastCrawled);
        const isOverdue =
          lastCrawled &&
          new Date().getTime() - new Date(lastCrawled).getTime() >
            7 * 24 * 60 * 60 * 1000; // 7 days

        return (
          <Box>
            <Typography
              variant="body2"
              color={
                !lastCrawled
                  ? "text.secondary"
                  : isOverdue
                  ? "warning.main"
                  : "text.primary"
              }
            >
              {relativeTime}
            </Typography>
            {lastCrawled && (
              <Typography variant="caption" color="text.secondary">
                {new Date(lastCrawled).toLocaleDateString("de-DE")}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "created_at",
      headerName: "Erstellt",
      width: 120,
      renderCell: (params) =>
        params.row.created_at ? (
          <Typography variant="body2">
            {new Date(params.row.created_at).toLocaleDateString("de-DE")}
          </Typography>
        ) : (
          "-"
        ),
    },
    {
      field: "actions",
      headerName: "Aktionen",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
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
          <Chip
            label={`${
              sources.filter((s) => !s.last_crawled_at).length
            } noch nie durchsucht`}
            color="warning"
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
              sorting: {
                sortModel: [{ field: "last_crawled_at", sort: "desc" }], // Sort by last crawled by default
              },
            }}
            disableRowSelectionOnClick
            getRowHeight={() => "auto"}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "flex-start",
                lineHeight: "unset !important",
                maxHeight: "none !important",
                whiteSpace: "normal",
                paddingTop: "12px",
                paddingBottom: "12px",
              },
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-row": {
                minHeight: "60px !important",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
              "& .MuiDataGrid-renderingZone": {
                maxHeight: "none !important",
              },
              "& .MuiDataGrid-cell .MuiDataGrid-cellContent": {
                maxHeight: "none",
                whiteSpace: "normal",
                lineHeight: "1.2",
                width: "100%",
              },
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
