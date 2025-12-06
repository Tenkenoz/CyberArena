import { useState } from "react";
import { MaterialReactTable } from "material-react-table";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// =========================
// INTERFACES
// =========================
interface Jugador {
  nombre: string;
  cedula: string;
  rol?: string;
  Nombre_invocador: string;
  capitan: boolean;
  idRiot?: string;
}

interface EquipoLoL {
  id: string;
  nombre_equipo: string;
  region_servidor: string;
  logo_url?: string;
  jugador: Jugador;
}

interface EquipoValorant {
  id: string;
  nombre_equipo: string;
  region_servidor: string;
  logo_url?: string;
  jugadores: Jugador[];
}

interface ParticipanteTFT {
  id: string;
  nombre: string;
  cedula: string;
  telefono?: string;
  usuarioTFT: string;
  participoAnterior?: boolean;
}

interface ParticipanteChess {
  id: string;
  nombre: string;
  cedula: string;
  telefono?: string;
  usuarioChess: string;
  participoAnterior?: boolean;
}

interface ParticipanteClash {
  id: string;
  nombre: string;
  cedula: string;
  telefono?: string;
  usuarioClash: string;
  participoAnterior?: boolean;
}

// =========================
// JUEGOS
// =========================
const juegos = [
  "League of Legends",
  "Valorant",
  "Teamfight Tactics",
  "Clash Royale",
  "Chess.com",
];

// =========================
// DATOS DE EJEMPLO
// =========================
const fakeDataLoL: EquipoLoL[] = [
  {
    id: "1",
    nombre_equipo: "Invocadores Pro",
    region_servidor: "LAN",
    jugador: {
      nombre: "Juan Pérez",
      cedula: "1102345678",
      rol: "Mid",
      Nombre_invocador: "JuanMidGod",
      capitan: true,
    },
  },
];

const fakeDataValorant: EquipoValorant[] = [
  {
    id: "2",
    nombre_equipo: "Shooters EC",
    region_servidor: "NA",
    jugadores: [
      {
        nombre: "Carlos Ruiz",
        cedula: "1723456789",
        Nombre_invocador: "HeadshotEC",
        capitan: true,
      },
      // puedes agregar hasta 4 jugadores aquí
    ],
  },
];

const fakeDataTFT: ParticipanteTFT[] = [
  {
    id: "3",
    nombre: "Andrés Silva",
    cedula: "0955544433",
    usuarioTFT: "WolfShooter",
    participoAnterior: true,
  },
];

const fakeDataChess: ParticipanteChess[] = [
  {
    id: "4",
    nombre: "Luis Torres",
    cedula: "1754432211",
    usuarioChess: "CaballoPro",
    participoAnterior: false,
  },
];

const fakeDataClash: ParticipanteClash[] = [
  {
    id: "5",
    nombre: "David Rivas",
    cedula: "0953344556",
    usuarioClash: "RoyaleEC",
    participoAnterior: true,
  },
];

// =========================
// COLUMNAS
// =========================
const columnasLoL = [
  { accessorKey: "nombre_equipo", header: "Equipo" },
  { accessorKey: "region_servidor", header: "Región" },
  {
    accessorFn: (row: EquipoLoL) => row.jugador.Nombre_invocador,
    id: "Nombre_invocador",
    header: "Jugador Invocador",
  },
  {
    accessorFn: (row: EquipoLoL) => row.jugador.nombre,
    id: "nombre",
    header: "Nombre",
  },
  {
    accessorFn: (row: EquipoLoL) => row.jugador.cedula,
    id: "cedula",
    header: "Cédula",
  },
  {
    accessorFn: (row: EquipoLoL) => row.jugador.rol,
    id: "rol",
    header: "Rol",
  },
  {
    accessorFn: (row: EquipoLoL) =>
      row.jugador.capitan ? row.jugador.Nombre_invocador : "",
    id: "capitan",
    header: "Capitán",
  },
];

const columnasValorant = [
  { accessorKey: "nombre_equipo", header: "Equipo" },
  { accessorKey: "region_servidor", header: "Región" },
  {
    accessorFn: (row: EquipoValorant) =>
      row.jugadores.map((j) => j.Nombre_invocador).join(", "),
    id: "jugadores",
    header: "Jugadores",
  },
];

