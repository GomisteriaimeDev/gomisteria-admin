const getFirstWordLowercase = (text: string) => {
  const words = text.split(" ");

  if (words.length === 0) {
    return "";
  }

  return words[0].toLowerCase();
};
export default getFirstWordLowercase;
