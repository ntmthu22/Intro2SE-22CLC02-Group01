export const getCurrentTime = () => {
  const now = new Date();
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString();
};

export const extractDateAndName = (filename) => {
  const filenameWithoutPrefix = filename.slice(7);
  const [dateString, name] = filenameWithoutPrefix.split("_");

  const date = new Date(dateString);

  const options = {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  };
  const formattedDate = date.toLocaleString("en-US", options);

  return { date: formattedDate, name };
};
