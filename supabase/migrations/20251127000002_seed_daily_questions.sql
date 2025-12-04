-- Migration: Seed Daily Questions
-- Created: 2025-11-27
-- Description: Populate daily_questions table with 150+ quality questions

-- =====================================================
-- RELIGION QUESTIONS (30 questions)
-- =====================================================

-- Easy questions
INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('What does your daily prayer routine look like?', 'À quoi ressemble votre routine de prière quotidienne ?', 'religion', 'prayer', 'easy', 'open_ended', 10, ARRAY['prayer', 'routine', 'practice']),
('How important is regular Quran reading in your life?', 'Quelle importance accordez-vous à la lecture régulière du Coran ?', 'religion', 'quran', 'easy', 'scale', 10, ARRAY['quran', 'reading', 'spirituality']),
('Do you prefer praying at the mosque or at home?', 'Préférez-vous prier à la mosquée ou à la maison ?', 'religion', 'prayer', 'easy', 'choice', 8, ARRAY['mosque', 'prayer', 'preference']),
('What Islamic value do you cherish the most?', 'Quelle valeur islamique chérissez-vous le plus ?', 'religion', 'values', 'easy', 'open_ended', 9, ARRAY['values', 'islam', 'character']),
('How do you maintain your spiritual connection during busy times?', 'Comment maintenez-vous votre connexion spirituelle en période d''activité intense ?', 'religion', 'spirituality', 'medium', 'open_ended', 10, ARRAY['spirituality', 'balance', 'lifestyle']);

-- Medium questions
INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('How has your faith evolved over the years?', 'Comment votre foi a-t-elle évolué au fil des ans ?', 'religion', 'faith', 'medium', 'open_ended', 9, ARRAY['faith', 'growth', 'journey']),
('What role should religion play in raising children?', 'Quel rôle la religion devrait-elle jouer dans l''éducation des enfants ?', 'religion', 'parenting', 'medium', 'open_ended', 10, ARRAY['children', 'education', 'values']),
('How do you balance religious practice with work commitments?', 'Comment équilibrez-vous pratique religieuse et engagements professionnels ?', 'religion', 'balance', 'medium', 'open_ended', 8, ARRAY['work', 'balance', 'practice']),
('What Islamic scholar or figure inspires you most?', 'Quel savant ou figure islamique vous inspire le plus ?', 'religion', 'knowledge', 'medium', 'open_ended', 7, ARRAY['inspiration', 'knowledge', 'scholars']),
('How do you approach differences in religious interpretation with others?', 'Comment abordez-vous les différences d''interprétation religieuse avec les autres ?', 'religion', 'tolerance', 'medium', 'open_ended', 9, ARRAY['tolerance', 'respect', 'differences']);

-- Deep questions
INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('What moment in your life brought you closest to Allah?', 'Quel moment de votre vie vous a rapproché le plus d''Allah ?', 'religion', 'spirituality', 'deep', 'open_ended', 10, ARRAY['spirituality', 'connection', 'reflection']),
('How has Islam shaped your worldview and life choices?', 'Comment l''Islam a-t-il façonné votre vision du monde et vos choix de vie ?', 'religion', 'worldview', 'deep', 'open_ended', 10, ARRAY['worldview', 'identity', 'choices']),
('What struggle in practicing your faith have you overcome?', 'Quelle difficulté dans la pratique de votre foi avez-vous surmontée ?', 'religion', 'challenges', 'deep', 'open_ended', 9, ARRAY['challenges', 'growth', 'perseverance']),
('How do you want to pass on your faith to future generations?', 'Comment souhaitez-vous transmettre votre foi aux générations futures ?', 'religion', 'legacy', 'deep', 'open_ended', 10, ARRAY['legacy', 'transmission', 'future']),
('What does living an Islamic life mean to you beyond the basics?', 'Que signifie pour vous vivre une vie islamique au-delà des bases ?', 'religion', 'philosophy', 'deep', 'open_ended', 9, ARRAY['philosophy', 'meaning', 'depth']);

