-- Create compatibility questions table
CREATE TABLE public.compatibility_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text text NOT NULL,
  question_key text NOT NULL UNIQUE,
  category text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice', -- multiple_choice, boolean, scale
  options jsonb, -- For multiple choice questions
  weight integer DEFAULT 1, -- Importance weight for matching algorithm
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user compatibility responses table
CREATE TABLE public.user_compatibility_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  question_key text NOT NULL,
  response_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_key)
);

-- Enable RLS
ALTER TABLE public.compatibility_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_compatibility_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compatibility_questions
CREATE POLICY "Everyone can view active questions"
ON public.compatibility_questions
FOR SELECT
USING (is_active = true);

-- RLS Policies for user_compatibility_responses
CREATE POLICY "Users can manage their own responses"
ON public.user_compatibility_responses
FOR ALL
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_compatibility_questions_updated_at
BEFORE UPDATE ON public.compatibility_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_compatibility_responses_updated_at
BEFORE UPDATE ON public.user_compatibility_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the compatibility questions from the document
INSERT INTO public.compatibility_questions (question_key, question_text, category, question_type, options, weight) VALUES
-- Religious Questions
('lower_gaze', 'Would you marry someone who does not lower their gaze (men and women)?', 'religious', 'multiple_choice', '["Yes", "No", "Depends on the situation"]', 5),
('prayer_frequency', 'How often do you pray?', 'religious', 'multiple_choice', '["5 times a day", "Often", "Sometimes", "Rarely", "Never"]', 5),
('marriage_publicity', 'Do you intend to make this marriage public or hidden?', 'religious', 'multiple_choice', '["Public", "Hidden", "Depends"]', 4),
('celebrate_birthdays', 'Do you celebrate birthdays?', 'religious', 'multiple_choice', '["Yes", "No", "Sometimes"]', 2),

-- Health & Lifestyle
('drink_alcohol', 'Do you drink alcohol?', 'lifestyle', 'multiple_choice', '["Yes", "No", "Occasionally"]', 5),
('drank_alcohol_muslim', 'Have you ever drank alcohol as a Muslim?', 'lifestyle', 'multiple_choice', '["Yes", "No", "Prefer not to say"]', 4),
('smoke', 'Do you smoke?', 'lifestyle', 'multiple_choice', '["Yes", "No", "Occasionally"]', 4),
('ever_smoked', 'Have you ever smoked?', 'lifestyle', 'multiple_choice', '["Yes", "No", "Prefer not to say"]', 3),
('convert_islam', 'Are you a convert to Islam?', 'background', 'multiple_choice', '["Yes", "No"]', 2),
('serious_illness', 'Do you have a serious illness or disability?', 'health', 'multiple_choice', '["Yes", "No", "Prefer not to say"]', 4),
('genetic_diseases', 'Are there any genetic diseases in your family or a history of cancer, heart disease, or chronic illness?', 'health', 'multiple_choice', '["Yes", "No", "Unknown"]', 4),
('take_medication', 'Do you take any medication?', 'health', 'multiple_choice', '["Yes", "No", "Occasionally"]', 3),
('therapist', 'Have you ever seen a therapist?', 'health', 'multiple_choice', '["Yes", "No", "Prefer not to say"]', 2),
('addiction_history', 'Have you ever suffered from an addiction (including smoking, alcohol, etc)?', 'health', 'multiple_choice', '["Yes", "No", "Prefer not to say"]', 4),

