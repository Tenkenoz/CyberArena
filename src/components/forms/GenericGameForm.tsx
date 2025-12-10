import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CreditCard, Upload, User, Phone,  IdCard, Gamepad2, Copy, CheckCircle2 } from 'lucide-react';

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
  const resultado = (residuo === 0) ? 0 : (10 - residuo);
  return resultado === digitoVerificador;
};

const PHONE_REGEX = /^(09\d{8}|0[2-8]\d{7})$/;
const NAME_REGEX = /^[A-Za-zÑñÁáÉéÍíÓóÚúüÜ\s]{2,}$/;

// --- CONFIGURACIÓN API ---
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

interface GenericGameFormProps {
  gameName: string;
  onClose: () => void;
}

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
  const [yaDeposito, setYaDeposito] = useState(false);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- UTILIDAD COPIAR ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Número de cuenta copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- MANEJO DE ARCHIVO ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast.error('Solo se permiten imágenes JPG o PNG');
            e.target.value = '';
            setComprobante(null);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen es muy pesada. Máximo 5MB.');
            e.target.value = '';
            setComprobante(null);
            return;
        }
    }
    setComprobante(file);
  };

  // --- VALIDACIÓN FORMULARIO ---
  const validateForm = () => {
    const nombreLimpio = formData.nombre.trim();
    if (!nombreLimpio || !NAME_REGEX.test(nombreLimpio)) {
      toast.error('Ingresa un nombre válido (solo letras).');
      return false;
    }

    const cedulaLimpia = formData.cedula.trim();
    if (!cedulaLimpia) {
      toast.error('Ingresa tu número de cédula.');
      return false;
    }
    if (!validarCedulaEcuador(cedulaLimpia)) {
      toast.error('Cédula ecuatoriana inválida.');
      return false;
    }

    const telefonoLimpio = formData.telefono.trim();
    if (!telefonoLimpio) {
      toast.error('Ingresa tu número de teléfono.');
      return false;
    }
    if (!PHONE_REGEX.test(telefonoLimpio)) {
      toast.error('Teléfono inválido (debe tener 10 dígitos).');
      return false;
    }

    if (!formData.nombreUsuario.trim()) {
      toast.error(`Ingresa tu usuario de ${gameName}.`);
      return false;
    }

    if (!participadoTorneo) {
      toast.error('Indica si has participado antes.');
      return false;
    }

    if (yaDeposito && !comprobante) {
      toast.error('Debes subir la foto del comprobante.');
      return false;
    }

    if (!aceptaReglas) {
      toast.error('Debes aceptar las reglas.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const gameId = getGameId(gameName);
    if (!gameId) {
      toast.error('Error interno: Juego no identificado.');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('nombre', formData.nombre.trim());
      dataToSend.append('cedula', formData.cedula.trim());
      dataToSend.append('telefono', formData.telefono.trim());
      dataToSend.append('nombreUsuario', formData.nombreUsuario.trim());
      dataToSend.append('participadoTorneo', participadoTorneo);
      dataToSend.append('aceptaReglas', String(aceptaReglas));
      dataToSend.append('pagoRealizado', String(yaDeposito));

      if (yaDeposito && comprobante) {
        dataToSend.append('comprobante', comprobante);
      }

      const response = await fetch(`${API_BASE_URL}/api/${gameId}/inscripcion`, {
        method: 'POST',
        body: dataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la inscripción');
      }

      toast.success(data.message || `¡Inscripción exitosa!`);
      
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
      
      {/* SECCIÓN 1: DATOS PERSONALES */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2 border-b border-border pb-2">
          <User className="w-5 h-5" /> Datos del Participante
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-zÑñÁáÉéÍíÓóÚúüÜ\s]/g, '');
                    setFormData({ ...formData, nombre: val });
                  }}
                  className="pl-9"
                  required disabled={loading} placeholder="Ej: Juan Pérez"
                />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
            <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cedula" type="tel" maxLength={10}
                  value={formData.cedula}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                    setFormData({ ...formData, cedula: val });
                  }}
                  className="pl-9"
                  required disabled={loading} placeholder="10 dígitos"
                />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono" type="tel" maxLength={10}
                  value={formData.telefono}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                    setFormData({ ...formData, telefono: val });
                  }}
                  className="pl-9"
                  required disabled={loading} placeholder="Ej: 0991234567"
                />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nombreUsuario">Usuario en {gameName}</Label>
            <div className="relative">
                <Gamepad2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombreUsuario"
                  value={formData.nombreUsuario}
                  onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
                  className="pl-9"
                  required disabled={loading} placeholder="Nick / Gamertag"
                />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ENCUESTA */}
      <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border/50">
        <Label className="text-base font-semibold">¿Has participado en otro torneo antes?</Label>
        <RadioGroup 
          value={participadoTorneo} 
          onValueChange={setParticipadoTorneo} 
          className="flex gap-6 pt-1"
          disabled={loading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="si" id="torneo-si" />
            <Label htmlFor="torneo-si" className="cursor-pointer font-normal">Sí</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="torneo-no" />
            <Label htmlFor="torneo-no" className="cursor-pointer font-normal">No</Label>
          </div>
        </RadioGroup>
      </div>

      {/* SECCIÓN 3: PAGO SIMPLIFICADO */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2 border-b border-border pb-2">
            <CreditCard className="w-5 h-5" /> Información de Pago
        </h3>
        
        <div className="bg-muted/20 p-5 rounded-lg border border-border">
            <h4 className="font-bold text-lg text-primary mb-3">Banco Pichincha</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                    <span className="block text-muted-foreground text-xs font-semibold uppercase">Titular</span>
                    <span className="font-medium">José Sanmartín</span>
                </div>
                <div>
                    <span className="block text-muted-foreground text-xs font-semibold uppercase">C.I.</span>
                    <span className="font-mono">1727585729</span>
                </div>
                <div>
                    <span className="block text-muted-foreground text-xs font-semibold uppercase">Cuenta Ahorros</span>
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard('2206570945')}>
                         <span className="font-mono font-bold text-base">2206570945</span>
                         {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                    </div>
                </div>
                <div className="sm:col-span-2">
                    <span className="block text-muted-foreground text-xs font-semibold uppercase">Email</span>
                    <span>josesanmartin1999@hotmail.com</span>
                </div>
            </div>
        </div>

        <div className="pt-2">
            <div className="flex items-start space-x-3 mb-4">
                <Checkbox 
                    id="yaDeposito" 
                    checked={yaDeposito} 
                    onCheckedChange={(checked) => setYaDeposito(checked as boolean)}
                    disabled={loading}
                    className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="yaDeposito" className="text-sm font-semibold cursor-pointer">
                        Ya realicé la transferencia
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Activa esta casilla para subir tu comprobante de pago.
                    </p>
                </div>
            </div>

            {yaDeposito && (
                <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-muted/20 rounded-lg border border-border/50">
                    <Label htmlFor="comprobante" className="text-sm font-medium mb-2 block">
                        Comprobante de Pago
                    </Label>
                    <div className="flex items-center gap-3">
                        <Input 
                            id="comprobante" 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="cursor-pointer bg-background file:text-primary"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Formatos permitidos: JPG, PNG. Máximo 5MB.
                    </p>
                </div>
            )}
        </div>
      </div>

      {/* SECCIÓN 4: REGLAS */}
      <div className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg border border-border/50">
        <Checkbox
          id="aceptaReglas"
          checked={aceptaReglas}
          onCheckedChange={(checked) => setAceptaReglas(checked as boolean)}
          required
          disabled={loading}
          className="mt-0.5"
        />
        <Label htmlFor="aceptaReglas" className="cursor-pointer text-sm leading-snug text-muted-foreground">
          He leído y acepto las <a href="#" className="text-primary hover:underline font-bold">reglas del torneo</a>. Confirmo que toda la información proporcionada es verídica.
        </Label>
      </div>

      <div className="flex gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11" disabled={loading}>
          Cancelar
        </Button>
        <Button 
            type="submit" 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 h-11 text-base" 
            disabled={loading}
        >
          {loading ? 'Procesando...' : 'Confirmar Inscripción'}
        </Button>
      </div>
    </form>
  );
};