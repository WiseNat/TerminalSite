// From v1.0 TerminalSite, cleaned to make ESLint not shout
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getFile(path) {
  return fetch(path)
    .then(response => {
      if (response.ok) {
        return response.text();
      }
      return null;
    })
    .catch(error => {
      console.error(error);
      return null;
    });
}

// Remove pesky \r
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function removeCarriage(str) {
  return str.replace(/[\r]+/gm, "");
}


// Returns the difference of two strings
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findDiff(str1, str2) {
  let diff = "";
  str2.split("").forEach(function (val, i) {
    if (val !== str1.charAt(i)) diff += val;
  });
  return diff;
}


// Removes <div><br></div>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function noOddHTML(s) {
  return s.replaceAll(/<div>|<\/div>|<br>/gm, "");
}