-- Personal Habits
('clean_person', 'Are you a clean person?', 'habits', 'multiple_choice', '["Very clean", "Clean", "Average", "Not very clean"]', 3),
('spouse_cleanliness_importance', 'How important is it that your spouse always stay clean?', 'preferences', 'multiple_choice', '["Very important", "Important", "Somewhat important", "Not important"]', 3),
('happy_with_weight', 'Are you happy with your current weight?', 'physical', 'multiple_choice', '["Yes", "No", "Somewhat"]', 2),
('spouse_weight_important', 'Is the weight of your spouse important to you?', 'preferences', 'multiple_choice', '["Very important", "Important", "Somewhat important", "Not important"]', 2),
('weight_gain_affect', 'Would it negatively affect your relationship if your spouse were to gain weight?', 'preferences', 'multiple_choice', '["Yes", "No", "Depends on amount"]', 2),
('have_tattoos', 'Do you have any tattoos?', 'physical', 'multiple_choice', '["Yes", "No"]', 3),
('marry_tattoos', 'Would you marry someone with tattoos?', 'preferences', 'multiple_choice', '["Yes", "No", "Depends on tattoos"]', 3),
('intimate_piercings', 'Do you have any tongue or intimate piercings?', 'physical', 'multiple_choice', '["Yes", "No"]', 3),
('marry_piercings', 'Would you marry someone with tongue or intimate piercings?', 'preferences', 'multiple_choice', '["Yes", "No", "Depends"]', 3),
('make_bed', 'Do you make your bed after waking up?', 'habits', 'multiple_choice', '["Always", "Usually", "Sometimes", "Never"]', 1),
('brush_teeth', 'How often do you brush your teeth in a day?', 'habits', 'multiple_choice', '["3+ times a day", "2 times a day", "Once a day", "Less than once"]', 2),

-- Intimacy & Children
('intimacy_frequency', 'How frequently would you like intimacy in your marriage?', 'intimacy', 'multiple_choice', '["Daily", "A few times a week", "Once a week", "A few times a month", "Once a month"]', 4),
('medical_intimacy_problems', 'Do you have a medical problem that impacts your ability to have a satisfying sex life?', 'health', 'multiple_choice', '["Yes", "No", "Prefer not to say"]', 4),
('able_children', 'Are you able to have children?', 'children', 'multiple_choice', '["Yes", "No", "Unknown", "Prefer not to say"]', 4),
('marry_unable_children', 'Would you marry someone who is unable to have children?', 'preferences', 'multiple_choice', '["Yes", "No", "Depends"]', 4),
('have_existing_children', 'Do you have children from a previous relationship?', 'children', 'multiple_choice', '["Yes", "No"]', 4),
('marry_with_children', 'Would you marry someone with children?', 'preferences', 'multiple_choice', '["Yes", "No", "Depends on circumstances"]', 4),
('children_live_with', 'Are you ok with your new spouse''s existing children living with you?', 'preferences', 'multiple_choice', '["Yes", "No", "Depends on circumstances"]', 3),
('want_more_children', 'Do you want (more) children?', 'children', 'multiple_choice', '["Yes", "No", "Maybe", "Undecided"]', 4),

-- Relationship Dynamics
('relationship_leadership', 'Who would you like to lead the relationship/make the big decisions?', 'relationship', 'multiple_choice', '["Husband", "Wife", "Shared decisions", "Depends on the decision"]', 4),
('wife_defer_husband', 'Do you believe that marriages are stronger if the wife defers to her husband in most areas?', 'relationship', 'multiple_choice', '["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"]', 4),
('unconventional_roles', 'Do you believe that roles in your family should be fulfilled by the person best equipped for the job, even if it is an unconventional arrangement?', 'relationship', 'multiple_choice', '["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"]', 3),
('father_head_family', 'Do you believe the father should be the head of the family?', 'relationship', 'multiple_choice', '["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"]', 4),

-- Family
('extended_family_importance', 'How important is extended family to you?', 'family', 'multiple_choice', '["Very important", "Important", "Somewhat important", "Not important"]', 3),
('healthy_family_relationship', 'Do you have a healthy relationship with your family?', 'family', 'multiple_choice', '["Yes", "Mostly", "Complicated", "No"]', 3),
('partner_family_terms', 'How important is it that your partner be on good terms with your family?', 'family', 'multiple_choice', '["Very important", "Important", "Somewhat important", "Not important"]', 3),
('obedient_parents', 'Would your parents say that you are obedient to them?', 'family', 'multiple_choice', '["Yes", "Mostly", "Sometimes", "No"]', 3),

