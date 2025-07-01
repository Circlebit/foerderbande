import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  Switch,
  Chip,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useCallback } from "react";
import {
  useSources,
  type Source,
  type SourceInsert,
} from "../hooks/useSources";

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

  const handleCreateSource = useCallback(async () => {
    // Create a new source with default values
    const newSource: SourceInsert = {
      name: "Neue Quelle",
      url: "https://",
      source_type: "website",
      is_active: true,
    };

    try {
      await createSource(newSource);
    } catch (err) {
      console.error("Error creating source:", err);
    }
  }, [createSource]);

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

  // Handle cell edit commits
  const handleProcessRowUpdate = useCallback(
    async (newRow: Source, oldRow: Source) => {
      try {
        // Validate required fields
        if (!newRow.name?.trim()) {
          throw new Error("Name ist erforderlich");
        }
        if (!newRow.url?.trim()) {
          throw new Error("URL ist erforderlich");
        }

        // Update the source
        await updateSource(newRow.id, {
          name: newRow.name.trim(),
          url: newRow.url.trim(),
        });

        return newRow;
      } catch (error) {
        console.error("Error updating source:", error);
        // Return old row to revert changes on error
        return oldRow;
      }
    },
    [updateSource]
  );

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    console.error("Row update error:", error);
  }, []);

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

  // Column definitions for DataGrid with inline editing
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 2,
      minWidth: 200,
      editable: true,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.name}
        </Typography>
      ),
    },
    {
      field: "url",
      headerName: "URL",
      flex: 2,
      minWidth: 250,
      editable: true,
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
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleDeleteSource(params.row.id)}
          color="error"
          title="Löschen"
        >
          <DeleteIcon />
        </IconButton>
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
              Doppelklicken Sie auf Name oder URL zum Bearbeiten.
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
              onClick={handleCreateSource}
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

        {/* DataGrid with inline editing */}
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
                sortModel: [{ field: "last_crawled_at", sort: "desc" }],
              },
            }}
            processRowUpdate={handleProcessRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
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
              // Inline editing styles
              "& .MuiDataGrid-cell--editable": {
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              },
              "& .MuiDataGrid-cell--editing": {
                backgroundColor: "primary.light",
                color: "primary.contrastText",
              },
            }}
          />
        </Box>

        {/* Help Text */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Tipp: Doppelklicken Sie auf eine Zelle in der Name- oder
            URL-Spalte, um sie direkt zu bearbeiten. Drücken Sie Enter zum
            Speichern oder Escape zum Abbrechen.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
