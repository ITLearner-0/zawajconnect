import { Heart, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-gradient-to-br from-emerald to-emerald-dark text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">ZawajConnect</span>
            </div>
            <p className="text-white/80 mb-6 max-w-md leading-relaxed">
              Une plateforme matrimoniale moderne respectant les valeurs islamiques, 
              où chaque union est bénie et guidée par les principes de la Shariah.
            </p>
            
            {/* Islamic Quote */}
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-white/90 italic text-sm mb-2">
                "Le mariage représente la moitié de la religion"
              </p>
              <p className="text-gold-light text-xs">- Hadith du Prophète ﷺ</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><a href="#valeurs" className="text-white/80 hover:text-white transition-colors">Nos Valeurs</a></li>
              <li><a href="#processus" className="text-white/80 hover:text-white transition-colors">Comment ça marche</a></li>
              <li><a href="#temoignages" className="text-white/80 hover:text-white transition-colors">Témoignages</a></li>
              <li><a href="/faq" className="text-white/80 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li><a href="/terms-of-service" className="text-white/80 hover:text-white transition-colors">Conditions d'Utilisation</a></li>
              <li><a href="/privacy-policy" className="text-white/80 hover:text-white transition-colors">Politique de Confidentialité</a></li>
              <li><a href="/refund-policy" className="text-white/80 hover:text-white transition-colors">Remboursement</a></li>
              <li><a href="/community-guidelines" className="text-white/80 hover:text-white transition-colors">Charte Communautaire</a></li>
              <li><a href="/cookie-policy" className="text-white/80 hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gold-light" />
                <span className="text-white/80 text-sm">contact@zawajconnect.me</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gold-light" />
                <span className="text-white/80 text-sm">Paris, France</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Suivez-nous</h4>
              <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 text-center space-y-2">
          <p className="text-white/70 text-sm">ZawajConnect - Auto-entrepreneur</p>
          <p className="text-white/70 text-sm">
            SIRET : 522 317 767 00039 - 91 Rue du Faubourg Saint-Honoré, 75008 Paris 08
          </p>
          <p className="text-white/70 text-sm">Contact : contact@zawajconnect.me</p>
          <p className="text-white/60 text-xs mt-4">
            © {new Date().getFullYear()} ZawajConnect. Tous droits réservés. Plateforme matrimoniale conforme aux valeurs islamiques.
          </p>
          <p className="text-white/60 text-xs">
            Qu'Allah bénisse tous nos utilisateurs et leurs familles - آمين
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;