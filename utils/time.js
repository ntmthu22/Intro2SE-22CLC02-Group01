export const extractLocalDate = (date) => {
  const options = {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
};

export const extractDateAndName = (filename) => {
  const filenameWithoutPrefix = filename.slice(7);
  const [dateString, name] = filenameWithoutPrefix.split("_");

  const date = new Date(dateString);

  const formattedDate = extractLocalDate(date);

  return { date: formattedDate, name };
};
