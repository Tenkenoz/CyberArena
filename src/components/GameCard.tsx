import { Button } from '@/components/ui/button';

// 1. Definimos la interfaz para la estructura de los detalles
interface GameDetail {
  label: string;
  value: string;
}

// 2. Agregamos 'details' a las propiedades del componente
interface GameCardProps {
  title: string;
  description: string;
  type: 'equipo' | 'individual';
  isMain?: boolean;
  image?: string;
  details?: GameDetail[]; // <--- NUEVA PROPIEDAD
  onInscribirse: () => void;
}

export const GameCard = ({ 
  title, 
  description, 
  type, 
  isMain, 
  image, 
  details, // <--- La recibimos
  onInscribirse 
}: GameCardProps) => {
  return (
    <div
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      className={`group relative rounded-xl border transition-all duration-500 hover:scale-105 ${
        isMain 
          ? 'bg-card border-primary/50 glow-box md:col-span-2 md:row-span-2' 
          : 'bg-card border-border hover:border-primary/30'
      }`}
    >

      {image && (
        <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-black/40" />
      )}
      
      <div className="p-6 h-full flex flex-col relative z-10">
      
        <div className="mb-2">
          <span className={`text-xs uppercase tracking-wider ${type === 'equipo' ? 'text-primary' : 'text-accent'}`}>
            {type === 'equipo' ? 'Equipo' : 'Individual'}
          </span>
        </div>
        <h3 className={`font-display font-bold mb-3 ${isMain ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {title}
        </h3>
        <p className="text-muted-foreground text-sm flex-grow mb-4">
          {description}
        </p>

        {/* 3. Renderizamos la tabla de detalles si existen */}
        {details && details.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/70">
            <h4 className="font-semibold text-base mb-2">Detalles del Evento:</h4>
            <dl className="space-y-1 text-sm">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between">
                  <dt className="text-muted-foreground">{detail.label}</dt>
                  <dd className="font-medium text-white">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {/* FIN del renderizado de detalles */}

        <div className="mt-6"> {/* Separamos el botón de los detalles/descripción */}
            <Button 
                variant={"card"} 
                size={isMain ? "lg" : "default"}
                onClick={onInscribirse}
                className="w-full"
            >
                Inscribirse
            </Button>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5" />
      </div>
    </div>
  );
};