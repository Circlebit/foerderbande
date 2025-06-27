import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Link,
  FormControlLabel,
  Switch,
  Tooltip,
} from "@mui/material";
import { useState, useCallback } from "react";
import {
  useFundingCalls,
  type NormalizedFundingCall,
} from "../hooks/useFundingCalls";

export default function FundingCallsGrid() {
  const { fundingCalls, loading, error, usingMockData } = useFundingCalls();
  const [showOnlyRelevant, setShowOnlyRelevant] = useState(true);

  // Track manual overrides (user corrections)
  const [manualOverrides, setManualOverrides] = useState<
    Record<number, boolean>
  >({});

  // Handle manual relevance override
  const handleRelevanceOverride = useCallback(
    (id: number, isRelevant: boolean) => {
      setManualOverrides((prev) => ({
        ...prev,
        [id]: isRelevant,
      }));
    },
    []
  );

  // Get effective relevance (manual override trumps AI decision)
  const getEffectiveRelevance = useCallback(
    (call: NormalizedFundingCall) => {
      if (manualOverrides[call.id] !== undefined) {
        return manualOverrides[call.id];
      }
      return call.relevanceInfo.isRelevant;
    },
    [manualOverrides]
  );

  // Filter funding calls based on toggle and manual overrides
  const filteredFundingCalls = showOnlyRelevant
    ? fundingCalls.filter((call) => getEffectiveRelevance(call))
    : fundingCalls;

  // Custom renderer for relevance with manual override
  const renderRelevance = (params: { row: NormalizedFundingCall }) => {
    // const aiRelevant = params.row.relevanceInfo.isRelevant;
    const effectiveRelevant = getEffectiveRelevance(params.row);
    const hasOverride = manualOverrides[params.row.id] !== undefined;

    const handleChipClick = () => {
      if (hasOverride) {
        // Reset to AI decision
        setManualOverrides((prev) => {
          const newOverrides = { ...prev };
          delete newOverrides[params.row.id];
          return newOverrides;
        });
      } else {
        // Toggle the current state
        handleRelevanceOverride(params.row.id, !effectiveRelevant);
      }
    };

    const getTooltipText = () => {
      if (hasOverride) {
        return "Klicken um AI-Bewertung zu verwenden";
      }
      return effectiveRelevant
        ? "Klicken um als nicht relevant zu markieren"
        : "Klicken um als relevant zu markieren";
    };

    return (
      <Tooltip title={getTooltipText()}>
        <Chip
          label={effectiveRelevant ? "Relevant" : "Nicht relevant"}
          color={effectiveRelevant ? "success" : "error"}
          size="small"
          variant={hasOverride ? "filled" : "outlined"}
          onClick={handleChipClick}
          sx={{
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
            // Visual indicator for manual override
            ...(hasOverride && {
              boxShadow: 1,
            }),
          }}
        />
      </Tooltip>
    );
  };

  // Custom renderer for deadline with urgency indication
  const renderDeadline = (params: { row: NormalizedFundingCall }) => {
    const deadline = params.row.displayDeadline;

    if (!deadline) return "-";

    // Parse deadline - handle different formats
    let deadlineDate: Date;
    try {
      // Try to parse German format first (from sample data)
      if (
        deadline.includes("Januar") ||
        deadline.includes("Dezember") ||
        deadline.includes("Februar")
      ) {
        // Handle German month names - simplified for PoC
        const months: { [key: string]: number } = {
          Januar: 0,
          Februar: 1,
          März: 2,
          April: 3,
          Mai: 4,
          Juni: 5,
          Juli: 6,
          August: 7,
          September: 8,
          Oktober: 9,
          November: 10,
          Dezember: 11,
        };

        const match = deadline.match(/(\d{1,2})\.\s*(\w+)\s*(\d{4})/);
        if (match) {
          const [, day, month, year] = match;
          deadlineDate = new Date(parseInt(year), months[month], parseInt(day));
        } else {
          deadlineDate = new Date(deadline);
        }
      } else {
        deadlineDate = new Date(deadline);
      }
    } catch {
      return deadline; // Fallback: just show raw string
    }

    const today = new Date();
    const daysUntil = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const getUrgencyColor = (days: number) => {
      if (days <= 7) return "error";
      if (days <= 30) return "warning";
      return "default";
    };

    return (
      <Box>
        <Typography variant="body2">
          {deadlineDate.toLocaleDateString("de-DE")}
        </Typography>
        <Typography
          variant="caption"
          color={`${getUrgencyColor(daysUntil)}.main`}
        >
          {daysUntil > 0 ? `${daysUntil} Tage` : "Abgelaufen"}
        </Typography>
      </Box>
    );
  };

  // Custom renderer for title with link
  // const renderTitle = (params: { row: NormalizedFundingCall }) => {
  //   const { row } = params;
  //   const url = row.source_url;

  //   if (!url) {
  //     return (
  //       <Typography variant="body2" fontWeight={500}>
  //         {row.title}
  //       </Typography>
  //     );
  //   }

  //   return (
  //     <Link
  //       href={url}
  //       target="_blank"
  //       rel="noopener noreferrer"
  //       underline="hover"
  //       sx={{
  //         color: "text.primary",
  //         fontWeight: 500,
  //         "&:hover": { color: "primary.main" },
  //       }}
  //     >
  //       {row.title}
  //     </Link>
  //   );
  // };

  // Column definitions for DataGrid
  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Name der Förderung",
      flex: 2,
      minWidth: 300,
      renderCell: (params: { row: NormalizedFundingCall }) => {
        const url = params.row.source_url;

        const titleElement = (
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              mb: 0.5,
              color: url ? "primary.main" : "text.primary",
              cursor: url ? "pointer" : "default",
              "&:hover": url ? { textDecoration: "underline" } : {},
            }}
          >
            {params.row.title}
          </Typography>
        );

        return (
          <Box>
            {url ? (
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{ color: "inherit" }}
              >
                {titleElement}
              </Link>
            ) : (
              titleElement
            )}
            {params.row.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.2,
                }}
              >
                {params.row.description}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "deadline",
      headerName: "Antragsfrist",
      flex: 1,
      minWidth: 160,
      renderCell: renderDeadline,
    },
    {
      field: "funding_amount",
      headerName: "Fördersumme",
      flex: 1,
      minWidth: 150,
      renderCell: (params: { row: NormalizedFundingCall }) => {
        const amount = params.row.fundingAmount;
        return amount ? <Typography variant="body2">{amount}</Typography> : "-";
      },
    },
    {
      field: "duration",
      headerName: "Laufzeit",
      flex: 1,
      minWidth: 120,
      renderCell: (params: { row: NormalizedFundingCall }) => {
        const duration = params.row.duration;
        return duration || "-";
      },
    },
    {
      field: "relevance",
      headerName: "Relevanz",
      flex: 1,
      minWidth: 60,
      renderCell: renderRelevance,
    },
  ];

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="error">
          Fehler beim Laden der Daten: {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        height: "98vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevent scrollbars on the container
      }}
    >
      <Paper
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0, // Important for flex child to shrink
        }}
      >
        {/* Header section with fixed height */}
        <Box
          sx={{ p: 2, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6" component="h2">
              Fördermittelausschreibungen
              {usingMockData && (
                <Chip
                  label="Mock-Daten"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyRelevant}
                  onChange={(e) => setShowOnlyRelevant(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">Nur relevante anzeigen</Typography>
              }
              labelPlacement="start"
              sx={{ m: 0 }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {filteredFundingCalls.length} von {fundingCalls.length}{" "}
              Ausschreibungen
            </Typography>

            {/* {showOnlyRelevant && (
              <Chip
                label="Nur relevante"
                size="small"
                color="success"
                variant="outlined"
              />
            )} */}
          </Box>
        </Box>

        {/* DataGrid takes the remaining space */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={filteredFundingCalls}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 }, // Increased default page size for better use of space
              },
            }}
            disableRowSelectionOnClick
            getRowHeight={() => "auto"}
            sx={{
              border: 0,
              height: "100%", // Take full height of parent
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
                minHeight: "80px !important",
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
      </Paper>
    </Box>
  );
}
