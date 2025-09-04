import { Heart, Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";

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
              <span className="text-2xl font-bold">NikahConnect</span>
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
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Politique de confidentialité</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gold-light" />
                <span className="text-white/80 text-sm">contact@nikahconnect.fr</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gold-light" />
                <span className="text-white/80 text-sm">+33 1 23 45 67 89</span>
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
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/70 text-sm">
            © 2024 NikahConnect. Tous droits réservés. | Développé avec ❤️ pour la Oummah
          </p>
          <p className="text-white/60 text-xs mt-2">
            Qu'Allah bénisse tous nos utilisateurs et leurs familles - آمين
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;