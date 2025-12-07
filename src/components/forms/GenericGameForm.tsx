import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CreditCard, Upload } from 'lucide-react';

// --- CONFIGURACIÓN DE API PARA VERCEL ---
// Detecta la URL de la API según el entorno.
// En Vercel, asegúrate de configurar 'VITE_API_URL' o 'NEXT_PUBLIC_API_URL'.
const getApiUrl = () => {
  // Soporte para Vite
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Soporte para Next.js
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Fallback para desarrollo local
  return 'http://localhost:4000';
};

const API_BASE_URL = getApiUrl();

interface GenericGameFormProps {
  gameName: string;
  onClose: () => void;
}

// Función auxiliar para mapear el nombre visual al ID de la API
const getGameId = (gameName: string): string => {
  const lower = gameName.toLowerCase();
  if (lower.includes('tft') || lower.includes('teamfight')) return 'tft';
  if (lower.includes('chess') || lower.includes('ajedrez')) return 'chess';
  if (lower.includes('clash') || lower.includes('royale')) return 'clash-royale';
  return '';
};

export const GenericGameForm = ({ gameName, onClose }: GenericGameFormProps) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    nombreUsuario: '',
  });

  const [participadoTorneo, setParticipadoTorneo] = useState<string>('');
  const [aceptaReglas, setAceptaReglas] = useState(false);
  
  // --- NUEVOS ESTADOS PARA EL PAGO ---
  const [yaDeposito, setYaDeposito] = useState(false);
  const [comprobante, setComprobante] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);

  // --- VALIDACIÓN DE ARCHIVO ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
        // Validar tipo de imagen
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast.error('Solo se permiten imágenes JPG o PNG');
            e.target.value = ''; // Limpiar input
            setComprobante(null);
            return;
        }
        // Validar tamaño (Máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen es muy pesada. Máximo 5MB.');
            e.target.value = '';
            setComprobante(null);
            return;
        }
    }
    setComprobante(file);
  };

  // --- FUNCIÓN DE VALIDACIÓN ---
  const validateForm = () => {
    // 1. Validar campos de texto
    if (!formData.nombre.trim()) {
      toast.error('Por favor, ingresa tu nombre completo.');
      return false;
    }
    if (!formData.cedula.trim()) {
      toast.error('Por favor, ingresa tu número de cédula.');
      return false;
    }
    if (!formData.telefono.trim()) {
      toast.error('Por favor, ingresa tu número de teléfono.');
      return false;
    }
    if (!formData.nombreUsuario.trim()) {
      toast.error(`Por favor, ingresa tu nombre de usuario en ${gameName}.`);
      return false;
    }

    // 2. Validar selección de radio button
    if (!participadoTorneo) {
      toast.error('Por favor indica si has participado en torneos anteriormente.');
      return false;
    }

    // 3. Validar Pago (Si marcó que ya depositó, DEBE subir foto)
    if (yaDeposito && !comprobante) {
      toast.error('Si ya realizaste el depósito, por favor sube el comprobante (foto/captura).');
      return false;
    }

    // 4. Validar reglas
    if (!aceptaReglas) {
      toast.error('Debes aceptar las reglas del torneo para continuar.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ejecutamos las validaciones antes de enviar
    if (!validateForm()) return;

    const gameId = getGameId(gameName);
    if (!gameId) {
      toast.error('Error interno: No se pudo identificar el ID del juego.');
      return;
    }

    setLoading(true);

    try {
      // --- CAMBIO IMPORTANTE: Usamos FormData para enviar archivos ---
      const dataToSend = new FormData();
      
      // Agregamos campos de texto
      dataToSend.append('nombre', formData.nombre);
      dataToSend.append('cedula', formData.cedula);
      dataToSend.append('telefono', formData.telefono);
      dataToSend.append('nombreUsuario', formData.nombreUsuario);
      dataToSend.append('participadoTorneo', participadoTorneo);
      dataToSend.append('aceptaReglas', String(aceptaReglas));
      
      // Agregamos estado del pago (Boolean convertido a String)
      dataToSend.append('pagoRealizado', String(yaDeposito));

      // Si subió comprobante, lo agregamos
      if (yaDeposito && comprobante) {
        dataToSend.append('comprobante', comprobante);
      }

      // Usamos la constante dinámica
      const response = await fetch(`${API_BASE_URL}/api/${gameId}/inscripcion`, {
        method: 'POST',
        // NO agregamos 'Content-Type': 'application/json' porque FormData lo hace automático
        body: dataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la inscripción');
      }

      toast.success(data.message || `¡Inscripción a ${gameName} enviada exitosamente!`);
      
      // Limpiamos el formulario
      setFormData({ nombre: '', cedula: '', telefono: '', nombreUsuario: '' });
      setParticipadoTorneo('');
      setAceptaReglas(false);
      setYaDeposito(false);
      setComprobante(null);
      
      onClose();

    } catch (error: any) {
      console.error('Error de inscripción:', error);
      toast.error(error.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-primary border-b border-border pb-2">
          Datos del Participante
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              disabled={loading}
              placeholder="Nombre Completo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
            <Input
              id="cedula"
              value={formData.cedula}
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              required
              disabled={loading}
              placeholder="Ej: 123456789"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
              disabled={loading}
              placeholder="+57 300 123 4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nombreUsuario">Nombre de Usuario en {gameName}</Label>
            <Input
              id="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
              placeholder={`Tu ID o Gamertag`}
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Participación previa */}
      <div className="space-y-3">
        <Label>¿Has participado en otro torneo?</Label>
        <RadioGroup 
          value={participadoTorneo} 
          onValueChange={setParticipadoTorneo} 
          className="flex gap-6"
          disabled={loading}
        >
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

      {/* --- SECCIÓN DE PAGO --- */}
      <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
        <h3 className="font-bold flex items-center gap-2 text-primary">
            <CreditCard className="w-5 h-5" /> Información de Pago
        </h3>
        
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md text-sm space-y-1 border border-blue-100 dark:border-blue-900">
            <p className="font-semibold text-blue-800 dark:text-blue-300">Banco Pichincha</p>
            <p><strong>Nombre:</strong> José Sanmartín</p>
            <p><strong>CI:</strong> 1727585729</p>
            <p><strong>Cuenta de Ahorro Transaccional:</strong> 2206570945</p>
            <p><strong>Email:</strong> josesanmartin1999@hotmail.com</p>
        </div>

        <div className="flex items-start space-x-2 py-2">
            <Checkbox 
                id="yaDeposito" 
                checked={yaDeposito} 
                onCheckedChange={(checked) => setYaDeposito(checked as boolean)}
                disabled={loading}
            />
            <Label htmlFor="yaDeposito" className="cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Ya realicé el depósito de la inscripción
            </Label>
        </div>

        {/* INPUT DE ARCHIVO (Solo visible si marcó el checkbox) */}
        {yaDeposito && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="comprobante" className="text-primary font-semibold">Subir Comprobante (Foto/Captura)</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        id="comprobante" 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        disabled={loading}
                        className="cursor-pointer file:text-primary"
                    />
                    <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Formato JPG o PNG. Máximo 5MB.</p>
            </div>
        )}
      </div>

      {/* Aceptar reglas */}
      <div className="flex items-start space-x-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Checkbox
          id="aceptaReglas"
          checked={aceptaReglas}
          onCheckedChange={(checked) => setAceptaReglas(checked as boolean)}
          required
          disabled={loading}
        />
        <Label htmlFor="aceptaReglas" className="cursor-pointer text-sm">
          Acepto las <a href="#" className="text-primary hover:underline font-medium">reglas del torneo</a> y confirmo que toda la información proporcionada es correcta.
        </Label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Inscripción'}
        </Button>
      </div>
    </form>
  );
};