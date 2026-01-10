import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CreditCard, Upload, User, Phone, IdCard, Gamepad2, Copy, CheckCircle2, Shield, Users, Mail, AlertCircle, Trophy, Monitor, FileText } from 'lucide-react';

// CORRECCIÓN: Usamos la ruta estática a la carpeta public.
// Asegúrate de que el archivo 'reglamento.pdf' esté dentro de la carpeta 'public' de tu proyecto.
const reglamento = '/reglamento.pdf';

// --- VALIDACIONES DE ECUADOR ---
const validarCedulaEcuador = (cedula: string): boolean => {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;
  const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
  let suma = 0;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  for (let i = 0; i < coeficientes.length; i++) {
    let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }
  const residuo = suma % 10;
  let resultado = (residuo === 0) ? 0 : (10 - residuo);
  return resultado === digitoVerificador;
};

const PHONE_REGEX = /^(09\d{8}|0[2-8]\d{7})$/;
const NAME_REGEX = /^[A-Za-zÑñÁáÉéÍíÓóÚúüÜ\s]{2,}$/;
const SUMMONER_NAME_REGEX = /^[A-Za-z0-9\s]{3,16}#[A-Za-z0-9]{3,5}$/; // Formato más estricto si se desea, o el simple

// --- CONFIG API ---
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

interface PlayerData {
  nombre: string;
  rol: string;
  cedula: string;
  nombreInvocador: string;
}

interface TeamData {
  nombreEquipo: string;
  regionServidor: string;
  logoEquipo: File | null; // CORREGIDO: Ahora es File, no string
  capitan: string;
  rolLider: string;
  numeroContacto: string;
  nombreInvocador: string;
}

const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

