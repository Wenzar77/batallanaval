import { Box, Stack, IconButton, Tooltip } from "@mui/material";
import GppGoodIcon from "@mui/icons-material/GppGood"; // impacto
import WaterDropIcon from "@mui/icons-material/WaterDrop"; // fallo
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat"; // hundido
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import { useSound } from "../sound/SoundProvider";
import type { Snapshot } from "../types/game";

export function SoundTest({ snapshot }: { snapshot: Snapshot | null }) {
  const { play, isMuted, toggleMute } = useSound();

  const gameStarted =
    snapshot?.state === "active" ||
    snapshot?.state === "finished_A" ||
    snapshot?.state === "finished_B";

  if (gameStarted) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1300,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ bgcolor: "background.paper", p: 1, borderRadius: 2, boxShadow: 3 }}>
        <Tooltip title="Probar HIT">
          <IconButton
            color="success"
            onClick={() => play("hit")}
            aria-label="Probar impacto"
          >
            <GppGoodIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Probar MISS">
          <IconButton
            color="primary"
            onClick={() => play("miss")}
            aria-label="Probar fallo"
          >
            <WaterDropIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Probar SINK">
          <IconButton
            color="info"
            onClick={() => play("sink")}
            aria-label="Probar hundido"
          >
            <DirectionsBoatIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={isMuted ? "Activar sonidos" : "Silenciar sonidos"}>
          <IconButton
            color="inherit"
            onClick={toggleMute}
            aria-label="Toggle sonido"
          >
            {isMuted ? (
              <NotificationsOffOutlinedIcon />
            ) : (
              <NotificationsActiveOutlinedIcon />
            )}
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
