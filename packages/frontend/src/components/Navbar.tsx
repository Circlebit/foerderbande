import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tab,
  Tabs,
} from "@mui/material";
import { LogoutOutlined } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useNavigation, type PageType } from "../hooks/useNavigation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { currentPage, navigateTo } = useNavigation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: PageType
  ) => {
    navigateTo(newValue);
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* App Title */}
        <Typography variant="h6" component="div" sx={{ mr: 4 }}>
          fomo - Funding Opportunity Monitor
        </Typography>

        {/* Navigation Tabs */}
        <Box sx={{ flexGrow: 1 }}>
          <Tabs
            value={currentPage}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              "& .MuiTab-root": {
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-selected": {
                  color: "white",
                },
              },
            }}
          >
            <Tab
              label="Ausschreibungen"
              value="funding-calls"
              sx={{ textTransform: "none" }}
            />
            <Tab
              label="Einstellungen"
              value="settings"
              sx={{ textTransform: "none" }}
            />
          </Tabs>
        </Box>

        {/* User Info & Logout */}
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
  );
}
