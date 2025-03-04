
export const fieldTooltips = {
  // Basic information
  fullName: "Your full name helps others identify you correctly when searching for potential matches.",
  age: "Your age helps in matching you with people in compatible age ranges.",
  gender: "This information is used to match you according to your preferences.",
  location: "Sharing your location helps find matches in your area and calculate distance between matches.",
  
  // Education & Career
  education: "Your education level may be important to potential matches who value educational compatibility.",
  occupation: "Sharing your occupation gives others insight into your professional life and interests.",
  
  // Religious Background
  religiousLevel: "This helps match you with others who share similar religious commitment levels.",
  prayerFrequency: "Your prayer habits are important for matching with partners who have similar religious practices.",
  familyBackground: "Information about your family helps give context to your upbringing and values.",
  
  // About Me
  aboutMe: "This is your opportunity to share your personality, interests, and what you're looking for in a partner."
};

// Check if a field is required for step completion
export const isFieldRequired = (fieldName: string): boolean => {
  const requiredFields = [
    "fullName", 
    "gender", 
    "location", 
    "religiousLevel", 
    "aboutMe"
  ];
  
  return requiredFields.includes(fieldName);
};
