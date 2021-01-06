export function loadTokenTemplates() {
  let result = null;
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "tokenTemplates.json", false);
  xmlhttp.send();
  if (xmlhttp.status === 200) {
    result = xmlhttp.responseText;
  }
  return JSON.parse(result);
}