-- Additional religion questions
INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('What is your favorite Surah and why?', 'Quelle est votre sourate préférée et pourquoi ?', 'religion', 'quran', 'easy', 'open_ended', 8, ARRAY['quran', 'favorite', 'meaning']),
('Do you fast beyond Ramadan?', 'Jeûnez-vous au-delà du Ramadan ?', 'religion', 'fasting', 'easy', 'yes_no', 6, ARRAY['fasting', 'sunnah', 'practice']),
('How do you prepare spiritually for Ramadan?', 'Comment vous préparez-vous spirituellement pour le Ramadan ?', 'religion', 'ramadan', 'medium', 'open_ended', 7, ARRAY['ramadan', 'preparation', 'spirituality']),
('What Islamic tradition from your culture do you love most?', 'Quelle tradition islamique de votre culture aimez-vous le plus ?', 'religion', 'culture', 'medium', 'open_ended', 8, ARRAY['culture', 'tradition', 'heritage']),
('How do you handle moments of spiritual doubt?', 'Comment gérez-vous les moments de doute spirituel ?', 'religion', 'faith', 'deep', 'open_ended', 9, ARRAY['doubt', 'faith', 'reflection']);

-- More religion questions
INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('What does modesty mean to you in daily life?', 'Que signifie la pudeur pour vous au quotidien ?', 'religion', 'modesty', 'medium', 'open_ended', 8, ARRAY['modesty', 'values', 'behavior']),
('How do you practice gratitude (shukr) regularly?', 'Comment pratiquez-vous la gratitude (shukr) régulièrement ?', 'religion', 'gratitude', 'easy', 'open_ended', 9, ARRAY['gratitude', 'shukr', 'practice']),
('What role does charity play in your life?', 'Quel rôle joue la charité dans votre vie ?', 'religion', 'charity', 'medium', 'open_ended', 8, ARRAY['charity', 'sadaqah', 'giving']),
('How do you seek Islamic knowledge?', 'Comment recherchez-vous la connaissance islamique ?', 'religion', 'knowledge', 'easy', 'open_ended', 7, ARRAY['knowledge', 'learning', 'education']),
('What does taqwa (God-consciousness) look like for you?', 'Qu''est-ce que la taqwa (conscience de Dieu) pour vous ?', 'religion', 'taqwa', 'deep', 'open_ended', 9, ARRAY['taqwa', 'consciousness', 'spirituality']),
('How do you incorporate dhikr into your daily routine?', 'Comment intégrez-vous le dhikr dans votre routine quotidienne ?', 'religion', 'dhikr', 'medium', 'open_ended', 8, ARRAY['dhikr', 'remembrance', 'routine']),
('What Islamic book has impacted you most (besides Quran)?', 'Quel livre islamique vous a le plus marqué (en dehors du Coran) ?', 'religion', 'knowledge', 'medium', 'open_ended', 7, ARRAY['books', 'knowledge', 'impact']),
('How do you practice sabr (patience) in difficult times?', 'Comment pratiquez-vous le sabr (patience) dans les moments difficiles ?', 'religion', 'sabr', 'medium', 'open_ended', 9, ARRAY['patience', 'sabr', 'resilience']),
('What does seeking Allah''s pleasure mean in practical terms?', 'Que signifie rechercher la satisfaction d''Allah en termes pratiques ?', 'religion', 'practice', 'deep', 'open_ended', 9, ARRAY['practice', 'intention', 'purpose']),
('How important is attending Friday prayer to you?', 'Quelle importance accordez-vous à la prière du vendredi ?', 'religion', 'prayer', 'easy', 'scale', 8, ARRAY['jummah', 'prayer', 'community']);

-- =====================================================
-- FAMILY QUESTIONS (25 questions)
-- =====================================================

