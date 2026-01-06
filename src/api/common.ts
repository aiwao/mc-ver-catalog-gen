export const xmlVersionParser = (xml: string): string[]  => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  return Array.from(xmlDoc.getElementsByTagName("version")).map((v) => v.childNodes[0].nodeValue as string)
}