export const LeagueOfLegendsForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estado del equipo
  const [teamData, setTeamData] = useState<TeamData>({
    nombreEquipo: '',
    regionServidor: '',
    logoEquipo: null,
    capitan: '',
    rolLider: '',
    numeroContacto: '',
    nombreInvocador: '',
  });

  const [players, setPlayers] = useState<PlayerData[]>(
    Array.from({ length: 4 }).map(() => ({ nombre: '', rol: '', cedula: '', nombreInvocador: '' }))
  );

  const [suplente, setSuplente] = useState<PlayerData>({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
  const [coach, setCoach] = useState<PlayerData>({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
  const [showSuplente, setShowSuplente] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [participadoTorneo, setParticipadoTorneo] = useState<string>('');
  const [aceptaReglas, setAceptaReglas] = useState(false);
  
  const [yaDeposito, setYaDeposito] = useState(false);
  const [comprobante, setComprobante] = useState<File | null>(null); // CORREGIDO: File | null

  // --- UTILIDADES ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const updatePlayer = (index: number, field: keyof PlayerData, value: string) => {
    setPlayers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // --- MANEJO DE ARCHIVOS (ARCHIVOS REALES) ---
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast.error('Logo: Solo se permiten imágenes JPG o PNG.');
            e.target.value = '';
            setTeamData(prev => ({ ...prev, logoEquipo: null }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error('Logo: La imagen es muy pesada (Máx 5MB).');
            e.target.value = '';
            setTeamData(prev => ({ ...prev, logoEquipo: null }));
            return;
        }
        // Guardamos el archivo real
        setTeamData(prev => ({ ...prev, logoEquipo: file }));
    }
  };

  const handleComprobanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast.error('Comprobante: Solo se permiten imágenes JPG o PNG.');
            e.target.value = '';
            setComprobante(null);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Comprobante: La imagen es muy pesada (Máx 5MB).');
            e.target.value = '';
            setComprobante(null);
            return;
        }
        // Guardamos el archivo real
        setComprobante(file);
    }
  };

  // --- VALIDACIONES ---
  const validatePlayerFields = (data: { nombre: string, cedula: string, nombreInvocador: string }, prefix: string): boolean => {
    const nombreLimpio = data.nombre.trim();
    const cedulaLimpia = data.cedula.trim();
    const invocadorLimpio = data.nombreInvocador.trim();

    if (!nombreLimpio || !NAME_REGEX.test(nombreLimpio)) {
      toast.error(`[${prefix}] Nombre inválido (solo letras).`);
      return false;
    }
    if (cedulaLimpia && !validarCedulaEcuador(cedulaLimpia)) {
      toast.error(`[${prefix}] Cédula ecuatoriana inválida.`);
      return false;
    }
    if (!invocadorLimpio || invocadorLimpio.length < 3) {
        toast.error(`[${prefix}] Nombre de invocador inválido.`);
        return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!teamData.nombreEquipo.trim()) return toast.error('Falta nombre del equipo') && false;
    if (!teamData.regionServidor.trim()) return toast.error('Falta región') && false;
    
    // Validar Capitán
    if (!NAME_REGEX.test(teamData.capitan.trim())) return toast.error('Nombre del Capitán inválido (solo letras)') && false;
    if (!teamData.rolLider) return toast.error('Falta rol del Capitán') && false;
    
    const contacto = teamData.numeroContacto.replace(/\s/g, '');
    if (!PHONE_REGEX.test(contacto)) return toast.error('Teléfono de contacto inválido (10 dígitos)') && false;
    
    // Validación básica de invocador del capitán (puede mejorarse con SUMMONER_NAME_REGEX si se desea estricto)
    if (!teamData.nombreInvocador.trim()) return toast.error('Falta el invocador del Capitán') && false;

    // Validar Jugadores
    for (let i = 0; i < players.length; i++) {
        if (!players[i].rol) return toast.error(`Falta rol Jugador ${i+1}`) && false;
        if (!players[i].cedula) return toast.error(`Falta cédula Jugador ${i+1}`) && false;
        if (!validatePlayerFields(players[i], `Jugador ${i+1}`)) return false;
    }

    // Roles únicos
    const teamRoles = [teamData.rolLider, ...players.map(p => p.rol)].filter(Boolean);
    if (new Set(teamRoles).size !== teamRoles.length) return toast.error('Roles repetidos en el equipo titular.') && false;

    // Opcionales
    if (showSuplente && (suplente.nombre || suplente.cedula)) {
       if(!validatePlayerFields(suplente, 'Suplente')) return false;
    }
    if (showCoach && (coach.nombre || coach.cedula)) {
        if (!coach.nombre.trim() || !coach.cedula.trim()) return toast.error('Coach requiere Nombre y Cédula') && false;
        // Para coach el invocador no es estricto si no juega, pero validamos campos básicos
        if (!NAME_REGEX.test(coach.nombre.trim())) return toast.error('Nombre del Coach inválido') && false;
        if (!validarCedulaEcuador(coach.cedula.trim())) return toast.error('Cédula del Coach inválida') && false;
    }

    // Generales
    if (!participadoTorneo) return toast.error('Responde la encuesta de participación.') && false;
    if (yaDeposito && !comprobante) return toast.error('Debes subir el comprobante.') && false;
    if (!aceptaReglas) return toast.error('Debes aceptar los términos y condiciones.') && false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Preparar datos de TEXTO
      const payload = {
        nombreEquipo: teamData.nombreEquipo,
        regionServidor: teamData.regionServidor,
        // NO enviamos el logo aquí en el JSON, va aparte en el formData
        capitan: teamData.capitan,
        rolLider: teamData.rolLider,
        nombreInvocadorTeam: teamData.nombreInvocador,
        numeroContacto: teamData.numeroContacto,
        
        jugadores: players,
        suplente: showSuplente ? suplente : null,
        coach: showCoach ? coach : null,
        
        participadoTorneo,
        aceptaReglas,
        pagoRealizado: yaDeposito
        // NO enviamos el comprobante aquí en el JSON
      };

      // 2. Construir FormData (Multipart)
      const formData = new FormData();
      
      // Adjuntar JSON stringificado en el campo 'datos'
      formData.append('datos', JSON.stringify(payload));

      // Adjuntar archivos si existen
      if (teamData.logoEquipo) {
        formData.append('logoEquipo', teamData.logoEquipo);
      }
      if (yaDeposito && comprobante) {
        formData.append('comprobante', comprobante);
      }

      // 3. Enviar al Backend (Sin Content-Type manual para que el navegador ponga el boundary)
      const res = await fetch(`${API_BASE_URL}/api/lol/inscripcion`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.msg || 'Error al enviar la inscripción');
        setLoading(false);
        return;
      }

      toast.success('¡Inscripción Exitosa!');
      
      // Resetear
      setTeamData({ nombreEquipo: '', regionServidor: '', logoEquipo: null, capitan: '', rolLider: '', numeroContacto: '', nombreInvocador: '' });
      setPlayers(Array(4).fill({ nombre: '', rol: '', cedula: '', nombreInvocador: '' }));
      setSuplente({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
      setCoach({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
      setShowSuplente(false);
      setShowCoach(false);
      setParticipadoTorneo('');
      setAceptaReglas(false);
      setYaDeposito(false);
      setComprobante(null);
      
      onClose();

    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[75vh] overflow-y-auto pr-3 pl-1">
      
      {/* SECCIÓN 1: DATOS DEL EQUIPO */}
      <div className="space-y-5">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2 border-b border-border pb-2">
          <Shield className="w-5 h-5" /> Datos del Equipo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="nombreEquipo">Nombre del Equipo</Label>
            <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombreEquipo"
                  value={teamData.nombreEquipo}
                  onChange={(e) => setTeamData({ ...teamData, nombreEquipo: e.target.value })}
                  required disabled={loading} className="pl-9" placeholder="Ej: T1 Faker"
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regionServidor">Región</Label>
            <Input
              id="regionServidor"
              value={teamData.regionServidor}
              onChange={(e) => setTeamData({ ...teamData, regionServidor: e.target.value })}
              placeholder="Ej: LAN, LAS"
              required disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoEquipo">Logo (Opcional)</Label>
            <div className="flex items-center gap-2">
                <Input
                  id="logoEquipo" type="file" accept="image/png, image/jpeg, image/jpg"
                  onChange={handleLogoChange}
                  disabled={loading}
                  className="cursor-pointer file:text-primary"
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capitan">Capitán (Nombre Real)</Label>
            <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="capitan"
                  value={teamData.capitan}
                  onChange={(e) => setTeamData({ ...teamData, capitan: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                  required disabled={loading} className="pl-9"
                />
            </div>
          </div>

           <div className="space-y-2">
            <Label htmlFor="rolLider">Rol del Capitán</Label>
            <select
              id="rolLider"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={teamData.rolLider}
              onChange={(e) => setTeamData({ ...teamData, rolLider: e.target.value })}
              required disabled={loading}
            >
              <option value="">Seleccionar...</option>
              {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroContacto">Teléfono de Contacto</Label>
            <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="numeroContacto" type="tel" maxLength={10}
                  value={teamData.numeroContacto}
                  onChange={(e) => setTeamData({ ...teamData, numeroContacto: e.target.value.replace(/\D/g, '') })}
                  required disabled={loading} className="pl-9" placeholder="09..."
                />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nombreInvocadorTeam">Invocador Capitán (LoL)</Label>
            <div className="relative">
                <Gamepad2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombreInvocadorTeam"
                  value={teamData.nombreInvocador}
                  onChange={(e) => setTeamData({ ...teamData, nombreInvocador: e.target.value })}
                  required disabled={loading} className="pl-9" placeholder="Nombre#TAG"
                />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: JUGADORES */}
      <div className="space-y-5">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Alineación Titular
        </h3>
        
        {players.map((player, index) => (
          <div key={index} className="p-4 bg-muted/20 rounded-lg border border-border space-y-3">
            <h4 className="font-semibold text-sm uppercase text-muted-foreground">Jugador {index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nombre Real</Label>
                <Input
                  value={player.nombre}
                  onChange={(e) => updatePlayer(index, 'nombre', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  required disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rol</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={player.rol}
                  onChange={(e) => updatePlayer(index, 'rol', e.target.value)}
                  required disabled={loading}
                >
                  <option value="">Seleccionar...</option>
                  {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cédula</Label>
                <Input
                  type="tel" maxLength={10}
                  value={player.cedula}
                  onChange={(e) => updatePlayer(index, 'cedula', e.target.value.replace(/\D/g, ''))}
                  required disabled={loading} placeholder="10 dígitos"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nombre de Invocador</Label>
                <Input
                  value={player.nombreInvocador}
                  onChange={(e) => updatePlayer(index, 'nombreInvocador', e.target.value)}
                  required disabled={loading}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN 3: STAFF */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-primary border-b border-border pb-2">Staff & Suplentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                    <Checkbox id="showSuplente" checked={showSuplente} onCheckedChange={(c) => setShowSuplente(!!c)} disabled={loading} />
                    <Label htmlFor="showSuplente" className="cursor-pointer">Suplente</Label>
                </div>
                {showSuplente && (
                    <div className="space-y-2 animate-in fade-in">
                        <Input placeholder="Nombre" value={suplente.nombre} onChange={(e) => setSuplente({...suplente, nombre: e.target.value})} disabled={loading} />
                        <Input placeholder="Cédula" maxLength={10} value={suplente.cedula} onChange={(e) => setSuplente({...suplente, cedula: e.target.value.replace(/\D/g, '')})} disabled={loading} />
                        <Input placeholder="Invocador" value={suplente.nombreInvocador} onChange={(e) => setSuplente({...suplente, nombreInvocador: e.target.value})} disabled={loading} />
                        <select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={suplente.rol} onChange={(e) => setSuplente({...suplente, rol: e.target.value})} disabled={loading}>
                            <option value="">Rol</option>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                    <Checkbox id="showCoach" checked={showCoach} onCheckedChange={(c) => setShowCoach(!!c)} disabled={loading} />
                    <Label htmlFor="showCoach" className="cursor-pointer">Coach</Label>
                </div>
                {showCoach && (
                    <div className="space-y-2 animate-in fade-in">
                        <Input placeholder="Nombre" value={coach.nombre} onChange={(e) => setCoach({...coach, nombre: e.target.value})} disabled={loading} />
                        <Input placeholder="Cédula" maxLength={10} value={coach.cedula} onChange={(e) => setCoach({...coach, cedula: e.target.value.replace(/\D/g, '')})} disabled={loading} />
                        <Input placeholder="Invocador (Opcional)" value={coach.nombreInvocador} onChange={(e) => setCoach({...coach, nombreInvocador: e.target.value})} disabled={loading} />
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* SECCIÓN 4: PAGO (DISEÑO SENCILLO) */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2 border-b border-border pb-2">
            <CreditCard className="w-5 h-5" /> Información de Pago
        </h3>
        
        <div className="bg-muted/30 p-5 rounded-lg border border-border/60">
            <h4 className="font-bold text-lg text-primary mb-3">Banco Pichincha</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-foreground">
                <div><span className="block text-muted-foreground text-xs font-bold uppercase">Titular</span> José Sanmartín</div>
                <div><span className="block text-muted-foreground text-xs font-bold uppercase">C.I.</span> 1727585729</div>
                <div>
                    <span className="block text-muted-foreground text-xs font-bold uppercase">Cuenta Ahorros</span>
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => copyToClipboard('2206570945')}>
                        <span className="font-mono font-bold text-base">2206570945</span>
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                    </div>
                </div>
                <div className="sm:col-span-2"><span className="block text-muted-foreground text-xs font-bold uppercase">Email</span> josesanmartin1999@hotmail.com</div>
            </div>
        </div>

        <div className="pt-2">
            <div className="flex items-center space-x-3 mb-4 p-3 bg-background rounded-md border border-input">
                <Checkbox id="yaDeposito" checked={yaDeposito} onCheckedChange={(c) => setYaDeposito(!!c)} disabled={loading} />
                <div className="grid gap-0.5 leading-none">
                    <Label htmlFor="yaDeposito" className="text-sm font-semibold cursor-pointer">Ya realicé la transferencia</Label>
                    <p className="text-xs text-muted-foreground">Marca esta casilla para adjuntar tu comprobante.</p>
                </div>
            </div>

            {yaDeposito && (
                <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-muted/20 rounded-lg border border-border/50">
                    <Label className="text-sm font-medium mb-2 block">Comprobante de Pago</Label>
                    <div className="flex items-center gap-3">
                        <Input type="file" accept="image/*" onChange={handleComprobanteChange} disabled={loading} className="cursor-pointer bg-background file:text-primary file:font-medium" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Formatos: JPG, PNG. Máximo 5MB.</p>
                </div>
            )}
        </div>
      </div>

      {/* INFORMACIÓN ADICIONAL */}
      <div className="space-y-6 pt-6 border-t border-border">
        <div className="space-y-3">
             <Label className="text-base font-semibold">¿Han participado en otro torneo?</Label>
             <RadioGroup value={participadoTorneo} onValueChange={setParticipadoTorneo} className="flex gap-6" disabled={loading}>
               <div className="flex items-center space-x-2"><RadioGroupItem value="si" id="t-si" /><Label htmlFor="t-si">Sí</Label></div>
               <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="t-no" /><Label htmlFor="t-no">No</Label></div>
             </RadioGroup>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Checkbox id="aceptaReglas" checked={aceptaReglas} onCheckedChange={(c) => setAceptaReglas(!!c)} required disabled={loading} className="mt-0.5" />
            <Label htmlFor="aceptaReglas" className="cursor-pointer text-sm leading-snug">
              He leído y acepto las <a href={reglamento} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">reglas del torneo</a> (Términos y Condiciones).
            </Label>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 text-base" disabled={loading}>Cancelar</Button>
        <Button 
            type="submit" 
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-base shadow-lg shadow-indigo-500/20" 
            disabled={loading}
        >
          {loading ? 'Enviando...' : 'Confirmar Inscripción'}
        </Button>
      </div>
    </form>
  );
};