import { useState, useEffect, useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
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
  Typography,
  CircularProgress,
  TextField,
  Avatar,
  Chip,
  Card,
  CardContent,
  Stack,
  Divider,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  InputAdornment
} from "@mui/material";
// Iconos
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import BadgeIcon from "@mui/icons-material/Badge";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";

import { toast } from "sonner";

// =========================
// INTERFACES
// =========================
interface GenericRow {
  _id: string;
  [key: string]: any;
}

const ROLES_LOL = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

// =========================
// CONFIGURACIÓN DE JUEGOS
// =========================
const juegosConfig = {
  "League of Legends": { 
    id: "lol", 
    api: "http://localhost:4000/api/lol",
    deleteUpdateUrl: (id: string) => `http://localhost:4000/api/lol/${id}`,
    type: "team",
    color: "#00b0f4" 
  },
  "Valorant": { 
    id: "valorant", 
    api: "http://localhost:4000/api/valorant",
    deleteUpdateUrl: (id: string) => `http://localhost:4000/api/valorant/${id}`,
    type: "team",
    color: "#ff4655"
  },
  "Teamfight Tactics": { 
    id: "tft", 
    api: "http://localhost:4000/api/tft/inscritos", 
    deleteUpdateUrl: (id: string) => `http://localhost:4000/api/tft/inscritos/${id}`,
    type: "individual",
    color: "#f5a623"
  },
  "Chess.com": { 
    id: "chess", 
    api: "http://localhost:4000/api/chess/inscritos", 
    deleteUpdateUrl: (id: string) => `http://localhost:4000/api/chess/inscritos/${id}`,
    type: "individual",
    color: "#7fa650"
  },
  "Clash Royale": { 
    id: "clash-royale", 
    api: "http://localhost:4000/api/clash-royale/inscritos", 
    deleteUpdateUrl: (id: string) => `http://localhost:4000/api/clash-royale/inscritos/${id}`,
    type: "individual",
    color: "#4a8df8"
  },
};

const listaJuegos = Object.keys(juegosConfig);

