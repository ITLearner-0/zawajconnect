
const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300 dark:from-rose-800 dark:via-pink-800 dark:to-rose-700 text-white py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="text-3xl font-bold mb-4 font-serif">Nikah Connect</div>
        <p className="text-white/90 text-lg mb-6">
          Vous guide vers un mariage béni et épanouissant.
        </p>
        <p className="text-white/70">
          &copy; {new Date().getFullYear()} Nikah Connect. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
