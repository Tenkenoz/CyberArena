import { useState, useEffect, useMemo, useRef } from "react";
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
  Paper,
  InputAdornment,
  FormControlLabel,
  Switch,
  useTheme,
  useMediaQuery
} from "@mui/material";
// Iconos
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhoneIcon from "@mui/icons-material/Phone";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import BadgeIcon from "@mui/icons-material/Badge";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import ImageIcon from "@mui/icons-material/Image";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import StarIcon from "@mui/icons-material/Star";
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"; // Nuevo icono para eliminar logo

import { toast } from "sonner";

// =========================
// CONFIGURACIÓN DE API
// =========================
const getApiUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'http://localhost:4000';
};

const API_BASE_URL = getApiUrl();

// =========================
// INTERFACES
// =========================
interface GenericRow {
  _id: string;
  [key: string]: any;
}

const ROLES_LOL = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

const ROLE_COLORS: Record<string, string> = {
    'Top': '#ef4444',
    'Jungle': '#22c55e',
    'Mid': '#a855f7',
    'ADC': '#3b82f6',
    'Support': '#f97316'
};

// =========================
// CONFIGURACIÓN DE JUEGOS
// =========================
const juegosConfig = {
  "League of Legends": { 
    id: "lol", 
    api: `${API_BASE_URL}/api/lol`,
    deleteUpdateUrl: (id: string) => `${API_BASE_URL}/api/lol/${id}`,
    type: "team",
    color: "#00b0f4" 
  },
  "Valorant": { 
    id: "valorant", 
    api: `${API_BASE_URL}/api/valorant`,
    deleteUpdateUrl: (id: string) => `${API_BASE_URL}/api/valorant/${id}`,
    type: "team",
    color: "#ff4655"
  },
  "Teamfight Tactics": { 
    id: "tft", 
    api: `${API_BASE_URL}/api/tft/inscritos`, 
    deleteUpdateUrl: (id: string) => `${API_BASE_URL}/api/tft/inscritos/${id}`,
    type: "individual",
    color: "#f5a623"
  },
  "Chess.com": { 
    id: "chess", 
    api: `${API_BASE_URL}/api/chess/inscritos`, 
    deleteUpdateUrl: (id: string) => `${API_BASE_URL}/api/chess/inscritos/${id}`,
    type: "individual",
    color: "#7fa650"
  },
  "Clash Royale": { 
    id: "clash-royale", 
    api: `${API_BASE_URL}/api/clash-royale/inscritos`, 
    deleteUpdateUrl: (id: string) => `${API_BASE_URL}/api/clash-royale/inscritos/${id}`,
    type: "individual",
    color: "#4a8df8"
  },
};

const listaJuegos = Object.keys(juegosConfig);

