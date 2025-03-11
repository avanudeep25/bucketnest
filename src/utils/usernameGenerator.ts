
// Array of fun adjectives and nouns to generate usernames
const funnyAdjectives = [
  'happy', 'silly', 'bouncy', 'fluffy', 'giggly', 'snazzy', 'zippy', 'wacky', 
  'magical', 'quirky', 'sparkly', 'bubbly', 'wobbly', 'jazzy', 'cosmic'
];

const funnyNouns = [
  'penguin', 'panda', 'unicorn', 'koala', 'potato', 'banana', 'llama', 'sloth', 
  'donut', 'cupcake', 'raccoon', 'muffin', 'ninja', 'robot', 'wizard'
];

/**
 * Generate a fun random username
 * @param name Optional name to use as base for the username
 * @returns A generated username
 */
export const generateUsername = (name?: string) => {
  const randomAdjective = funnyAdjectives[Math.floor(Math.random() * funnyAdjectives.length)];
  const randomNoun = funnyNouns[Math.floor(Math.random() * funnyNouns.length)];
  
  // If a name is provided, try to use the first part as a base
  let baseUsername = '';
  if (name && name.trim().length > 0) {
    // Take first name or first part before space and lowercase it
    baseUsername = name.trim().split(' ')[0].toLowerCase();
    
    // Combine with random words to make it unique
    return `${baseUsername}${randomAdjective}${randomNoun}`;
  }
  
  // If no name provided, just use the random words with a random number
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};