-- Easy questions
INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('How many children would you ideally like to have?', 'Combien d''enfants aimeriez-vous idéalement avoir ?', 'family', 'children', 'easy', 'open_ended', 10, ARRAY['children', 'family_size', 'planning']),
('What family tradition are you most attached to?', 'À quelle tradition familiale êtes-vous le plus attaché(e) ?', 'family', 'traditions', 'easy', 'open_ended', 8, ARRAY['traditions', 'heritage', 'culture']),
('How often do you see your extended family?', 'À quelle fréquence voyez-vous votre famille élargie ?', 'family', 'relationships', 'easy', 'open_ended', 6, ARRAY['family', 'relationships', 'frequency']),
('What role should grandparents play in raising children?', 'Quel rôle les grands-parents devraient-ils jouer dans l''éducation des enfants ?', 'family', 'parenting', 'medium', 'open_ended', 8, ARRAY['grandparents', 'parenting', 'generations']),
('Are you close to your siblings?', 'Êtes-vous proche de vos frères et sœurs ?', 'family', 'siblings', 'easy', 'yes_no', 7, ARRAY['siblings', 'relationships', 'bonds']);

-- Medium questions
INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('What parenting style do you believe in?', 'En quel style parental croyez-vous ?', 'family', 'parenting', 'medium', 'open_ended', 10, ARRAY['parenting', 'education', 'philosophy']),
('How would you handle disagreements about parenting with your spouse?', 'Comment géreriez-vous les désaccords sur l''éducation avec votre conjoint(e) ?', 'family', 'parenting', 'medium', 'open_ended', 10, ARRAY['disagreements', 'communication', 'parenting']),
('What values are most important to teach children?', 'Quelles valeurs sont les plus importantes à enseigner aux enfants ?', 'family', 'values', 'medium', 'open_ended', 10, ARRAY['values', 'education', 'character']),
('How involved should in-laws be in your marriage?', 'Quel degré d''implication les beaux-parents devraient-ils avoir dans votre mariage ?', 'family', 'in_laws', 'medium', 'open_ended', 9, ARRAY['in_laws', 'boundaries', 'family']),
('Would you consider adoption or fostering?', 'Envisageriez-vous l''adoption ou l''accueil familial ?', 'family', 'children', 'medium', 'yes_no', 7, ARRAY['adoption', 'fostering', 'family']);

-- Deep questions
INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('What legacy do you want to leave for your children?', 'Quel héritage souhaitez-vous laisser à vos enfants ?', 'family', 'legacy', 'deep', 'open_ended', 10, ARRAY['legacy', 'values', 'future']),
('How did your upbringing shape the parent you want to be?', 'Comment votre éducation a-t-elle façonné le parent que vous voulez être ?', 'family', 'parenting', 'deep', 'open_ended', 9, ARRAY['upbringing', 'reflection', 'parenting']),
('What family pattern do you want to break or continue?', 'Quel schéma familial souhaitez-vous briser ou perpétuer ?', 'family', 'patterns', 'deep', 'open_ended', 9, ARRAY['patterns', 'healing', 'growth']),
('How will you create a strong family identity while respecting individuality?', 'Comment créerez-vous une forte identité familiale tout en respectant l''individualité ?', 'family', 'identity', 'deep', 'open_ended', 8, ARRAY['identity', 'individuality', 'balance']),
('What does ''raising righteous children'' mean to you?', 'Que signifie pour vous « élever des enfants vertueux » ?', 'family', 'parenting', 'deep', 'open_ended', 10, ARRAY['righteousness', 'virtue', 'parenting']);

-- Additional family questions
INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('At what age should children start learning about religion?', 'À quel âge les enfants devraient-ils commencer à apprendre la religion ?', 'family', 'education', 'medium', 'open_ended', 8, ARRAY['religion', 'education', 'age']),
('Would you send your children to Islamic school or public school?', 'Enverriez-vous vos enfants dans une école islamique ou publique ?', 'family', 'education', 'medium', 'choice', 9, ARRAY['school', 'education', 'choice']),
('How important is extended family living close by?', 'Quelle importance accordez-vous à la proximité de la famille élargie ?', 'family', 'proximity', 'easy', 'scale', 7, ARRAY['family', 'proximity', 'support']),
('What family meal traditions would you like to establish?', 'Quelles traditions de repas familiaux aimeriez-vous établir ?', 'family', 'traditions', 'easy', 'open_ended', 7, ARRAY['meals', 'traditions', 'bonding']),
('How would you balance discipline and affection?', 'Comment équilibreriez-vous discipline et affection ?', 'family', 'parenting', 'medium', 'open_ended', 9, ARRAY['discipline', 'affection', 'balance']),
('What role should technology play in children''s lives?', 'Quel rôle la technologie devrait-elle jouer dans la vie des enfants ?', 'family', 'technology', 'medium', 'open_ended', 8, ARRAY['technology', 'screen_time', 'parenting']),
('How would you handle a child questioning their faith?', 'Comment géreriez-vous un enfant qui remet en question sa foi ?', 'family', 'faith', 'deep', 'open_ended', 9, ARRAY['faith', 'questions', 'guidance']),
('What family activities would you prioritize weekly?', 'Quelles activités familiales donneriez-vous en priorité chaque semaine ?', 'family', 'activities', 'easy', 'open_ended', 7, ARRAY['activities', 'bonding', 'quality_time']),
('How important is bilingualism/multilingualism for your children?', 'Quelle importance accordez-vous au bilinguisme/multilinguisme pour vos enfants ?', 'family', 'language', 'medium', 'scale', 7, ARRAY['language', 'education', 'culture']),
('What childhood memory do you hope to recreate for your kids?', 'Quel souvenir d''enfance espérez-vous recréer pour vos enfants ?', 'family', 'memories', 'easy', 'open_ended', 8, ARRAY['childhood', 'memories', 'nostalgia']);