export const AdminTable = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCreds, setAuthCreds] = useState({ user: '', pass: '' });
  const [authError, setAuthError] = useState(false);

  const [juegoSeleccionado, setJuegoSeleccionado] = useState("League of Legends");
  const [data, setData] = useState<GenericRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editingRow, setEditingRow] = useState<GenericRow | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Estados para archivos nuevos
  const [newLogoBase64, setNewLogoBase64] = useState<string | null>(null);
  const [newComprobanteBase64, setNewComprobanteBase64] = useState<string | null>(null);
  
  // Referencia para el input de logo
  const logoInputRef = useRef<HTMLInputElement>(null);

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("data:image")) return path;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}/${path.replace(/\\/g, "/")}`;
  };

  const getLogoUrl = (row: GenericRow): string => {
    // Si hay un nuevo logo seleccionado
    if (newLogoBase64 && editingRow && row._id === editingRow._id) {
      return newLogoBase64;
    }
    
    // Si el logo está en Base64
    if (row.logoURL && row.logoURL.startsWith("data:image")) {
      return row.logoURL;
    }
    
    // Si el logo es una URL
    if (row.logoURL && row.logoURL.startsWith("http")) {
      return row.logoURL;
    }
    
    // Si el logo es una ruta relativa
    if (row.logoURL) {
      return getImageUrl(row.logoURL);
    }
    
    return "";
  };

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

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // =========================
  // HANDLERS
  // =========================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCreds.user === 'admin' && authCreds.pass === 'OpenHub2025!') {
        setIsAuthenticated(true);
        toast.success("Bienvenido Administrador");
    } else {
        setAuthError(true);
        toast.error("Credenciales incorrectas");
    }
  };

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

  const handleOpenEdit = (row: GenericRow) => {
      const rowCopy = JSON.parse(JSON.stringify(row));
      
      if (juegosConfig[juegoSeleccionado as keyof typeof juegosConfig].type === "team") {
          if (!rowCopy.jugadores) rowCopy.jugadores = [];
          while (rowCopy.jugadores.length < 4) {
              rowCopy.jugadores.push({ nombre: "", cedula: "", rol: "", nombreInvocador: "", riotId: "" });
          }
          if (!rowCopy.suplente) rowCopy.suplente = { nombre: "", cedula: "", rol: "", nombreInvocador: "", riotId: "" };
          if (!rowCopy.coach) rowCopy.coach = { nombre: "", cedula: "", rol: "", nombreInvocador: "", riotId: "" };
      }
      
      setEditingRow(rowCopy);
      setNewLogoBase64(null);
      setNewComprobanteBase64(null);
      setOpenEditModal(true);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditingRow((prev) => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'comprobante') => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validar tamaño máximo (2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB en bytes
      if (file.size > maxSize) {
          toast.error("La imagen es muy grande. Máximo 2MB");
          return;
      }
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
          toast.error("Formato no válido. Use JPG, PNG, WebP o GIF");
          return;
      }
      
      try {
          const base64 = await convertToBase64(file);
          if (type === 'logo') {
              setNewLogoBase64(base64);
              toast.success("Logo cargado correctamente");
          } else {
              setNewComprobanteBase64(base64);
              toast.info("Comprobante cargado (Guarda para confirmar)");
          }
      } catch (err) {
          console.error("Error al procesar la imagen:", err);
          toast.error("Error al procesar la imagen");
      }
  };

  const handleRemoveLogo = () => {
    setNewLogoBase64(null);
    if (editingRow) {
      handleEditChange('logoURL', '');
    }
    toast.info("Logo eliminado (Guarda para confirmar)");
  };

  const handlePlayerChange = (index: number, field: string, value: string) => {
    setEditingRow((prev: any) => {
        const currentPlayers = [...(prev.jugadores || [])];
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
    const dataToSend = cleanDataBeforeSend(editingRow);

    // Actualizar logo si hay uno nuevo
    if (newLogoBase64) {
      dataToSend.logoURL = newLogoBase64;
    } else if (editingRow.logoURL === '') {
      // Si se eliminó el logo explícitamente
      dataToSend.logoURL = '';
    }

    // Actualizar comprobante si hay uno nuevo
    if (newComprobanteBase64) {
      dataToSend.comprobantePago = newComprobanteBase64;
    }

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });

        const result = await res.json();

        if (res.ok) {
            toast.success("Cambios guardados exitosamente");
            setOpenEditModal(false);
            setEditingRow(null);
            setNewLogoBase64(null);
            setNewComprobanteBase64(null);
            fetchData();
        } else {
            console.error("Error backend:", result);
            toast.error(result.msg || "Error al guardar cambios");
        }
    } catch (error) {
        console.error("Error red:", error);
        toast.error("Error de conexión");
    }
  };

  // =========================
  // COLUMNAS
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
            Cell: ({ cell, row }) => {
              const logoUrl = getLogoUrl(row.original);
              return (
                <Tooltip title={logoUrl ? "Ver logo" : "Sin logo"}>
                    <IconButton 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (logoUrl) {
                                setPreviewImage(logoUrl);
                            }
                        }}
                        sx={{ p: 0 }}
                    >
                        <Avatar 
                            src={logoUrl} 
                            alt="Logo" 
                            variant="rounded" 
                            sx={{ 
                              width: 45, 
                              height: 45, 
                              border: `2px solid ${logoUrl ? themeColor : '#64748b'}`, 
                              bgcolor: logoUrl ? 'transparent' : '#1f2937',
                              opacity: logoUrl ? 1 : 0.5
                            }}
                        >
                            {!logoUrl && (row.original.nombreEquipo as string)?.[0]}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            );
            },
        },
        { 
            accessorKey: "nombreEquipo", 
            header: "Equipo",
            Cell: ({ cell }) => <Typography fontWeight="bold" color="text.primary">{cell.getValue<string>()}</Typography>
        },
        { 
            accessorKey: "capitan", 
            header: "Capitán",
            Cell: ({ row }) => {
                return (
                    <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {row.original.capitan} <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {row.original.nombreInvocadorTeam || row.original.riotIdMain}
                        </Typography>
                    </Box>
                )
            }
        },
        {
            accessorKey: "pagoRealizado",
            header: "Pago",
            size: 100,
            Cell: ({ cell }) => (
                <Chip
                    label={cell.getValue() ? "PAGADO" : "PENDIENTE"}
                    color={cell.getValue() ? "success" : "warning"}
                    size="small"
                    variant="filled"
                    sx={{ fontWeight: 'bold', minWidth: 80 }}
                />
            )
        },
        {
            accessorKey: "comprobantePago",
            header: "Comprobante",
            size: 100,
            enableEditing: false,
            Cell: ({ cell }) => cell.getValue() ? (
                <Tooltip title="Ver Comprobante">
                    <IconButton 
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(getImageUrl(cell.getValue<string>()));
                        }}
                    >
                        <ImageIcon />
                    </IconButton>
                </Tooltip>
            ) : <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>Sin archivo</Typography>
        },
        { 
            accessorKey: "regionServidor", 
            header: "Región",
            size: 100,
            Cell: ({ cell }) => <Chip label={cell.getValue<string>()} size="small" sx={{ bgcolor: `${themeColor}20`, color: themeColor, fontWeight: 'bold' }} />
        },
        { 
            accessorKey: "numeroContacto", 
            header: "Teléfono",
            Cell: ({ cell }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
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
        {
            accessorKey: "pagoRealizado",
            header: "Pago",
            size: 100,
            Cell: ({ cell }) => (
                <Chip
                    label={cell.getValue() ? "PAGADO" : "PENDIENTE"}
                    color={cell.getValue() ? "success" : "warning"}
                    size="small"
                    variant="filled"
                    sx={{ fontWeight: 'bold', minWidth: 80 }}
                />
            )
        },
        {
            accessorKey: "comprobantePago",
            header: "Comprobante",
            size: 100,
            enableEditing: false,
            Cell: ({ cell }) => cell.getValue() ? (
                <Tooltip title="Ver Comprobante">
                    <IconButton 
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(getImageUrl(cell.getValue<string>()));
                        }}
                    >
                        <ImageIcon />
                    </IconButton>
                </Tooltip>
            ) : <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>Sin archivo</Typography>
        },
      ];
    }
  }, [juegoSeleccionado, newLogoBase64]);

  const isTeamGame = juegosConfig[juegoSeleccionado as keyof typeof juegosConfig].type === "team";

  if (!isAuthenticated) {
    return (
        <Box sx={{ height: "100vh", bgcolor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper elevation={10} sx={{ p: 5, borderRadius: 4, width: '100%', maxWidth: 400, bgcolor: '#1e293b', color: 'white' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar sx={{ bgcolor: '#3b82f6', mx: 'auto', mb: 2 }}><LockIcon /></Avatar>
                    <Typography variant="h5" fontWeight="bold">Admin Panel</Typography>
                </Box>
                <form onSubmit={handleLogin}>
                    <TextField fullWidth label="Usuario" variant="outlined" margin="normal" value={authCreds.user} onChange={(e) => setAuthCreds({...authCreds, user: e.target.value})} error={authError} InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: '#94a3b8' } }} />
                    <TextField fullWidth label="Contraseña" type="password" variant="outlined" margin="normal" value={authCreds.pass} onChange={(e) => setAuthCreds({...authCreds, pass: e.target.value})} error={authError} InputProps={{ sx: { color: 'white' } }} InputLabelProps={{ sx: { color: '#94a3b8' } }} />
                    <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, bgcolor: '#3b82f6' }}>Ingresar</Button>
                </form>
            </Paper>
        </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Drawer variant="permanent" anchor="left" sx={{ width: 260, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 260, boxSizing: "border-box", background: "#0f172a", color: "#e2e8f0" } }}>
        <Box sx={{ p: 4, textAlign: "center", borderBottom: "1px solid #1e293b" }}>
          <Typography variant="h6" fontWeight="bold">CYBER ARENA</Typography>
        </Box>
        <List sx={{ pt: 2 }}>
          {listaJuegos.map((j) => {
             const isSelected = j === juegoSeleccionado;
             const config = juegosConfig[j as keyof typeof juegosConfig];
             return (
                <ListItem disablePadding key={j}>
                <ListItemButton selected={isSelected} onClick={() => setJuegoSeleccionado(j)} sx={{ bgcolor: isSelected ? `${config.color}20` : 'transparent', borderLeft: isSelected ? `4px solid ${config.color}` : '4px solid transparent' }}>
                    <ListItemText primary={j} sx={{ color: isSelected ? config.color : 'inherit' }} />
                </ListItemButton>
                </ListItem>
             );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: "#f1f5f9", overflow: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="#0f172a">{juegoSeleccionado}</Typography>
            <Button startIcon={<RefreshIcon />} variant="contained" onClick={fetchData}>Recargar</Button>
        </Box>

        {isLoading ? (
            <CircularProgress />
        ) : (
            <MaterialReactTable
                columns={columns}
                data={data}
                enableEditing
                getRowId={(row) => row._id}
                enableRowActions
                renderRowActions={({ row }) => (
                    <Box sx={{ display: "flex", gap: "0.5rem" }}>
                        <Tooltip title="Editar">
                            <IconButton onClick={() => handleOpenEdit(row.original)} color="primary"><EditIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <IconButton onClick={() => handleDelete(row.original._id)} color="error"><DeleteIcon /></IconButton>
                        </Tooltip>
                    </Box>
                )}
                renderDetailPanel={isTeamGame ? ({ row }) => {
                    const isLoL = juegoSeleccionado === "League of Legends";
                    
                    const capitanName = row.original.capitan;
                    const capitanIgn = isLoL ? row.original.nombreInvocadorTeam : row.original.riotIdMain;
                    const capitanRol = isLoL ? row.original.rolLider : "CAPITÁN";
                    const capitanColor = isLoL && ROLE_COLORS[capitanRol] ? ROLE_COLORS[capitanRol] : '#f59e0b';

                    return (
                        <Box sx={{ p: 2, bgcolor: "#f8fafc" }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight:'bold', color: 'primary.main', display:'flex', alignItems:'center', gap:1 }}>
                                <GroupsIcon fontSize="small" /> ALINEACIÓN TITULAR (5 JUGADORES)
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                                
                                <Paper elevation={0} variant="outlined" sx={{ p: 1.5, display:'flex', alignItems:'center', gap: 1.5, bgcolor: '#fffbeb', borderColor: '#fcd34d', minWidth: 180, position: 'relative' }}>
                                    <Chip 
                                        label="CAPITÁN" 
                                        size="small" 
                                        icon={<MilitaryTechIcon sx={{ '&&': { color: 'white' } }} />}
                                        sx={{ position: 'absolute', top: -10, right: -5, height: 20, fontSize: '0.65rem', fontWeight: 'bold', bgcolor: '#f59e0b', color: 'white', border: '1px solid white' }} 
                                    />
                                    <Avatar sx={{ width: 40, height: 40, bgcolor: capitanColor, fontWeight: 'bold', border: '2px solid white', boxShadow: 1 }}>
                                        {capitanRol[0]}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2, color: '#b45309' }}>
                                            {capitanIgn || 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1, fontWeight: 'bold' }}>
                                            {capitanRol}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                            {capitanName}
                                        </Typography>
                                    </Box>
                                </Paper>

                                {row.original.jugadores?.map((p: any, i: number) => {
                                    const roleColor = isLoL && p.rol ? ROLE_COLORS[p.rol] : '#64748b';
                                    return (
                                        <Paper key={i} elevation={0} variant="outlined" sx={{ p: 1.5, display:'flex', alignItems:'center', gap: 1.5, bgcolor: 'white', minWidth: 180 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: roleColor, fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {p.rol ? p.rol[0] : (p.nombre?.[0] || '?')}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                                    {p.nombreInvocador || p.riotId || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                                                    {p.rol || 'Jugador'}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                                    {p.nombre}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        </Box>
                    );
                } : undefined}
            />
        )}

        {/* MODAL DE IMAGEN */}
        <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md">
            <DialogContent sx={{ p: 0, bgcolor: 'black', display: 'flex', justifyContent: 'center' }}>
                <img src={previewImage || ""} alt="Full Size" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
            </DialogContent>
        </Dialog>

        {/* MODAL DE EDICIÓN */}
        <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="lg">
            <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon color="primary" />
                Editar Registro: {editingRow?.nombreEquipo || editingRow?.nombre}
            </DialogTitle>
            <DialogContent sx={{ pt: 3, pb: 4, bgcolor: '#f8fafc' }}>
                {editingRow && (
                    <Stack spacing={4}>
                        
                        {/* 1. SECCIÓN PAGO */}
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f0fdf4', borderColor: '#86efac', display: 'flex', flexDirection: {xs: 'column', md: 'row'}, alignItems: 'center', justifyContent: 'space-between', gap: 2, borderRadius: 2 }}>
                            <Box>
                                <Typography variant="h6" color="success.main" fontWeight="bold" sx={{ display:'flex', alignItems:'center', gap:1 }}>
                                    <MonetizationOnIcon /> GESTIÓN DE PAGO
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Verificar estado y comprobante.</Typography>
                            </Box>
                            
                            <Stack direction="row" spacing={3} alignItems="center">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={editingRow.pagoRealizado || false}
                                            onChange={(e) => handleEditChange('pagoRealizado', e.target.checked)}
                                            color="success"
                                            size="medium"
                                        />
                                    }
                                    label={<Chip label={editingRow.pagoRealizado ? "PAGO VERIFICADO" : "PAGO PENDIENTE"} color={editingRow.pagoRealizado ? "success" : "error"} variant="filled" sx={{ fontWeight: 'bold', minWidth: 120 }} />}
                                />
                                <Divider orientation="vertical" flexItem />
                                <Stack direction="row" spacing={1}>
                                    <Button component="label" variant="outlined" size="small" startIcon={<CloudUploadIcon />}>
                                        {newComprobanteBase64 ? "Nuevo (Listo)" : "Cambiar"}
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleFileSelect(e, 'comprobante')} />
                                    </Button>
                                    {(newComprobanteBase64 || editingRow.comprobantePago) ? (
                                        <Button variant="contained" color="inherit" size="small" startIcon={<ImageIcon />} onClick={() => setPreviewImage(newComprobanteBase64 || getImageUrl(editingRow.comprobantePago))} sx={{ bgcolor: 'white', color: 'text.primary', border: '1px solid #e5e7eb' }}>Ver</Button>
                                    ) : <Chip label="Sin archivo" size="small" variant="outlined" color="warning" />}
                                </Stack>
                            </Stack>
                        </Paper>

                        {isTeamGame ? (
                            <>
                                {/* 2. DATOS DEL EQUIPO - MEJORADO CON GESTIÓN DE LOGO */}
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                                        <BadgeIcon color="primary" /> Información del Equipo
                                    </Typography>
                                    
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                                        <TextField 
                                            label="Nombre del Equipo" 
                                            value={editingRow.nombreEquipo || ''} 
                                            onChange={(e) => handleEditChange('nombreEquipo', e.target.value)} 
                                            fullWidth 
                                            variant="outlined" 
                                        />
                                        <TextField 
                                            label="Región" 
                                            value={editingRow.regionServidor || ''} 
                                            onChange={(e) => handleEditChange('regionServidor', e.target.value)} 
                                            fullWidth 
                                            variant="outlined" 
                                        />
                                        
                                        {/* SECCIÓN DE LOGO MEJORADA */}
                                        <Box sx={{ 
                                            gridColumn: { md: 'span 1' },
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            gap: 2,
                                            p: 2, 
                                            border: '2px dashed #cbd5e1', 
                                            borderRadius: 2,
                                            bgcolor: '#f8fafc'
                                        }}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                                LOGO DEL EQUIPO
                                            </Typography>
                                            
                                            {/* PREVIEW DEL LOGO */}
                                            <Box sx={{ position: 'relative' }}>
                                                <Avatar 
                                                    src={newLogoBase64 || getImageUrl(editingRow.logoURL)} 
                                                    alt="Logo Preview" 
                                                    variant="rounded"
                                                    sx={{ 
                                                        width: 80, 
                                                        height: 80, 
                                                        border: '3px solid #e2e8f0',
                                                        bgcolor: '#1f2937'
                                                    }}
                                                >
                                                    {editingRow.nombreEquipo?.[0]}
                                                </Avatar>
                                                
                                                {/* BOTÓN PARA ELIMINAR LOGO */}
                                                {(newLogoBase64 || editingRow.logoURL) && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={handleRemoveLogo}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -8,
                                                            right: -8,
                                                            bgcolor: 'error.main',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'error.dark' },
                                                            border: '2px solid white'
                                                        }}
                                                    >
                                                        <DeleteForeverIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Box>
                                            
                                            {/* BOTONES DE ACCIÓN */}
                                            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                                                <Button 
                                                    component="label" 
                                                    variant="contained" 
                                                    size="small" 
                                                    startIcon={<CloudUploadIcon />}
                                                    fullWidth
                                                >
                                                    {newLogoBase64 ? "Reemplazar" : "Subir Logo"}
                                                    <input 
                                                        ref={logoInputRef}
                                                        type="file" 
                                                        hidden 
                                                        accept="image/*" 
                                                        onChange={(e) => handleFileSelect(e, 'logo')} 
                                                    />
                                                </Button>
                                                
                                                {(newLogoBase64 || editingRow.logoURL) && (
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small" 
                                                        startIcon={<ImageIcon />} 
                                                        onClick={() => setPreviewImage(newLogoBase64 || getImageUrl(editingRow.logoURL))}
                                                    >
                                                        Ver
                                                    </Button>
                                                )}
                                            </Stack>
                                            
                                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                                                Formatos: JPG, PNG, WebP, GIF (Máx. 2MB)
                                            </Typography>
                                        </Box>

                                        {/* SECCIÓN CAPITÁN */}
                                        <Box sx={{ gridColumn: { md: 'span 3' }, bgcolor: '#fff7ed', p: 2, borderRadius: 2, border: '1px solid #fdba74' }}>
                                            <Typography variant="subtitle2" color="warning.main" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <StarIcon /> DATOS DEL CAPITÁN (LÍDER DEL EQUIPO)
                                            </Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                                                
                                                <TextField 
                                                    label={juegoSeleccionado === "Valorant" ? "Alias / Nick (Capitán)" : "Nombre Real (Capitán)"} 
                                                    value={editingRow.capitan || ''} 
                                                    onChange={(e) => handleEditChange('capitan', e.target.value)} 
                                                    fullWidth variant="outlined" size="small" 
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end"><StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} /></InputAdornment>
                                                    }}
                                                />

                                                {juegoSeleccionado === "Valorant" ? (
                                                     <TextField 
                                                        label="Nombre Real (Capitán)" 
                                                        value={editingRow.nombreJugador || ''} 
                                                        onChange={(e) => handleEditChange('nombreJugador', e.target.value)} 
                                                        fullWidth variant="outlined" size="small" 
                                                    />
                                                ) : (
                                                    <TextField label="Rol del Capitán" value={editingRow.rolLider || ''} onChange={(e) => handleEditChange('rolLider', e.target.value)} select fullWidth variant="outlined" size="small">
                                                        {ROLES_LOL.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                                    </TextField>
                                                )}

                                                <TextField 
                                                    label={juegoSeleccionado === "Valorant" ? "Riot ID (Capitán)" : "Invocador (Capitán)"} 
                                                    value={editingRow.riotIdMain || editingRow.nombreInvocadorTeam || ''} 
                                                    onChange={(e) => handleEditChange(juegoSeleccionado === "Valorant" ? 'riotIdMain' : 'nombreInvocadorTeam', e.target.value)} 
                                                    fullWidth variant="outlined" size="small" 
                                                />
                                            </Box>
                                            
                                            <Box sx={{ mt: 2 }}>
                                                <TextField 
                                                    label="Teléfono / Contacto del Capitán" 
                                                    value={editingRow.numeroContacto || ''} 
                                                    onChange={(e) => handleEditChange('numeroContacto', e.target.value)} 
                                                    fullWidth variant="outlined" size="small" 
                                                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>

                                {/* 3. ALINEACIÓN */}
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                                        <GroupsIcon color="primary" /> Alineación (Jugadores)
                                    </Typography>
                                    <Stack spacing={2}>
                                        {editingRow.jugadores?.map((p: any, idx: number) => (
                                            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, p: 2, bgcolor: '#fff', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                                                <Typography sx={{ display: { md: 'none' }, fontWeight: 'bold' }}>Jugador {idx + 1}</Typography>
                                                <TextField label="Nombre Real" value={p.nombre || ''} onChange={(e) => handlePlayerChange(idx, 'nombre', e.target.value)} size="small" fullWidth />
                                                <TextField label="Cédula" value={p.cedula || ''} onChange={(e) => handlePlayerChange(idx, 'cedula', e.target.value)} size="small" fullWidth />
                                                <TextField label={juegoSeleccionado === "Valorant" ? "Riot ID" : "Invocador"} value={p.riotId || p.nombreInvocador || ''} onChange={(e) => handlePlayerChange(idx, juegoSeleccionado === "Valorant" ? 'riotId' : 'nombreInvocador', e.target.value)} size="small" fullWidth />
                                                {juegoSeleccionado === "League of Legends" && (
                                                    <TextField label="Rol" value={p.rol || ''} onChange={(e) => handlePlayerChange(idx, 'rol', e.target.value)} size="small" select fullWidth>
                                                        {ROLES_LOL.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                                    </TextField>
                                                )}
                                            </Box>
                                        ))}
                                    </Stack>
                                </Paper>

                                {/* 4. STAFF */}
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                                        <AdminPanelSettingsIcon color="primary" /> Staff & Suplentes
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                        {['suplente', 'coach'].map((type) => (
                                            <Card key={type} variant="outlined" sx={{ bgcolor: type === 'coach' ? '#fff7ed' : '#f0f9ff' }}>
                                                <CardContent>
                                                    <Typography variant="overline" fontWeight="900" sx={{ color: type === 'coach' ? 'warning.main' : 'info.main', fontSize: '0.85rem' }}>
                                                        {type.toUpperCase()}
                                                    </Typography>
                                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                                        <TextField label="Nombre Completo" value={editingRow[type]?.nombre || ''} onChange={(e) => handleStaffChange(type as any, 'nombre', e.target.value)} size="small" fullWidth />
                                                        <TextField label="Cédula" value={editingRow[type]?.cedula || ''} onChange={(e) => handleStaffChange(type as any, 'cedula', e.target.value)} size="small" fullWidth />
                                                        <TextField label={juegoSeleccionado === "Valorant" ? "Riot ID" : "Invocador"} value={editingRow[type]?.riotId || editingRow[type]?.nombreInvocador || ''} onChange={(e) => handleStaffChange(type as any, juegoSeleccionado === "Valorant" ? 'riotId' : 'nombreInvocador', e.target.value)} size="small" fullWidth />
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </Paper>
                            </>
                        ) : (
                            // FORMULARIO INDIVIDUAL
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="primary" /> Datos del Participante
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                    <TextField label="Nombre Completo" value={editingRow.nombre || ''} onChange={(e) => handleEditChange('nombre', e.target.value)} fullWidth variant="outlined" />
                                    <TextField label="Usuario del Juego / Nick" value={editingRow.nombreUsuario || ''} onChange={(e) => handleEditChange('nombreUsuario', e.target.value)} fullWidth variant="outlined" />
                                    <TextField label="Cédula de Identidad" value={editingRow.cedula || ''} onChange={(e) => handleEditChange('cedula', e.target.value)} fullWidth variant="outlined" />
                                    <TextField label="Teléfono de Contacto" value={editingRow.telefono || ''} onChange={(e) => handleEditChange('telefono', e.target.value)} fullWidth variant="outlined" />
                                </Box>
                            </Paper>
                        )}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={() => setOpenEditModal(false)} startIcon={<CancelIcon />} color="inherit" size="large" sx={{ mr: 2 }}>Cancelar</Button>
                <Button onClick={handleSaveEdit} variant="contained" startIcon={<SaveIcon />} size="large" sx={{ px: 5, borderRadius: 2 }}>Guardar Cambios</Button>
            </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};