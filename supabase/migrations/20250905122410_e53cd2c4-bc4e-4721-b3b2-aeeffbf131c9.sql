-- Translate remaining English compatibility questions to French

-- Update can_apologize question
UPDATE compatibility_questions 
SET 
    question_text = 'Pouvez-vous demander pardon?',
    options = '["Facilement", "Quand c''est nécessaire", "Avec difficulté", "Rarement"]'
WHERE question_key = 'can_apologize';

-- Update marriage_counseling question
UPDATE compatibility_questions 
SET 
    question_text = 'Si nous avions des problèmes dans notre mariage, seriez-vous prêt(e) à consulter un conseiller conjugal?',
    options = '["Oui, définitivement", "Oui, si nécessaire", "Peut-être", "Non"]'
WHERE question_key = 'marriage_counseling';

-- Update spouse_weight_important question
UPDATE compatibility_questions 
SET 
    question_text = 'Le poids de votre conjoint(e) est-il important pour vous?',
    options = '["Très important", "Important", "Assez important", "Pas important"]'
WHERE question_key = 'spouse_weight_important';

-- Update weight_gain_affect question
UPDATE compatibility_questions 
SET 
    question_text = 'Cela affecterait-il négativement votre relation si votre conjoint(e) prenait du poids?',
    options = '["Oui", "Non", "Dépend de la quantité"]'
WHERE question_key = 'weight_gain_affect';