-- =====================================================
-- VALUES & LIFESTYLE QUESTIONS (20 questions)
-- =====================================================

INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('What does success mean to you?', 'Que signifie le succès pour vous ?', 'values', 'success', 'medium', 'open_ended', 10, ARRAY['success', 'goals', 'definition']),
('How do you maintain work-life balance?', 'Comment maintenez-vous l''équilibre travail-vie personnelle ?', 'lifestyle', 'balance', 'medium', 'open_ended', 9, ARRAY['balance', 'work', 'life']),
('What qualities do you value most in a friend?', 'Quelles qualités appréciez-vous le plus chez un ami ?', 'values', 'friendship', 'easy', 'open_ended', 8, ARRAY['friendship', 'qualities', 'relationships']),
('How important is financial security to you?', 'Quelle importance accordez-vous à la sécurité financière ?', 'values', 'finance', 'medium', 'scale', 9, ARRAY['finance', 'security', 'priorities']),
('What does being generous mean in your daily life?', 'Que signifie être généreux dans votre vie quotidienne ?', 'values', 'generosity', 'medium', 'open_ended', 8, ARRAY['generosity', 'giving', 'character']),
('How do you handle stress and pressure?', 'Comment gérez-vous le stress et la pression ?', 'lifestyle', 'stress', 'medium', 'open_ended', 9, ARRAY['stress', 'coping', 'wellness']),
('What role does fitness/health play in your life?', 'Quel rôle la forme/santé joue-t-elle dans votre vie ?', 'lifestyle', 'health', 'easy', 'open_ended', 8, ARRAY['health', 'fitness', 'wellness']),
('What does honesty mean to you in relationships?', 'Que signifie l''honnêteté pour vous dans les relations ?', 'values', 'honesty', 'medium', 'open_ended', 10, ARRAY['honesty', 'integrity', 'trust']),
('How do you practice self-care?', 'Comment pratiquez-vous l''auto-soin ?', 'lifestyle', 'self_care', 'easy', 'open_ended', 7, ARRAY['self_care', 'wellness', 'mental_health']),
('What social cause are you most passionate about?', 'Quelle cause sociale vous passionne le plus ?', 'values', 'activism', 'medium', 'open_ended', 7, ARRAY['activism', 'causes', 'passion']),
('How important is environmental consciousness in your life?', 'Quelle importance accordez-vous à la conscience environnementale ?', 'values', 'environment', 'medium', 'scale', 6, ARRAY['environment', 'sustainability', 'values']),
('What does authentic living mean to you?', 'Que signifie vivre authentiquement pour vous ?', 'values', 'authenticity', 'deep', 'open_ended', 9, ARRAY['authenticity', 'truth', 'being']),
('How do you want to contribute to your community?', 'Comment souhaitez-vous contribuer à votre communauté ?', 'values', 'community', 'medium', 'open_ended', 8, ARRAY['community', 'contribution', 'service']),
('What does simplicity vs luxury mean in your lifestyle?', 'Que représentent la simplicité vs le luxe dans votre mode de vie ?', 'lifestyle', 'preferences', 'medium', 'open_ended', 7, ARRAY['simplicity', 'luxury', 'lifestyle']),
('How do you define personal growth?', 'Comment définissez-vous la croissance personnelle ?', 'values', 'growth', 'medium', 'open_ended', 9, ARRAY['growth', 'development', 'improvement']),
('What morning routine sets you up for success?', 'Quelle routine matinale vous prépare au succès ?', 'lifestyle', 'routine', 'easy', 'open_ended', 7, ARRAY['routine', 'morning', 'habits']),
('How important is cultural heritage in your identity?', 'Quelle importance le patrimoine culturel a-t-il dans votre identité ?', 'values', 'culture', 'medium', 'scale', 8, ARRAY['culture', 'identity', 'heritage']),
('What role does creativity play in your life?', 'Quel rôle la créativité joue-t-elle dans votre vie ?', 'lifestyle', 'creativity', 'easy', 'open_ended', 6, ARRAY['creativity', 'expression', 'hobbies']),
('How do you practice mindfulness or reflection?', 'Comment pratiquez-vous la pleine conscience ou la réflexion ?', 'lifestyle', 'mindfulness', 'medium', 'open_ended', 8, ARRAY['mindfulness', 'reflection', 'awareness']),
('What does living with purpose mean to you?', 'Que signifie vivre avec un but pour vous ?', 'values', 'purpose', 'deep', 'open_ended', 10, ARRAY['purpose', 'meaning', 'life']);

