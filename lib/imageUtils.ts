export function encodeImagePath(folder: string, file: string): string {
  const encodedFile = file
    .split("")
    .map((c) => {
      if (c === " ") return "%20";
      if (c === "º") return "%C2%BA";
      return c;
    })
    .join("");
  return `/images/${folder}/${encodedFile}`;
}
