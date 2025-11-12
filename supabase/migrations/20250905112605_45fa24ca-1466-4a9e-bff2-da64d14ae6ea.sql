-- Update remaining English questions to French

UPDATE compatibility_questions SET 
  question_text = 'Faites-vous votre lit après vous être réveillé(e)?',
  options = '["Toujours", "Habituellement", "Parfois", "Jamais"]'
WHERE question_key = 'make_bed';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous déjà souffert d''une dépendance (tabac, alcool, etc.)?',
  options = '["Oui", "Non", "Préfère ne pas répondre"]'
WHERE question_key = 'addiction_history';

UPDATE compatibility_questions SET 
  question_text = 'Y a-t-il des maladies génétiques dans votre famille ou des antécédents de cancer, maladie cardiaque ou maladie chronique?',
  options = '["Oui", "Non", "Inconnu"]'
WHERE question_key = 'genetic_diseases';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous un problème médical qui affecte votre capacité à avoir une vie intime satisfaisante?',
  options = '["Oui", "Non", "Préfère ne pas répondre"]'
WHERE question_key = 'medical_intimacy_problems';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous une maladie grave ou un handicap?',
  options = '["Oui", "Non", "Préfère ne pas répondre"]'
WHERE question_key = 'serious_illness';

UPDATE compatibility_questions SET 
  question_text = 'Prenez-vous des médicaments?',
  options = '["Oui", "Non", "Occasionnellement"]'
WHERE question_key = 'take_medication';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous déjà consulté un thérapeute?',
  options = '["Oui", "Non", "Préfère ne pas répondre"]'
WHERE question_key = 'therapist';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence souhaiteriez-vous l''intimité dans votre mariage?',
  options = '["Quotidiennement", "Plusieurs fois par semaine", "Une fois par semaine", "Quelques fois par mois", "Une fois par mois"]'
WHERE question_key = 'intimacy_frequency';

UPDATE compatibility_questions SET 
  question_text = 'Participez-vous régulièrement à des projets communautaires?',
  options = '["Oui, régulièrement", "Parfois", "Rarement", "Jamais"]'
WHERE question_key = 'community_projects';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous déjà bu de l''alcool en tant que musulman(e)?',
  options = '["Oui", "Non", "Préfère ne pas répondre"]'
WHERE question_key = 'drank_alcohol_muslim';

UPDATE compatibility_questions SET 
  question_text = 'Buvez-vous de l''alcool?',
  options = '["Oui", "Non", "Occasionnellement"]'
WHERE question_key = 'drink_alcohol';

UPDATE compatibility_questions SET 
  question_text = 'Après le mariage, combien de fois par semaine est-il acceptable de manger à l''extérieur ou commander de la nourriture?',
  options = '["Quotidiennement", "Plusieurs fois par semaine", "Une fois par semaine", "Quelques fois par mois", "Rarement"]'
WHERE question_key = 'eating_out_frequency';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous déjà fumé?',
  options = '["Oui", "Non", "Préfère ne pas répondre"]'
WHERE question_key = 'ever_smoked';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous ou voulez-vous des animaux de compagnie?',
  options = '["J''ai des animaux", "Je veux des animaux", "Pas d''animaux", "Contre les animaux"]'
WHERE question_key = 'have_pets';

UPDATE compatibility_questions SET 
  question_text = 'Vous considérez-vous comme libéral, modéré ou conservateur?',
  options = '["Très libéral", "Libéral", "Modéré", "Conservateur", "Très conservateur"]'
WHERE question_key = 'political_view';

UPDATE compatibility_questions SET 
  question_text = 'Fumez-vous?',
  options = '["Oui", "Non", "Occasionnellement"]'
WHERE question_key = 'smoke';

UPDATE compatibility_questions SET 
  question_text = 'Utilisez-vous des drogues récréatives?',
  options = '["Oui", "Non", "Occasionnellement", "Préfère ne pas répondre"]'
WHERE question_key = 'use_drugs';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence sortez-vous avec des amis?',
  options = '["Quotidiennement", "Plusieurs fois par semaine", "Une fois par semaine", "Quelques fois par mois", "Rarement"]'
WHERE question_key = 'social_frequency';

UPDATE compatibility_questions SET 
  question_text = 'Quel type de logement préférez-vous?',
  options = '["Appartement en ville", "Maison en banlieue", "Maison à la campagne", "Peu importe"]'
WHERE question_key = 'housing_preference';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous à la forme physique?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'fitness_importance';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence faites-vous de l''exercice?',
  options = '["Quotidiennement", "Plusieurs fois par semaine", "Une fois par semaine", "Quelques fois par mois", "Rarement"]'
WHERE question_key = 'exercise_frequency';

UPDATE compatibility_questions SET 
  question_text = 'Quel est votre type de cuisine préféré?',
  options = '["Cuisine traditionnelle", "Cuisine internationale", "Cuisine fusion", "Peu importe"]'
WHERE question_key = 'cuisine_preference';

