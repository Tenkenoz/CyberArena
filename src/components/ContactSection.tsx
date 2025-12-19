import { Mail, Phone, MapPin, Disc, Twitter, Instagram, Facebook } from 'lucide-react'; // Opcional: usando lucide-react para iconos más limpios

export const ContactSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Ponte en contacto</h2>
          <p className="text-muted-foreground">Estamos aquí para ayudarte. Elige el medio que prefieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Información General */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-8">Canales Directos</h3>
            <div className="space-y-6">
              
              {/* Email */}
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Escríbenos</p>
                  <a href="mailto:openhubgames@gmail.com" className="font-semibold hover:text-primary transition-colors">
                    openhubgames@gmail.com
                  </a>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Llámanos</p>
                  <a href="tel:+593984219399" className="font-semibold hover:text-primary transition-colors">
                    +593 984219399
                  </a>
                </div>
              </div>

              {/* Ubicación */}
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Visítanos</p>
                  <p className="font-semibold text-foreground">Quito, Ecuador</p>
                </div>
              </div>

            </div>
          </div>

          {/* Redes Sociales */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xl font-bold mb-2">Comunidad</h3>
              <p className="text-muted-foreground mb-8">Únete a nuestras redes para estar al día.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <a href="https://discord.gg/cyberarena" className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-primary/5 transition-colors">
                <Disc className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium">Discord</span>
              </a>
              <a href="https://twitter.com/cyberarena" className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-primary/5 transition-colors">
                <Twitter className="w-5 h-5 text-sky-500" />
                <span className="text-sm font-medium">Twitter</span>
              </a>
              <a href="https://instagram.com/cyberarena" className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-primary/5 transition-colors">
                <Instagram className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-medium">Instagram</span>
              </a>
              <a href="https://facebook.com/cyberarena" className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-primary/5 transition-colors">
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};