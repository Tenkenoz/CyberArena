import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface PlayerData {
  nombre: string;
  rol: string;
  cedula: string;
  nombreInvocador: string;
}

interface TeamData {
  nombreEquipo: string;
  regionServidor: string;
  logoEquipo: File | null;
  capitan: string;
  rolLider: string;
  numeroContacto: string;
  nombreInvocador: string;
}

const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

export const LeagueOfLegendsForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formKey, setFormKey] = useState(0);

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
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTeamData({
      nombreEquipo: '',
      regionServidor: '',
      logoEquipo: null,
      capitan: '',
      rolLider: '',
      numeroContacto: '',
      nombreInvocador: '',
    });
    setPlayers(Array.from({ length: 4 }).map(() => ({ nombre: '', rol: '', cedula: '', nombreInvocador: '' })));
    setSuplente({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
    setCoach({ nombre: '', rol: '', cedula: '', nombreInvocador: '' });
    setShowSuplente(false);
    setShowCoach(false);
    setParticipadoTorneo('');
    setAceptaReglas(false);
    setFormKey(prev => prev + 1);
  };

  const updatePlayer = (index: number, field: keyof PlayerData, value: string) => {
    setPlayers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setTeamData(prev => ({ ...prev, logoEquipo: file }));
  };

  // --- LÓGICA DE VALIDACIÓN ---
  const validateForm = () => {
    // 1. Validar campos básicos del equipo y capitán
    if (!teamData.nombreEquipo.trim()) {
      toast.error('Ingresa el nombre del equipo');
      return false;
    }
    if (!teamData.capitan.trim()) {
      toast.error('Ingresa el nombre del capitán');
      return false;
    }
    if (!teamData.rolLider) {
      toast.error('Selecciona el rol del Capitán/Líder');
      return false;
    }
    if (!teamData.nombreInvocador.trim()) {
      toast.error('Ingresa el nombre de invocador del capitán');
      return false;
    }
    
    // 2. Validar que los 4 jugadores tengan todos sus datos
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p.nombre.trim() || !p.rol || !p.cedula.trim() || !p.nombreInvocador.trim()) {
        toast.error(`Completa todos los datos del Jugador ${i + 1}`);
        return false;
      }
    }

    // 3. VALIDACIÓN DE ROLES ÚNICOS (La parte importante)
    // Creamos una lista con el rol del capitán + los roles de los 4 jugadores
    const teamRoles = [];
    if (teamData.rolLider) teamRoles.push(teamData.rolLider);
    players.forEach(p => {
        if (p.rol) teamRoles.push(p.rol);
    });

    // Usamos un 'Set' para contar cuántos roles únicos hay
    const uniqueRoles = new Set(teamRoles);

    // Si el tamaño del Set es menor que la lista, significa que hay repetidos
    if (uniqueRoles.size !== teamRoles.length) {
        toast.error('No se pueden repetir roles en el equipo titular (Capitán + 4 Jugadores). Cada posición (Top, Jungle, Mid, ADC, Support) debe ser única.');
        return false;
    }

    if (!aceptaReglas) {
      toast.error('Debes aceptar las reglas del torneo');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        nombreEquipo: teamData.nombreEquipo,
        regionServidor: teamData.regionServidor,
        capitan: teamData.capitan,
        rolLider: teamData.rolLider,
        nombreInvocadorTeam: teamData.nombreInvocador, // Mapeado
        numeroContacto: teamData.numeroContacto,
        
        jugadores: players,
        suplente: showSuplente ? suplente : null,
        coach: showCoach ? coach : null,
        participadoTorneo: participadoTorneo,
        aceptaReglas: aceptaReglas
      };

      const formData = new FormData();
      formData.append('datos', JSON.stringify(payload));

      if (teamData.logoEquipo) {
        formData.append('logoEquipo', teamData.logoEquipo);
      }

      const res = await fetch('http://localhost:4000/api/lol/inscripcion', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.msg || 'Error al enviar los datos');
        setLoading(false);
        return;
      }

      toast.success('¡Registro de Equipo LoL Exitoso!');
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión con la API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
      {/* Datos del equipo */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Datos del Equipo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombreEquipo">Nombre del Equipo</Label>
            <Input
              id="nombreEquipo"
              value={teamData.nombreEquipo}
              onChange={(e) => setTeamData({ ...teamData, nombreEquipo: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regionServidor">Región/Servidor</Label>
            <Input
              id="regionServidor"
              value={teamData.regionServidor}
              onChange={(e) => setTeamData({ ...teamData, regionServidor: e.target.value })}
              placeholder="LAN, LAS, NA, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoEquipo">Logo del Equipo</Label>
            <Input
              id="logoEquipo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded file:px-2 file:mr-2"
            />
          </div>

          {/* DATOS DEL CAPITÁN */}
          <div className="space-y-2">
            <Label htmlFor="capitan">Capitán del Equipo (Nombre Real)</Label>
            <Input
              id="capitan"
              value={teamData.capitan}
              onChange={(e) => setTeamData({ ...teamData, capitan: e.target.value })}
              required
            />
          </div>

           {/* ROL DEL LÍDER */}
           <div className="space-y-2">
            <Label htmlFor="rolLider">Rol del Capitán</Label>
            <select
              id="rolLider"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={teamData.rolLider}
              onChange={(e) => setTeamData({ ...teamData, rolLider: e.target.value })}
              required
            >
              <option value="">Seleccionar rol</option>
              {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroContacto">Número de Contacto</Label>
            <Input
              id="numeroContacto"
              type="tel"
              value={teamData.numeroContacto}
              onChange={(e) => setTeamData({ ...teamData, numeroContacto: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nombreInvocadorTeam">Nombre de Invocador (Cuenta LoL)</Label>
            <Input
              id="nombreInvocadorTeam"
              value={teamData.nombreInvocador}
              onChange={(e) => setTeamData({ ...teamData, nombreInvocador: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      {/* Jugadores */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Compañeros de Equipo (4)
        </h3>
        <p className="text-sm text-muted-foreground">Ingresa los datos de los otros 4 integrantes.</p>

        {players.map((player, index) => (
          <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Jugador {index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`player-nombre-${index}`}>Nombre</Label>
                <Input
                  id={`player-nombre-${index}`}
                  value={player.nombre}
                  onChange={(e) => updatePlayer(index, 'nombre', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`player-rol-${index}`}>Rol</Label>
                <select
                  id={`player-rol-${index}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={player.rol}
                  onChange={(e) => updatePlayer(index, 'rol', e.target.value)}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`player-cedula-${index}`}>Cédula</Label>
                <Input
                  id={`player-cedula-${index}`}
                  value={player.cedula}
                  onChange={(e) => updatePlayer(index, 'cedula', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`player-invocador-${index}`}>Nombre de Invocador</Label>
                <Input
                  id={`player-invocador-${index}`}
                  value={player.nombreInvocador}
                  onChange={(e) => updatePlayer(index, 'nombreInvocador', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suplente y Coach */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="showSuplente"
            checked={showSuplente}
            onCheckedChange={(checked) => setShowSuplente(Boolean(checked))}
          />
          <Label htmlFor="showSuplente" className="cursor-pointer">Agregar Suplente (Opcional)</Label>
        </div>

        {showSuplente && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Suplente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="suplente-nombre">Nombre</Label>
                <Input
                  id="suplente-nombre"
                  value={suplente.nombre}
                  onChange={(e) => setSuplente({ ...suplente, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suplente-rol">Rol</Label>
                <select
                  id="suplente-rol"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={suplente.rol}
                  onChange={(e) => setSuplente({ ...suplente, rol: e.target.value })}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suplente-cedula">Cédula</Label>
                <Input
                  id="suplente-cedula"
                  value={suplente.cedula}
                  onChange={(e) => setSuplente({ ...suplente, cedula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suplente-invocador">Nombre de Invocador</Label>
                <Input
                  id="suplente-invocador"
                  value={suplente.nombreInvocador}
                  onChange={(e) => setSuplente({ ...suplente, nombreInvocador: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="showCoach"
            checked={showCoach}
            onCheckedChange={(checked) => setShowCoach(Boolean(checked))}
          />
          <Label htmlFor="showCoach" className="cursor-pointer">Agregar Coach (Opcional)</Label>
        </div>

        {showCoach && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Coach</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="coach-nombre">Nombre</Label>
                <Input
                  id="coach-nombre"
                  value={coach.nombre}
                  onChange={(e) => setCoach({ ...coach, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-rol">Rol</Label>
                <Input
                  id="coach-rol"
                  value={coach.rol}
                  onChange={(e) => setCoach({ ...coach, rol: e.target.value })}
                  placeholder="Coach"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-cedula">Cédula</Label>
                <Input
                  id="coach-cedula"
                  value={coach.cedula}
                  onChange={(e) => setCoach({ ...coach, cedula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coach-invocador">Nombre de Invocador</Label>
                <Input
                  id="coach-invocador"
                  value={coach.nombreInvocador}
                  onChange={(e) => setCoach({ ...coach, nombreInvocador: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información Adicional */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Información Adicional
        </h3>

        <div className="space-y-3">
          <Label>¿Han participado en otro torneo?</Label>
          <RadioGroup value={participadoTorneo} onValueChange={setParticipadoTorneo} className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="si" id="torneo-si" />
              <Label htmlFor="torneo-si" className="cursor-pointer">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="torneo-no" />
              <Label htmlFor="torneo-no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Aceptar reglas */}
      <div className="flex items-start space-x-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Checkbox
          id="aceptaReglas"
          checked={aceptaReglas}
          onCheckedChange={(checked) => setAceptaReglas(Boolean(checked))}
        />
        <Label htmlFor="aceptaReglas" className="cursor-pointer text-sm">
          Acepto las <a href="#" className="text-primary hover:underline">reglas del torneo</a> y confirmo que toda la información proporcionada es correcta.
        </Label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Inscripción'}
        </Button>
      </div>
    </form>
  );
};