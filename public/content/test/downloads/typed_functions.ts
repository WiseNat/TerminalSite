// From v1.0 TerminalSite
// @ts-expect-error eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getFile(path: string): Promise<string | null> {
  return fetch(path)
    .then((response) => {
      if (response.ok) {
        return response.text();
      }
      return null;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
}

// Remove pesky \r
// @ts-expect-error eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function removeCarriage(str: string): string {
  return str.replace(/[\r]+/gm, "");
}

// Returns the difference of two strings
// @ts-expect-error eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findDiff(str1: string, str2: string): string {
  let diff = "";
  str2.split("").forEach(function (val, i) {
    if (val !== str1.charAt(i)) diff += val;
  });
  return diff;
}

// Removes <div><br></div>
// @ts-expect-error eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function noOddHTML(s: string): string {
  return s.replaceAll(/<div>|<\/div>|<br>/gm, "");
}