export const AdminTable = () => {
  // --- ESTADO DE AUTENTICACIÓN ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCreds, setAuthCreds] = useState({ user: '', pass: '' });
  const [authError, setAuthError] = useState(false);

  const [juegoSeleccionado, setJuegoSeleccionado] = useState("League of Legends");
  const [data, setData] = useState<GenericRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para Edición
  const [editingRow, setEditingRow] = useState<GenericRow | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Estado para visualización de imagen
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Helper para imágenes
  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:4000/${path.replace(/\\/g, "/")}`;
  };

  // =========================
  // UTILIDAD: LIMPIAR DATOS ANTES DE ENVIAR
  // =========================
  const cleanDataBeforeSend = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(cleanDataBeforeSend);
    } else if (data !== null && typeof data === 'object') {
        const newObj: any = {};
        for (const key in data) {
            if (key !== '_id' && key !== '__v' && key !== 'fechaRegistro') {
                newObj[key] = cleanDataBeforeSend(data[key]);
            }
        }
        return newObj;
    }
    return data;
  };

  // =========================
  // LOGIN HANDLER
  // =========================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCreds.user === 'admin' && authCreds.pass === '123') {
        setIsAuthenticated(true);
        toast.success("Bienvenido Administrador");
    } else {
        setAuthError(true);
        toast.error("Credenciales incorrectas");
    }
  };

  // =========================
  // 1. CARGAR DATOS
  // =========================
  const fetchData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const config = juegosConfig[juegoSeleccionado as keyof typeof juegosConfig];
    
    try {
      const res = await fetch(config.api);
      const result = await res.json();
      let finalData = [];
      
      if (Array.isArray(result)) finalData = result;
      else if (result.data && Array.isArray(result.data)) finalData = result.data;
      else if (result.ok && result.data) finalData = result.data;
      
      setData(finalData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error de conexión con la API");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchData();
    }
  }, [juegoSeleccionado, isAuthenticated]);

  // =========================
  // 2. ELIMINAR
  // =========================
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ ¿Estás seguro? Esta acción eliminará el registro permanentemente.")) return;

    const config = juegosConfig[juegoSeleccionado as keyof typeof juegosConfig];
    const url = config.deleteUpdateUrl(id);

    try {
        const res = await fetch(url, { method: 'DELETE' });
        if (res.ok) {
            toast.success("Registro eliminado correctamente");
            fetchData();
        } else {
            const errData = await res.json().catch(() => ({}));
            toast.error(errData.msg || "Error al eliminar el registro");
        }
    } catch (error) {
        toast.error("Error de red al eliminar");
    }
  };

  // =========================
  // 3. EDITAR
  // =========================
  
  const handleEditChange = (field: string, value: any) => {
    setEditingRow((prev) => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handlePlayerChange = (index: number, field: string, value: string) => {
    setEditingRow((prev: any) => {
        const currentPlayers = Array.isArray(prev.jugadores) ? [...prev.jugadores] : [];
        if (!currentPlayers[index]) currentPlayers[index] = {};
        currentPlayers[index] = { ...currentPlayers[index], [field]: value };
        return { ...prev, jugadores: currentPlayers };
    });
  };

  const handleStaffChange = (type: 'suplente' | 'coach', field: string, value: string) => {
    setEditingRow((prev: any) => ({
        ...prev,
        [type]: { 
            ...(prev[type] || {}),
            [field]: value 
        }
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingRow) return;
    
    const config = juegosConfig[juegoSeleccionado as keyof typeof juegosConfig];
    const url = config.deleteUpdateUrl(editingRow._id);
    const bodyToSend = cleanDataBeforeSend(editingRow);

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyToSend)
        });

        const result = await res.json();

        if (res.ok) {
            toast.success("Datos actualizados correctamente");
            setOpenEditModal(false);
            setEditingRow(null);
            fetchData();
        } else {
            console.error("Error backend:", result);
            toast.error(result.msg || result.message || "Error al actualizar en servidor");
        }
    } catch (error) {
        console.error("Error red:", error);
        toast.error("Error de conexión al guardar cambios");
    }
  };

  // =========================
  // 4. COLUMNAS
  // =========================
  const columns = useMemo<MRT_ColumnDef<GenericRow>[]>(() => {
    const config = juegosConfig[juegoSeleccionado as keyof typeof juegosConfig];
    const themeColor = config.color;

    if (config.type === "team") {
      return [
        {
            accessorKey: "logoURL",
            header: "Logo",
            size: 80,
            enableEditing: false,
            Cell: ({ cell }) => (
                <Tooltip title="Click para ver imagen completa">
                    <IconButton 
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(getImageUrl(cell.getValue<string>()));
                        }}
                        sx={{ p: 0 }}
                    >
                        <Avatar 
                            src={getImageUrl(cell.getValue<string>())} 
                            alt="Logo" 
                            variant="rounded" 
                            sx={{ width: 45, height: 45, border: `2px solid ${themeColor}`, bgcolor: '#1f2937', cursor: 'pointer' }}
                        >
                            {(cell.row.original.nombreEquipo as string)?.[0]}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            ),
        },
        { 
            accessorKey: "nombreEquipo", 
            header: "Equipo",
            Cell: ({ cell }) => <Typography fontWeight="bold" color="text.primary">{cell.getValue<string>()}</Typography>
        },
        { 
            accessorKey: "capitan", 
            header: "Capitán",
            Cell: ({ row }) => (
                <Box>
                    <Typography variant="body2" fontWeight="bold">{row.original.capitan}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {row.original.nombreInvocadorTeam || row.original.riotIdMain}
                    </Typography>
                </Box>
            )
        },
        { 
            accessorKey: "regionServidor", 
            header: "Región",
            size: 100,
            Cell: ({ cell }) => <Chip label={cell.getValue<string>()} size="small" sx={{ bgcolor: `${themeColor}20`, color: themeColor, fontWeight: 'bold' }} />
        },
        { 
            accessorKey: "numeroContacto", 
            header: "Contacto",
            Cell: ({ cell }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                    <Typography variant="body2">{cell.getValue<string>()}</Typography>
                </Box>
            )
        },
      ];
    } else {
      return [
        { accessorKey: "nombre", header: "Participante", size: 200,
          Cell: ({ cell }) => <Typography fontWeight="bold">{cell.getValue<string>()}</Typography> 
        },
        { accessorKey: "cedula", header: "Cédula" },
        { accessorKey: "telefono", header: "Teléfono" },
        { accessorKey: "nombreUsuario", header: "Nick / ID Juego" },
        { 
            accessorKey: "participadoTorneo", 
            header: "Veterano",
            Cell: ({ cell }) => (
                <Chip 
                    label={cell.getValue() === 'si' ? "Sí" : "No"} 
                    color={cell.getValue() === 'si' ? "success" : "default"} 
                    size="small" 
                    variant="outlined"
                />
            )
        },
      ];
    }
  }, [juegoSeleccionado]);

  // Determinar si el juego actual es de equipos
  const isTeamGame = juegosConfig[juegoSeleccionado as keyof typeof juegosConfig].type === "team";

  // =========================
  // RENDER: LOGIN
  // =========================
  if (!isAuthenticated) {
    return (
        <Box sx={{ height: "100vh", bgcolor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)" }}>
            <Paper elevation={10} sx={{ p: 5, borderRadius: 4, width: '100%', maxWidth: 400, bgcolor: '#1e293b', color: 'white' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar sx={{ bgcolor: '#3b82f6', mx: 'auto', mb: 2, width: 56, height: 56 }}><LockIcon fontSize="large" /></Avatar>
                    <Typography variant="h5" fontWeight="bold">Cyber Arena Admin</Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Ingresa tus credenciales</Typography>
                </Box>
                <form onSubmit={handleLogin}>
                    <TextField 
                        fullWidth label="Usuario" variant="outlined" margin="normal"
                        value={authCreds.user} onChange={(e) => setAuthCreds({...authCreds, user: e.target.value})} error={authError}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><AccountCircleIcon sx={{ color: '#94a3b8' }} /></InputAdornment>), sx: { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } } }}
                        InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    />
                    <TextField 
                        fullWidth label="Contraseña" type="password" variant="outlined" margin="normal"
                        value={authCreds.pass} onChange={(e) => setAuthCreds({...authCreds, pass: e.target.value})} error={authError}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon sx={{ color: '#94a3b8' }} /></InputAdornment>), sx: { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } } }}
                        InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    />
                    <Button type="submit" fullWidth variant="contained" size="large" startIcon={<LoginIcon />} sx={{ mt: 3, mb: 2, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>Ingresar</Button>
                </form>
            </Paper>
        </Box>
    );
  }

  // =========================
  // RENDER: DASHBOARD
  // =========================
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 260,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 260, boxSizing: "border-box", background: "#0f172a", color: "#e2e8f0", borderRight: "1px solid #1e293b" },
        }}
      >
        <Box sx={{ p: 4, textAlign: "center", borderBottom: "1px solid #1e293b" }}>
          <Box sx={{ display:'inline-flex', p:1, borderRadius:'50%', bgcolor:'#3b82f6', mb:1 }}><EmojiEventsIcon sx={{ color:'white' }} /></Box>
          <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 1 }}>CYBER ARENA</Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Admin Dashboard</Typography>
        </Box>
        <List sx={{ pt: 2 }}>
          {listaJuegos.map((j) => {
             const isSelected = j === juegoSeleccionado;
             const config = juegosConfig[j as keyof typeof juegosConfig];
             return (
                <ListItem disablePadding key={j} sx={{ mb: 1, px: 2 }}>
                <ListItemButton selected={isSelected} onClick={() => setJuegoSeleccionado(j)} sx={{ borderRadius: 2, transition: 'all 0.2s', bgcolor: isSelected ? `${config.color}20` : 'transparent', borderLeft: isSelected ? `4px solid ${config.color}` : '4px solid transparent', '&:hover': { bgcolor: '#1e293b' } }}>
                    <ListItemText primary={j} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? config.color : 'inherit' }} />
                </ListItemButton>
                </ListItem>
             );
          })}
        </List>
        <Box sx={{ mt: 'auto', p: 2, borderTop: "1px solid #1e293b" }}>
            <Button fullWidth variant="outlined" color="error" onClick={() => setIsAuthenticated(false)} startIcon={<LoginIcon sx={{ transform: 'rotate(180deg)' }} />}>Cerrar Sesión</Button>
        </Box>
      </Drawer>

      {/* CONTENIDO */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: "#f1f5f9", overflow: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Box>
                <Typography variant="h4" fontWeight="bold" color="#0f172a">{juegoSeleccionado}</Typography>
                <Typography variant="body2" color="text.secondary">Gestión de inscripciones</Typography>
            </Box>
            <Button startIcon={<RefreshIcon />} variant="contained" onClick={fetchData} sx={{ bgcolor: '#3b82f6', textTransform: 'none', borderRadius: 2 }}>Recargar</Button>
        </Box>

        {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress size={50} /></Box>
        ) : (
            <MaterialReactTable
                columns={columns}
                data={data}
                enableEditing
                getRowId={(row) => row._id}
                muiTablePaperProps={{ elevation: 0, sx: { borderRadius: '12px', border: '1px solid #cbd5e1', overflow: 'hidden' } }}
                muiTableHeadCellProps={{ sx: { bgcolor: '#f8fafc', fontWeight: 'bold', color: '#475569' } }}
                enableRowActions
                renderRowActions={({ row }) => (
                    <Box sx={{ display: "flex", gap: "0.5rem" }}>
                        <Tooltip title="Editar Todo">
                            <IconButton onClick={() => { setEditingRow({ ...row.original }); setOpenEditModal(true); }} size="small" sx={{ color: '#0ea5e9', bgcolor: '#e0f2fe' }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <IconButton onClick={() => handleDelete(row.original._id)} size="small" sx={{ color: '#ef4444', bgcolor: '#fee2e2' }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                
                // --- AQUI ESTÁ LA LÓGICA: SOLO MOSTRAR DETALLE SI ES EQUIPO ---
                renderDetailPanel={isTeamGame ? ({ row }) => (
                    <Box sx={{ p: 3, bgcolor: "#f8fafc", borderTop: '1px solid #e2e8f0' }}>
                        <Typography variant="h6" sx={{ mb: 2, display:'flex', alignItems:'center', gap:1, color:'#334155' }}>
                            <BadgeIcon /> Detalles del Equipo
                        </Typography>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                            <Box sx={{ minWidth: 250 }}>
                                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold">LÍDER / CAPITÁN</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">{row.original.capitan}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {row.original.nombreInvocadorTeam || row.original.riotIdMain}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Divider sx={{ my: 2 }} />
                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <PhoneIcon fontSize="small" color="action" />
                                                <Typography variant="body2">{row.original.numeroContacto}</Typography>
                                            </Box>
                                            {row.original.rolLider && (
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <SportsEsportsIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">Rol: <strong>{row.original.rolLider}</strong></Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                            {row.original.jugadores && row.original.jugadores.length > 0 && (
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, color:'#64748b' }}>ALINEACIÓN TITULAR</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                                        {row.original.jugadores.map((p: any, idx: number) => (
                                            <Card key={idx} variant="outlined" sx={{ borderRadius: 2, bgcolor: 'white' }}>
                                                <CardContent sx={{ p: '12px !important' }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" color="primary">{p.nombreInvocador || p.riotId}</Typography>
                                                    <Typography variant="caption" display="block" color="text.primary">{p.nombre}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{p.cedula}</Typography>
                                                    {p.rol && <Chip label={p.rol} size="small" sx={{ mt: 1, height: 20, fontSize: '0.65rem' }} />}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                ) : undefined} // <-- ESTO DESACTIVA EL PANEL EN INDIVIDUALES
            />
        )}

        {/* Modales (Imagen y Edición) - Se mantienen igual */}
        <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md">
            <DialogContent sx={{ p: 0, bgcolor: 'black', display: 'flex', justifyContent: 'center' }}>
                <img src={previewImage || ""} alt="Full Size" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
            </DialogContent>
        </Dialog>

        <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="md">
            <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>Editar: {editingRow?.nombreEquipo || editingRow?.nombre}</DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {editingRow && (
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        {isTeamGame ? (
                            <>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <TextField label="Nombre del Equipo" value={editingRow.nombreEquipo || ''} onChange={(e) => handleEditChange('nombreEquipo', e.target.value)} fullWidth />
                                    <TextField label="Región" value={editingRow.regionServidor || ''} onChange={(e) => handleEditChange('regionServidor', e.target.value)} fullWidth />
                                    <TextField label="Capitán (Nombre Real)" value={editingRow.capitan || ''} onChange={(e) => handleEditChange('capitan', e.target.value)} fullWidth />
                                    <TextField label="Contacto" value={editingRow.numeroContacto || ''} onChange={(e) => handleEditChange('numeroContacto', e.target.value)} fullWidth />
                                    <TextField label={juegoSeleccionado === "Valorant" ? "Riot ID Capitán" : "Invocador Capitán"} value={editingRow.riotIdMain || editingRow.nombreInvocadorTeam || ''} onChange={(e) => handleEditChange(juegoSeleccionado === "Valorant" ? 'riotIdMain' : 'nombreInvocadorTeam', e.target.value)} fullWidth />
                                    {juegoSeleccionado === "League of Legends" && <TextField label="Rol Líder" value={editingRow.rolLider || ''} onChange={(e) => handleEditChange('rolLider', e.target.value)} select fullWidth>{ROLES_LOL.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}</TextField>}
                                </Box>
                                <Divider>ALINEACIÓN</Divider>
                                {editingRow.jugadores?.map((p: any, idx: number) => (
                                    <Accordion key={idx} variant="outlined">
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2">Jugador {idx + 1}: {p.nombreInvocador || p.riotId || "Sin Nombre"}</Typography></AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                                <TextField label="Nombre Real" value={p.nombre || ''} onChange={(e) => handlePlayerChange(idx, 'nombre', e.target.value)} size="small" />
                                                <TextField label="Cédula" value={p.cedula || ''} onChange={(e) => handlePlayerChange(idx, 'cedula', e.target.value)} size="small" />
                                                <TextField label={juegoSeleccionado === "Valorant" ? "Riot ID" : "Invocador"} value={p.riotId || p.nombreInvocador || ''} onChange={(e) => handlePlayerChange(idx, juegoSeleccionado === "Valorant" ? 'riotId' : 'nombreInvocador', e.target.value)} size="small" />
                                                {juegoSeleccionado === "League of Legends" && <TextField label="Rol" value={p.rol || ''} onChange={(e) => handlePlayerChange(idx, 'rol', e.target.value)} size="small" select>{ROLES_LOL.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}</TextField>}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                                <Divider>STAFF</Divider>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    {['suplente', 'coach'].map((type) => (
                                        <Card key={type} variant="outlined">
                                            <CardContent sx={{ pb: '16px !important' }}>
                                                <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>{type}</Typography>
                                                <Stack spacing={2} sx={{ mt: 1 }}>
                                                    <TextField label="Nombre" value={editingRow[type]?.nombre || ''} onChange={(e) => handleStaffChange(type as any, 'nombre', e.target.value)} size="small" fullWidth />
                                                    <TextField label={juegoSeleccionado === "Valorant" ? "Riot ID" : "Nick"} value={editingRow[type]?.riotId || editingRow[type]?.nombreInvocador || ''} onChange={(e) => handleStaffChange(type as any, juegoSeleccionado === "Valorant" ? 'riotId' : 'nombreInvocador', e.target.value)} size="small" fullWidth />
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <TextField label="Nombre Completo" value={editingRow.nombre || ''} onChange={(e) => handleEditChange('nombre', e.target.value)} fullWidth />
                                <TextField label="Cédula" value={editingRow.cedula || ''} onChange={(e) => handleEditChange('cedula', e.target.value)} fullWidth />
                                <TextField label="Teléfono" value={editingRow.telefono || ''} onChange={(e) => handleEditChange('telefono', e.target.value)} fullWidth />
                                <TextField label="Usuario del Juego" value={editingRow.nombreUsuario || ''} onChange={(e) => handleEditChange('nombreUsuario', e.target.value)} fullWidth />
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={() => setOpenEditModal(false)} startIcon={<CancelIcon />} color="inherit">Cancelar</Button>
                <Button onClick={handleSaveEdit} variant="contained" startIcon={<SaveIcon />}>Guardar Todo</Button>
            </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};