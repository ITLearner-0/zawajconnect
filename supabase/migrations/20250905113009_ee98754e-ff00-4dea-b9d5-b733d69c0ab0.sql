-- Update remaining English questions to French (personality, physical, preferences, relationship, religious categories)

UPDATE compatibility_questions SET 
  question_text = 'Admettez-vous quand vous avez tort?',
  options = '["Toujours", "Habituellement", "Parfois", "Rarement"]'
WHERE question_key = 'admit_wrong';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous une personne qui pardonne?',
  options = '["Très indulgent", "Assez indulgent", "Peu indulgent"]'
WHERE question_key = 'forgiving_person';

UPDATE compatibility_questions SET 
  question_text = 'Combien de temps gardez-vous rancune?',
  options = '["Je ne garde pas rancune", "Quelques heures", "Quelques jours", "Des semaines", "Des mois ou plus"]'
WHERE question_key = 'hold_grudges';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous introverti(e) ou extraverti(e)?',
  options = '["Très introverti", "Introverti", "Ambivert", "Extraverti", "Très extraverti"]'
WHERE question_key = 'introvert_extrovert';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous une mission dans la vie?',
  options = '["Oui, mission claire", "En quelque sorte", "Encore en découverte", "Non"]'
WHERE question_key = 'life_mission';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous une personne physiquement affectueuse?',
  options = '["Très affectueux", "Assez affectueux", "Peu affectueux"]'
WHERE question_key = 'physically_affectionate';

UPDATE compatibility_questions SET 
  question_text = 'Êtes-vous satisfait(e) de votre poids actuel?',
  options = '["Oui", "Non", "En quelque sorte"]'
WHERE question_key = 'happy_with_weight';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous des tatouages?',
  options = '["Oui", "Non"]'
WHERE question_key = 'have_tattoos';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous des piercings à la langue ou intimes?',
  options = '["Oui", "Non"]'
WHERE question_key = 'intimate_piercings';

UPDATE compatibility_questions SET 
  question_text = 'Accepteriez-vous que les enfants existants de votre nouveau conjoint vivent avec vous?',
  options = '["Oui", "Non", "Dépend des circonstances"]'
WHERE question_key = 'children_live_with';

UPDATE compatibility_questions SET 
  question_text = 'Épouseriez-vous quelqu''un avec un casier judiciaire?',
  options = '["Oui", "Dépend du crime", "Non"]'
WHERE question_key = 'marry_criminal_record';

UPDATE compatibility_questions SET 
  question_text = 'Épouseriez-vous quelqu''un avec des piercings à la langue ou intimes?',
  options = '["Oui", "Non", "Dépend"]'
WHERE question_key = 'marry_piercings';

UPDATE compatibility_questions SET 
  question_text = 'Épouseriez-vous quelqu''un inscrit au registre des délinquants sexuels?',
  options = '["Oui", "Non"]'
WHERE question_key = 'marry_sex_offender';

UPDATE compatibility_questions SET 
  question_text = 'Épouseriez-vous quelqu''un avec des tatouages?',
  options = '["Oui", "Non", "Dépend des tatouages"]'
WHERE question_key = 'marry_tattoos';

UPDATE compatibility_questions SET 
  question_text = 'Épouseriez-vous quelqu''un qui ne peut pas avoir d''enfants?',
  options = '["Oui", "Non", "Dépend"]'
WHERE question_key = 'marry_unable_children';

UPDATE compatibility_questions SET 
  question_text = 'Épouseriez-vous quelqu''un qui a des enfants?',
  options = '["Oui", "Non", "Dépend des circonstances"]'
WHERE question_key = 'marry_with_children';

UPDATE compatibility_questions SET 
  question_text = 'Épouseriez-vous quelqu''un qui a des animaux de compagnie?',
  options = '["Oui", "Dépend de l''animal", "Non"]'
WHERE question_key = 'marry_with_pets';

UPDATE compatibility_questions SET 
  question_text = 'Quelle importance accordez-vous à ce que votre conjoint reste toujours propre?',
  options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'spouse_cleanliness_importance';

UPDATE compatibility_questions SET 
  question_text = 'Croyez-vous que le père devrait être le chef de famille?',
  options = '["Tout à fait d''accord", "D''accord", "Neutre", "Pas d''accord", "Pas du tout d''accord"]'
WHERE question_key = 'father_head_family';

UPDATE compatibility_questions SET 
  question_text = 'Croyez-vous que les rôles dans votre famille devraient être remplis par la personne la mieux équipée pour le travail, même si c''est un arrangement non conventionnel?',
  options = '["Tout à fait d''accord", "D''accord", "Neutre", "Pas d''accord", "Pas du tout d''accord"]'
WHERE question_key = 'unconventional_roles';

UPDATE compatibility_questions SET 
  question_text = 'Croyez-vous que les mariages sont plus forts si l''épouse défère à son mari dans la plupart des domaines?',
  options = '["Tout à fait d''accord", "D''accord", "Neutre", "Pas d''accord", "Pas du tout d''accord"]'
WHERE question_key = 'wife_defer_husband';

UPDATE compatibility_questions SET 
  question_text = 'Célébrez-vous les anniversaires?',
  options = '["Oui", "Non", "Parfois"]'
WHERE question_key = 'celebrate_birthdays';

UPDATE compatibility_questions SET 
  question_text = 'Épouseriez-vous quelqu''un qui ne baisse pas le regard (hommes et femmes)?',
  options = '["Oui", "Non", "Dépend de la situation"]'
WHERE question_key = 'lower_gaze';

UPDATE compatibility_questions SET 
  question_text = 'Avez-vous l''intention de rendre ce mariage public ou de le garder secret?',
  options = '["Public", "Secret", "Dépend"]'
WHERE question_key = 'marriage_publicity';