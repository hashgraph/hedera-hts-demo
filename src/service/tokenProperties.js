export function loadTokenTemplates(path = "tokenTemplates.json") {
  let result = null;
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", path, false);
  xmlhttp.send();
  if (xmlhttp.status === 200) {
    result = xmlhttp.responseText;
  }
  return JSON.parse(result);
}
