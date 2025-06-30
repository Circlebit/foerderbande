import { Box, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import { LogoutOutlined } from "@mui/icons-material";
import FundingCallsGrid from "./components/FundingCallsGrid";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Header with user info and logout */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              fomo - Funding Opportunity Monitor
            </Typography>

            {user && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {user.email}
                </Typography>
                <IconButton
                  color="inherit"
                  onClick={handleSignOut}
                  title="Abmelden"
                  size="small"
                >
                  <LogoutOutlined />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Main content area */}
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <FundingCallsGrid />
        </Box>
      </Box>
    </ProtectedRoute>
  );
}

export default App;
