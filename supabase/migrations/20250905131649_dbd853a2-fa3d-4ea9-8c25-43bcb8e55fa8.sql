-- Translate the last remaining English compatibility question to French

-- Update relationship_leadership question
UPDATE compatibility_questions 
SET 
    question_text = 'Qui souhaiteriez-vous qui dirige la relation/prenne les grandes décisions?',
    options = '["Le mari", "L''épouse", "Décisions partagées", "Dépend de la décision"]'
WHERE question_key = 'relationship_leadership';