-- Update compatibility questions to French
UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous inscrit au registre des délinquants sexuels?',
  options = '["Oui", "Non"]'::jsonb
WHERE question_key = 'sex_offender';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous un casier judiciaire?',
  options = '["Oui", "Non", "Préfère ne pas répondre"]'::jsonb
WHERE question_key = 'criminal_record';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous un converti à l''Islam?',
  options = '["Oui", "Non"]'::jsonb
WHERE question_key = 'convert_islam';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous capable d''avoir des enfants?',
  options = '["Oui", "Non", "Inconnu", "Préfère ne pas répondre"]'::jsonb
WHERE question_key = 'able_children';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous des enfants d''une relation précédente?',
  options = '["Oui", "Non"]'::jsonb
WHERE question_key = 'have_existing_children';

UPDATE compatibility_questions SET 
  question_text = 'Voulez-vous (plus) d''enfants?',
  options = '["Oui", "Non", "Peut-être", "Indécis"]'::jsonb
WHERE question_key = 'want_more_children';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous à votre famille élargie?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'::jsonb
WHERE question_key = 'extended_family_importance';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous une relation saine avec votre famille?',
  options = '["Oui", "Plutôt", "Compliqué", "Non"]'::jsonb
WHERE question_key = 'healthy_family_relationship';

UPDATE compatibility_questions SET 
  question_text = 'Vos parents diraient-ils que vous leur êtes obéissant?',
  options = '["Oui", "Plutôt", "Parfois", "Non"]'::jsonb
WHERE question_key = 'obedient_parents';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous à ce que votre partenaire s''entende bien avec votre famille?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'::jsonb
WHERE question_key = 'partner_family_terms';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous déjà fait faillite?',
  options = '["Oui", "Non", "Préfère ne pas répondre"]'::jsonb
WHERE question_key = 'ever_bankrupt';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous endetté? (hors hypothèque immobilière)',
  options = '["Oui, endettement important", "Oui, quelques dettes", "Aucune dette"]'::jsonb
WHERE question_key = 'in_debt';

UPDATE compatibility_questions SET 
  question_text = 'Certaines personnes disent que tout le monde devrait signer un contrat prénuptial. Signerez-vous un contrat prénuptial?',
  options = '["Oui", "Non", "Dépend des circonstances"]'::jsonb
WHERE question_key = 'prenuptial_agreement';

UPDATE compatibility_questions SET 
  question_text = 'Combien de fois vous brossez-vous les dents par jour?',
  options = '["3+ fois par jour", "2 fois par jour", "Une fois par jour", "Moins d''une fois"]'::jsonb
WHERE question_key = 'brush_teeth';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous une personne propre?',
  options = '["Très propre", "Propre", "Moyen", "Pas très propre"]'::jsonb
WHERE question_key = 'clean_person';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence prenez-vous une douche?',
  options = '["Deux fois par jour", "Une fois par jour", "Tous les deux jours", "Moins souvent"]'::jsonb
WHERE question_key = 'shower_frequency';

UPDATE compatibility_questions SET 
  question_text = 'Fumez-vous?',
  options = '["Jamais", "Parfois", "Régulièrement", "Beaucoup"]'::jsonb
WHERE question_key = 'smoking_habits';

UPDATE compatibility_questions SET 
  question_text = 'Quelle est votre attitude envers le travail après le mariage?',
  options = '["Je continuerai à travailler", "J''arrêterai de travailler", "Cela dépend", "Pas encore décidé"]'::jsonb
WHERE question_key = 'work_after_marriage';

UPDATE compatibility_questions SET 
  question_text = 'Quelle est votre attitude envers le travail de votre épouse?',
  options = '["Elle devrait travailler", "Elle ne devrait pas travailler", "Son choix", "Cela dépend"]'::jsonb
WHERE question_key = 'spouse_work_attitude';

UPDATE compatibility_questions SET 
  question_text = 'Quel niveau d''éducation avez-vous?',
  options = '["École secondaire", "Formation professionnelle", "Licence", "Master/Doctorat"]'::jsonb
WHERE question_key = 'education_level';

UPDATE compatibility_questions SET 
  question_text = 'Quelle est votre situation financière actuelle?',
  options = '["Très stable", "Stable", "Gérable", "Difficile"]'::jsonb
WHERE question_key = 'financial_situation';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence priez-vous?',
  options = '["5 fois par jour", "Parfois", "Lors des occasions spéciales", "Rarement"]'::jsonb
WHERE question_key = 'prayer_frequency';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence lisez-vous le Coran?',
  options = '["Quotidiennement", "Hebdomadairement", "Mensuellement", "Occasionnellement"]'::jsonb
WHERE question_key = 'quran_reading';

UPDATE compatibility_questions SET 
  question_text = 'Portez-vous le hijab?',
  options = '["Toujours", "Parfois", "En public seulement", "Non"]'::jsonb
WHERE question_key = 'hijab_wearing';

UPDATE compatibility_questions SET 
  question_text = 'Portez-vous la barbe?',
  options = '["Oui, toujours", "Parfois", "Barbe courte", "Non"]'::jsonb
WHERE question_key = 'beard_wearing';

UPDATE compatibility_questions SET 
  question_text = 'Quelle est l''importance de la religion dans votre vie?',
  options = '["Très importante", "Importante", "Assez importante", "Pas très importante"]'::jsonb
WHERE question_key = 'religion_importance';

UPDATE compatibility_questions SET 
  question_text = 'Quel madhab suivez-vous?',
  options = '["Hanafi", "Maliki", "Shafi''i", "Hanbali", "Pas de préférence"]'::jsonb
WHERE question_key = 'madhab_preference';

UPDATE compatibility_questions SET 
  question_text = 'Suivez-vous un régime halal strict?',
  options = '["Toujours", "Généralement", "Parfois", "Non"]'::jsonb
WHERE question_key = 'halal_diet';

UPDATE compatibility_questions SET 
  question_text = 'À quelle fréquence assistez-vous aux prières du vendredi?',
  options = '["Chaque semaine", "Souvent", "Parfois", "Rarement"]'::jsonb
WHERE question_key = 'friday_prayer';

UPDATE compatibility_questions SET 
  question_text = 'Participez-vous à des activités communautaires islamiques?',
  options = '["Très actif", "Assez actif", "Parfois", "Rarement"]'::jsonb
WHERE question_key = 'community_involvement';

UPDATE compatibility_questions SET 
  question_text = 'Quelle est votre attitude envers les médias sociaux?',
  options = '["Très actif", "Modérément actif", "Utilisation limitée", "Pas d''utilisation"]'::jsonb
WHERE question_key = 'social_media_usage';