UPDATE compatibility_questions SET 
  question_text = 'Préférez-vous cuisiner à la maison ou manger à l''extérieur?',
  options = '["Cuisiner à la maison", "Manger à l''extérieur", "Les deux également", "Peu importe"]'
WHERE question_key = 'cooking_preference';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous aux voyages?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'travel_importance';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence aimez-vous voyager?',
  options = '["Plusieurs fois par an", "Une fois par an", "Tous les quelques années", "Rarement", "Jamais"]'
WHERE question_key = 'travel_frequency';

UPDATE compatibility_questions SET 
  question_text = 'Quel type de vacances préférez-vous?',
  options = '["Aventure/Nature", "Plage/Détente", "Culture/Histoire", "Villes/Shopping", "Séjour spirituel"]'
WHERE question_key = 'vacation_type';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous à l''éducation?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'education_importance';

UPDATE compatibility_questions SET 
  question_text = 'Envisagez-vous de poursuivre des études supérieures?',
  options = '["Oui, certainement", "Peut-être", "Non", "Déjà terminé"]'
WHERE question_key = 'further_education';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous à la réussite professionnelle?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'career_ambition';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous prêt(e) à déménager pour des opportunités professionnelles?',
  options = '["Oui", "Peut-être", "Non", "Dépend des circonstances"]'
WHERE question_key = 'relocate_career';

UPDATE compatibility_questions SET 
  question_text = 'Quel équilibre vie professionnelle/vie privée préférez-vous?',
  options = '["Axé sur la carrière", "Équilibré", "Axé sur la famille", "Flexible selon les périodes"]'
WHERE question_key = 'work_life_balance';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous aux économies et aux investissements?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'financial_planning';

UPDATE compatibility_questions SET 
  question_text = 'Comment gérez-vous les finances dans une relation?',
  options = '["Comptes séparés", "Compte commun", "Combinaison des deux", "Peu importe"]'
WHERE question_key = 'financial_management';

UPDATE compatibility_questions SET 
  question_text = 'Quelle est votre attitude envers les dépenses?',
  options = '["Économe", "Modéré", "Généreux", "Impulsif"]'
WHERE question_key = 'spending_attitude';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous aux cadeaux et surprises?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'gift_giving';

UPDATE compatibility_questions SET 
  question_text = 'Comment exprimez-vous l''affection?',
  options = '["Contact physique", "Mots d''affirmation", "Actes de service", "Cadeaux", "Temps de qualité"]'
WHERE question_key = 'love_language';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence aimez-vous avoir des conversations profondes?',
  options = '["Quotidiennement", "Plusieurs fois par semaine", "Une fois par semaine", "Occasionnellement", "Rarement"]'
WHERE question_key = 'deep_conversations';

UPDATE compatibility_questions SET 
  question_text = 'Comment gérez-vous les conflits?',
  options = '["Discussion directe", "Temps de réflexion puis discussion", "Évitement", "Médiation", "Dépend de la situation"]'
WHERE question_key = 'conflict_resolution';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous au temps personnel?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'personal_space';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous plutôt introverti(e) ou extraverti(e)?',
  options = '["Très introverti", "Plutôt introverti", "Équilibré", "Plutôt extraverti", "Très extraverti"]'
WHERE question_key = 'personality_type';

UPDATE compatibility_questions SET 
  question_text = 'Comment passez-vous votre temps libre?',
  options = '["Activités en solo", "Temps en famille", "Activités sociales", "Hobbies créatifs", "Sport/Exercice"]'
WHERE question_key = 'leisure_activities';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous aux traditions familiales?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'family_traditions';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence aimez-vous rendre visite à la famille élargie?',
  options = '["Hebdomadaire", "Mensuel", "Quelques fois par an", "Occasions spéciales", "Rarement"]'
WHERE question_key = 'extended_family_visits';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous aux réunions familiales?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'family_gatherings';

UPDATE compatibility_questions SET 
  question_text = 'Comment envisagez-vous l''éducation des enfants?',
  options = '["Stricte/Traditionnelle", "Équilibrée", "Libérale/Moderne", "Dépend de l''enfant"]'
WHERE question_key = 'parenting_style';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous à l''éducation religieuse des enfants?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'religious_education';

UPDATE compatibility_questions SET 
  question_text = 'Préférez-vous l''école publique ou privée pour vos enfants?',
  options = '["École publique", "École privée", "École religieuse", "École à la maison", "Peu importe"]'
WHERE question_key = 'school_preference';

UPDATE compatibility_questions SET 
  question_text = 'À quel âge pensez-vous qu''il est approprié que les enfants aient un téléphone?',
  options = '["Avant 10 ans", "10-12 ans", "13-15 ans", "16-18 ans", "Après 18 ans"]'
WHERE question_key = 'children_phone_age';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous aux activités extrascolaires pour les enfants?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'extracurricular_activities';

UPDATE compatibility_questions SET 
  question_text = 'Comment disciplinez-vous les enfants?',
  options = '["Conséquences naturelles", "Temps d''arrêt", "Discussion", "Retrait de privilèges", "Combinaison de méthodes"]'
WHERE question_key = 'child_discipline';