const columnasTFT = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "cedula", header: "Cédula" },
  { accessorKey: "telefono", header: "Teléfono" },
  { accessorKey: "usuarioTFT", header: "Usuario TFT" },
  {
    accessorFn: (row: ParticipanteTFT) => (row.participoAnterior ? "Sí" : "No"),
    id: "participacion",
    header: "Participó antes",
  },
];

const columnasChess = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "cedula", header: "Cédula" },
  { accessorKey: "telefono", header: "Teléfono" },
  { accessorKey: "usuarioChess", header: "Usuario Chess.com" },
  {
    accessorFn: (row: ParticipanteChess) =>
      row.participoAnterior ? "Sí" : "No",
    id: "participacion",
    header: "Participó antes",
  },
];

const columnasClash = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "cedula", header: "Cédula" },
  { accessorKey: "telefono", header: "Teléfono" },
  { accessorKey: "usuarioClash", header: "Usuario Clash Royale" },
  {
    accessorFn: (row: ParticipanteClash) =>
      row.participoAnterior ? "Sí" : "No",
    id: "participacion",
    header: "Participó antes",
  },
];

// =========================
// COMPONENTE PRINCIPAL
// =========================
export const AdminTable = () => {
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(
    "League of Legends"
  );

  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editingRowValues, setEditingRowValues] = useState<any>({});

  const handleJuegoChange = (j: string) => setJuegoSeleccionado(j);

  // columnas y datos según el juego
  const { columnas, datos } = (() => {
    switch (juegoSeleccionado) {
      case "League of Legends":
        return { columnas: columnasLoL, datos: fakeDataLoL };
      case "Valorant":
        return { columnas: columnasValorant, datos: fakeDataValorant };
      case "Teamfight Tactics":
        return { columnas: columnasTFT, datos: fakeDataTFT };
      case "Chess.com":
        return { columnas: columnasChess, datos: fakeDataChess };
      case "Clash Royale":
        return { columnas: columnasClash, datos: fakeDataClash };
      default:
        return { columnas: [], datos: [] };
    }
  })();

  return (
    <Box sx={{ display: "flex" }}>
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 240,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            background: "#111827",
            color: "white",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.4rem",
            borderBottom: "1px solid #374151",
          }}
        >
          Admin Hub
        </Box>
        <List>
          {juegos.map((j) => (
            <ListItem disablePadding key={j}>
              <ListItemButton
                selected={j === juegoSeleccionado}
                onClick={() => handleJuegoChange(j)}
              >
                <ListItemText primary={j} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* CONTENIDO */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <MaterialReactTable<any>
          columns={columnas}
          data={datos}
          enableEditing
          renderRowActions={({ row }) => (
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <Tooltip title="Editar">
                <IconButton
                  onClick={() => {
                    setEditingRow(row.original);
                    setEditingRowValues(row.original);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton
                  color="error"
                  onClick={() => {
                    const index = datos.findIndex(
                      (d) => d.id === row.original.id
                    );
                    if (index > -1) datos.splice(index, 1);
                    setEditingRow(null);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        />

        {/* CREAR NUEVO */}
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button
            variant="contained"
            onClick={() => {
              setEditingRowValues({});
              setEditingRow({});
            }}
          >
            Crear Nuevo
          </Button>
        </Box>
      </Box>

      {/* DIALOGO LO L */}
      {juegoSeleccionado === "League of Legends" && (
        <Dialog
          open={!!editingRow}
          onClose={() => setEditingRow(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {editingRow ? "Editar Registro" : "Crear Nuevo Registro"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Nombre Equipo"
              fullWidth
              margin="normal"
              value={editingRowValues?.nombre_equipo || ""}
              onChange={(e) =>
                setEditingRowValues((prev: any) => ({
                  ...prev,
                  nombre_equipo: e.target.value,
                }))
              }
            />
            <TextField
              label="Región Servidor"
              fullWidth
              margin="normal"
              value={editingRowValues?.region_servidor || ""}
              onChange={(e) =>
                setEditingRowValues((prev: any) => ({
                  ...prev,
                  region_servidor: e.target.value,
                }))
              }
            />
            <TextField
              label="Nombre Jugador"
              fullWidth
              margin="normal"
              value={editingRowValues?.jugador?.nombre || ""}
              onChange={(e) =>
                setEditingRowValues((prev: any) => ({
                  ...prev,
                  jugador: { ...prev.jugador, nombre: e.target.value },
                }))
              }
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};