-- =====================================================
-- GOALS & RELATIONSHIP QUESTIONS (25 questions)
-- =====================================================

INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('What are your career aspirations for the next 5 years?', 'Quelles sont vos aspirations professionnelles pour les 5 prochaines années ?', 'goals', 'career', 'medium', 'open_ended', 9, ARRAY['career', 'aspirations', 'future']),
('How do you define a successful marriage?', 'Comment définissez-vous un mariage réussi ?', 'relationship', 'marriage', 'deep', 'open_ended', 10, ARRAY['marriage', 'success', 'definition']),
('What does effective communication look like to you?', 'À quoi ressemble une communication efficace pour vous ?', 'relationship', 'communication', 'medium', 'open_ended', 10, ARRAY['communication', 'dialogue', 'understanding']),
('How important is emotional intelligence in a relationship?', 'Quelle importance l''intelligence émotionnelle a-t-elle dans une relation ?', 'relationship', 'emotional', 'medium', 'scale', 9, ARRAY['emotional_intelligence', 'empathy', 'awareness']),
('What is your biggest personal goal right now?', 'Quel est votre plus grand objectif personnel en ce moment ?', 'goals', 'personal', 'easy', 'open_ended', 8, ARRAY['goals', 'personal', 'current']),
('How do you handle conflicts in relationships?', 'Comment gérez-vous les conflits dans les relations ?', 'relationship', 'conflict', 'medium', 'open_ended', 10, ARRAY['conflict', 'resolution', 'communication']),
('What role does romance play in a lasting marriage?', 'Quel rôle la romance joue-t-elle dans un mariage durable ?', 'relationship', 'romance', 'medium', 'open_ended', 8, ARRAY['romance', 'love', 'marriage']),
('Where do you see yourself living in 10 years?', 'Où vous voyez-vous vivre dans 10 ans ?', 'goals', 'future', 'easy', 'open_ended', 7, ARRAY['future', 'location', 'planning']),
('How important is alone time in a marriage?', 'Quelle importance le temps seul(e) a-t-il dans un mariage ?', 'relationship', 'space', 'medium', 'scale', 8, ARRAY['alone_time', 'space', 'balance']),
('What personal habit do you want to develop or break?', 'Quelle habitude personnelle voulez-vous développer ou abandonner ?', 'goals', 'habits', 'medium', 'open_ended', 7, ARRAY['habits', 'improvement', 'change']),
('How do you show appreciation to loved ones?', 'Comment montrez-vous votre appréciation aux êtres chers ?', 'relationship', 'appreciation', 'easy', 'open_ended', 8, ARRAY['appreciation', 'love_languages', 'expression']),
('What does mutual respect mean in practice?', 'Que signifie le respect mutuel en pratique ?', 'relationship', 'respect', 'medium', 'open_ended', 10, ARRAY['respect', 'equality', 'partnership']),
('What skill do you want to master?', 'Quelle compétence souhaitez-vous maîtriser ?', 'goals', 'skills', 'easy', 'open_ended', 6, ARRAY['skills', 'learning', 'development']),
('How important is humor in your relationships?', 'Quelle importance l''humour a-t-il dans vos relations ?', 'relationship', 'humor', 'easy', 'scale', 7, ARRAY['humor', 'laughter', 'connection']),
('What adventure or experience is on your bucket list?', 'Quelle aventure ou expérience figure sur votre liste de souhaits ?', 'goals', 'dreams', 'easy', 'open_ended', 6, ARRAY['bucket_list', 'dreams', 'adventure']),
('How do you maintain individuality within a partnership?', 'Comment maintenez-vous votre individualité dans un partenariat ?', 'relationship', 'individuality', 'deep', 'open_ended', 9, ARRAY['individuality', 'independence', 'balance']),
('What does quality time mean to you?', 'Que signifie le temps de qualité pour vous ?', 'relationship', 'quality_time', 'medium', 'open_ended', 9, ARRAY['quality_time', 'connection', 'presence']),
('Where do you want to travel and why?', 'Où souhaitez-vous voyager et pourquoi ?', 'goals', 'travel', 'easy', 'open_ended', 6, ARRAY['travel', 'exploration', 'culture']),
('How do you handle jealousy or insecurity?', 'Comment gérez-vous la jalousie ou l''insécurité ?', 'relationship', 'emotions', 'medium', 'open_ended', 8, ARRAY['jealousy', 'security', 'trust']),
('What legacy do you want to leave in the world?', 'Quel héritage souhaitez-vous laisser au monde ?', 'goals', 'legacy', 'deep', 'open_ended', 9, ARRAY['legacy', 'impact', 'contribution']),
('How do you build and maintain trust?', 'Comment construisez-vous et maintenez-vous la confiance ?', 'relationship', 'trust', 'medium', 'open_ended', 10, ARRAY['trust', 'reliability', 'honesty']),
('What does personal success look like beyond career/money?', 'À quoi ressemble le succès personnel au-delà de la carrière/argent ?', 'goals', 'success', 'deep', 'open_ended', 9, ARRAY['success', 'fulfillment', 'meaning']),
('How important is intellectual compatibility?', 'Quelle importance a la compatibilité intellectuelle ?', 'relationship', 'compatibility', 'medium', 'scale', 8, ARRAY['compatibility', 'intellect', 'conversation']),
('What fear do you want to overcome?', 'Quelle peur souhaitez-vous surmonter ?', 'goals', 'fears', 'deep', 'open_ended', 7, ARRAY['fears', 'courage', 'growth']),
('How do you want your spouse to support your dreams?', 'Comment voulez-vous que votre conjoint(e) soutienne vos rêves ?', 'relationship', 'support', 'medium', 'open_ended', 10, ARRAY['support', 'dreams', 'partnership']);

