const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/"
const FALLBACK_VERSIONS_ENDPOINT = "https://maven.creeperhost.net/api/maven/versions/releases/"
const NEOFORGE_GAV = "net/neoforged/neoforge"
// For the latest version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge
// For legacy version(s): https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/forge?filter=1.20.1
// To filter a specific MC version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=20.4

export async function getNeoForgeVersions(): Promise<Map<string, string>> {
  // Reminder, this endpoint will return all NeoForge versions with April Fools versions first, then oldest to newest versions afterwards.
  const allVersionUrl = new URL(VERSIONS_ENDPOINT + encodeURIComponent(NEOFORGE_GAV));
  let neoforgeVersionsJson;
  try {
    const response = await fetch(allVersionUrl);
    neoforgeVersionsJson = await response.json();
  } catch {
    // Main maven is down. We will use fallback URL to get NeoForge installers. Permission was granted by CreeperHost to do this.
    const fallbackAllVersionUrl = new URL(FALLBACK_VERSIONS_ENDPOINT + encodeURIComponent(NEOFORGE_GAV));
    try {
      const response = await fetch(fallbackAllVersionUrl);
      neoforgeVersionsJson = await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("There was a SyntaxError parsing the JSON response from the fallback maven server.")
      } else {
        throw new Error("There was an error processing the request for a new version from the fallback maven server.")
      }
    }
  }

  const neoVersionMap: Map<string, string> = new Map<string, string>()
  if (neoforgeVersionsJson) {
    // Extract all NeoForge versions.
    const {versions} = neoforgeVersionsJson;

    // Versions url always gives list of versions from oldest to newest (exception of april fools versions)
    // So iterating backwards will let us have newest be first option
    for (let index = versions.length - 1; index >= 0; index--) {
      const neoVersion = versions[index];
      const mcVersion = getMcVersionFromNeoForgeVersion(neoVersion);
      if (neoVersionMap.get(mcVersion))
        continue

      // Remove 0.25w14craftmine and other april fools versions
      if (neoVersion.startsWith("0")) continue;

      neoVersionMap.set(mcVersion, neoVersion)
    }
  }

  return neoVersionMap
}

export function getMcVersionFromNeoForgeVersion(versionString: string): string {
  const spl = versionString.split('.');
  // Handle the new versioning scheme first
  if (parseInt(spl[0]) >= 26) {
    // 26.1.0.X -> 26.1
    let mcVersion = spl[0] + '.' + spl[1];
    // 26.1.1.X -> 26.1.1
    if (spl[2] != '0') {
      mcVersion += '.' + spl[2];
    }

    // 26.1.0.0-alpha+snapshot-1
    const splitBySnapshotIdentifier = versionString.split('+');
    if (splitBySnapshotIdentifier.length == 2) {
      mcVersion += '-' + splitBySnapshotIdentifier[1];
    }
    return mcVersion;
  }
  return "1." + getFirstTwoVersionNumbers(versionString);
}

function getFirstTwoVersionNumbers(versionString: string) {
  const splitVersion = versionString.split('.');
  return `${splitVersion[0]}.${splitVersion[1]}`;
}