-- Lifestyle
('have_pets', 'Do you have or want any pets?', 'lifestyle', 'multiple_choice', '["Have pets", "Want pets", "No pets", "Against pets"]', 2),
('marry_with_pets', 'Would you marry someone with pets?', 'preferences', 'multiple_choice', '["Yes", "Depends on the pet", "No"]', 2),
('political_view', 'Do you consider yourself liberal, moderate, or conservative?', 'lifestyle', 'multiple_choice', '["Very liberal", "Liberal", "Moderate", "Conservative", "Very conservative"]', 3),
('community_projects', 'Do you regularly participate in community projects?', 'lifestyle', 'multiple_choice', '["Yes, regularly", "Sometimes", "Rarely", "Never"]', 2),
('criminal_record', 'Do you have a criminal record?', 'background', 'multiple_choice', '["Yes", "No", "Prefer not to say"]', 5),
('marry_criminal_record', 'Would you marry someone with a criminal record?', 'preferences', 'multiple_choice', '["Yes", "Depends on the crime", "No"]', 4),
('sex_offender', 'Are you on the sex offender register?', 'background', 'multiple_choice', '["Yes", "No"]', 5),
('marry_sex_offender', 'Would you marry someone on the sex offender register?', 'preferences', 'multiple_choice', '["Yes", "No"]', 5),
('eating_out_frequency', 'After marriage how many times a week is acceptable to eat out or order takeaway?', 'lifestyle', 'multiple_choice', '["Daily", "A few times a week", "Once a week", "A few times a month", "Rarely"]', 2),

-- Financial
('in_debt', 'Are you in debt? (excluding a home mortgage)', 'financial', 'multiple_choice', '["Yes, significant debt", "Yes, some debt", "No debt"]', 3),
('ever_bankrupt', 'Have you ever been bankrupt?', 'financial', 'multiple_choice', '["Yes", "No", "Prefer not to say"]', 4),
('prenuptial_agreement', 'Some people say everyone should sign a prenuptial. Will you sign a prenuptial?', 'financial', 'multiple_choice', '["Yes", "No", "Depends on circumstances"]', 3),

-- Personality
('physically_affectionate', 'Are you a physically affectionate person?', 'personality', 'multiple_choice', '["Very affectionate", "Somewhat affectionate", "Not very affectionate"]', 3),
('admit_wrong', 'Do you admit when you are wrong?', 'personality', 'multiple_choice', '["Always", "Usually", "Sometimes", "Rarely"]', 4),
('can_apologize', 'Can you say sorry?', 'personality', 'multiple_choice', '["Easily", "When necessary", "With difficulty", "Rarely"]', 4),
('hold_grudges', 'How long do you hold a grudge for?', 'personality', 'multiple_choice', '["I do not hold grudges", "A few hours", "A few days", "Weeks", "Months or longer"]', 4),
('forgiving_person', 'Are you a forgiving person?', 'personality', 'multiple_choice', '["Very forgiving", "Somewhat forgiving", "Not very forgiving"]', 4),
('life_mission', 'Do you have a mission in life?', 'personality', 'multiple_choice', '["Yes, clear mission", "Somewhat", "Still discovering", "No"]', 2),
('marriage_counseling', 'If we had problems in our marriage would you be up to marriage counseling?', 'relationship', 'multiple_choice', '["Yes, definitely", "Yes, if needed", "Maybe", "No"]', 4),
('introvert_extrovert', 'Are you an introvert or an extrovert?', 'personality', 'multiple_choice', '["Strong introvert", "Introvert", "Ambivert", "Extrovert", "Strong extrovert"]', 2);