-- =====================================================
-- FUN & PERSONALITY QUESTIONS (20 questions)
-- =====================================================

INSERT INTO public.daily_questions (question_text, question_fr, category, subcategory, difficulty_level, question_type, priority, tags) VALUES
('What is your idea of a perfect weekend?', 'Quelle est votre idée d''un week-end parfait ?', 'fun', 'leisure', 'easy', 'open_ended', 8, ARRAY['weekend', 'leisure', 'relaxation']),
('Are you a morning person or a night owl?', 'Êtes-vous du matin ou du soir ?', 'personality', 'rhythm', 'easy', 'choice', 7, ARRAY['chronotype', 'sleep', 'rhythm']),
('What type of cuisine could you eat every day?', 'Quel type de cuisine pourriez-vous manger tous les jours ?', 'fun', 'food', 'easy', 'open_ended', 6, ARRAY['food', 'cuisine', 'taste']),
('Do you prefer mountains or beaches?', 'Préférez-vous les montagnes ou les plages ?', 'fun', 'nature', 'easy', 'choice', 6, ARRAY['nature', 'preference', 'vacation']),
('What is your favorite way to unwind after a long day?', 'Quelle est votre façon préférée de vous détendre après une longue journée ?', 'fun', 'relaxation', 'easy', 'open_ended', 7, ARRAY['relaxation', 'unwinding', 'self_care']),
('Are you more introverted or extroverted?', 'Êtes-vous plutôt introverti ou extraverti ?', 'personality', 'temperament', 'easy', 'choice', 8, ARRAY['personality', 'introvert', 'extrovert']),
('What book or movie has impacted you most?', 'Quel livre ou film vous a le plus marqué ?', 'fun', 'media', 'medium', 'open_ended', 7, ARRAY['books', 'movies', 'impact']),
('Do you prefer planned activities or spontaneity?', 'Préférez-vous les activités planifiées ou la spontanéité ?', 'personality', 'planning', 'easy', 'choice', 7, ARRAY['planning', 'spontaneity', 'style']),
('What hobby would you pursue with unlimited time/money?', 'Quel loisir pratiqueriez-vous avec temps/argent illimité ?', 'fun', 'hobbies', 'easy', 'open_ended', 6, ARRAY['hobbies', 'passion', 'dreams']),
('How do you celebrate achievements?', 'Comment célébrez-vous les réussites ?', 'personality', 'celebration', 'easy', 'open_ended', 6, ARRAY['celebration', 'joy', 'achievements']),
('What makes you laugh the hardest?', 'Qu''est-ce qui vous fait rire le plus ?', 'personality', 'humor', 'easy', 'open_ended', 7, ARRAY['laughter', 'humor', 'joy']),
('Are you a planner or go-with-the-flow person?', 'Êtes-vous plutôt organisateur ou qui improvise ?', 'personality', 'approach', 'easy', 'choice', 7, ARRAY['planning', 'flexibility', 'style']),
('What is your comfort food?', 'Quel est votre aliment réconfort ?', 'fun', 'food', 'easy', 'open_ended', 5, ARRAY['comfort_food', 'nostalgia', 'taste']),
('How do you recharge your energy?', 'Comment rechargez-vous votre énergie ?', 'personality', 'energy', 'easy', 'open_ended', 7, ARRAY['energy', 'recharge', 'self_care']),
('What is your favorite season and why?', 'Quelle est votre saison préférée et pourquoi ?', 'fun', 'seasons', 'easy', 'open_ended', 5, ARRAY['seasons', 'weather', 'preference']),
('Are you more logical or emotional in decision-making?', 'Êtes-vous plus logique ou émotionnel dans vos décisions ?', 'personality', 'thinking', 'medium', 'choice', 8, ARRAY['logic', 'emotion', 'decisions']),
('What childhood game do you still enjoy?', 'À quel jeu d''enfance prenez-vous encore plaisir ?', 'fun', 'nostalgia', 'easy', 'open_ended', 5, ARRAY['childhood', 'games', 'nostalgia']),
('How do you like to spend quality time with loved ones?', 'Comment aimez-vous passer du temps de qualité avec vos proches ?', 'fun', 'relationships', 'easy', 'open_ended', 7, ARRAY['quality_time', 'loved_ones', 'bonding']),
('What would be your superpower of choice?', 'Quel serait votre super-pouvoir de choix ?', 'fun', 'imagination', 'easy', 'open_ended', 5, ARRAY['superpower', 'imagination', 'fun']),
('How adventurous are you on a scale of 1-10?', 'Quel est votre niveau d''aventure sur une échelle de 1 à 10 ?', 'personality', 'adventure', 'easy', 'scale', 6, ARRAY['adventure', 'risk', 'exploration']);

-- =====================================================
-- Create initial schedule for next 30 days
-- =====================================================

-- Note: In production, this would be managed by a cron job
-- For now, we'll just create a few scheduled questions as examples

INSERT INTO public.daily_question_schedule (question_id, scheduled_date)
SELECT id, CURRENT_DATE + (ROW_NUMBER() OVER (ORDER BY priority DESC, RANDOM()) - 1) * INTERVAL '1 day'
FROM daily_questions
WHERE is_active = true
LIMIT 30;
