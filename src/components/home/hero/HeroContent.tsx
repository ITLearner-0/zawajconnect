import React from 'react';

const HeroContent = () => {
  return (
    <>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-100 font-serif leading-tight">
        SE MARIER DE MANIÈRE
        <span className="block bg-gradient-to-r from-rose-500 to-pink-400 dark:from-rose-300 dark:to-pink-200 bg-clip-text text-transparent">
          LÉGIFÉRÉE
        </span>
      </h1>

      <p className="text-lg md:text-xl mb-8 text-rose-700 dark:text-rose-200 max-w-3xl mx-auto leading-relaxed">
        Une plateforme de mariage construite sur les valeurs islamiques, vous guidant vers une union
        bénie et harmonieuse.
      </p>
    </>
  );
};

export default HeroContent;
