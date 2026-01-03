// //https://neoforged.net/js/neoforge.js
// const VERSIONS_ENDPOINT = "https://maven.neoforged.net/api/maven/versions/releases/"
// const FALLBACK_VERSIONS_ENDPOINT = "https://maven.creeperhost.net/api/maven/versions/releases/"
// const NEOFORGE_GAV = "net/neoforged/neoforge"
// const LEGACY_GAV = "net/neoforged/forge"
// const LATEST_ENDPOINT = "https://maven.neoforged.net/api/maven/latest/version/releases/"
// const DOWNLOAD_URL = "https://maven.neoforged.net/releases"
// // For the latest version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge
// // For legacy version(s): https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/forge?filter=1.20.1
// // To filter a specific MC version: https://maven.neoforged.net/api/maven/latest/version/releases/net/neoforged/neoforge?filter=20.4
// let latestNeoForgeVersion: string | undefined = undefined;
//
// async function loadVersions() {
//   // Reminder, this endpoint will return all NeoForge versions with April Fools versions first, then oldest to newest versions afterwards.
//   const allVersionUrl = new URL(VERSIONS_ENDPOINT + encodeURIComponent(NEOFORGE_GAV));
//   let neoforgeVersionsJson;
//   try {
//     const response = await fetch(allVersionUrl);
//     neoforgeVersionsJson = await response.json();
//   } catch {
//     // Main maven is down. We will use fallback URL to get NeoForge installers. Permission was granted by CreeperHost to do this.
//     const fallbackAllVersionUrl = new URL(FALLBACK_VERSIONS_ENDPOINT + encodeURIComponent(NEOFORGE_GAV));
//     try {
//       const response = await fetch(fallbackAllVersionUrl);
//       neoforgeVersionsJson = await response.json();
//     } catch (error) {
//       if (error instanceof SyntaxError) {
//         throw new Error("There was a SyntaxError parsing the JSON response from the fallback maven server.")
//       } else {
//         throw new Error("There was an error processing the request for a new version from the fallback maven server.")
//       }
//     }
//   }
//
//   if (neoforgeVersionsJson) {
//     // Extract all NeoForge versions.
//     const {versions} = neoforgeVersionsJson;
//
//     // Using a set to prevent duplicate minecraft versions quickly as we extract the Minecraft versions from the NeoForge versions.
//     const minecraftVersions = new Set([]);
//     let latestMinecraftVersion: string | undefined = undefined;
//
//     // Versions url always gives list of versions from oldest to newest (exception of april fools versions)
//     // So iterating backwards will let us have newest be first option
//     for (let index = versions.length - 1; index >= 0; index--) {
//       const neoVersion = versions[index];
//       const mcVersion = getMcVersionFromNeoForgeVersion(neoVersion);
//
//       // Remove 0.25w14craftmine and other april fools versions
//       if (neoVersion.startsWith("0")) continue;
//
//       // Set the versions if not already set (only for non-alpha versions, as to not promote snapshots by default)
//       if (!neoVersion.includes("-alpha")) {
//         if (latestNeoForgeVersion === undefined) latestNeoForgeVersion = neoVersion;
//         if (latestMinecraftVersion === undefined) latestMinecraftVersion = mcVersion;
//       }
//
//       // Get and push version lists
//       let neoVersionList = undefined;
//       if (!allNeoforgeVersions.has(mcVersion)) {
//         minecraftVersions.add(mcVersion);
//         neoVersionList = [];
//         allNeoforgeVersions.set(mcVersion, neoVersionList);
//       } else {
//         neoVersionList = allNeoforgeVersions.get(mcVersion);
//       }
//       neoVersionList.push(neoVersion);
//     }
//
//     // Sorts the mc versions so newest is topmost. We can't sort a set so convert to array first.
//     const sortedMinecraftVersion = Array.from(minecraftVersions).sort(function (a: string,b: string) {
//       return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
//     });
// }
//
// export function getMcVersionFromNeoForgeVersion(versionString: string): string {
//   const spl = versionString.split('.');
//   // Handle the new versioning scheme first
//   if (parseInt(spl[0]) >= 26) {
//     // 26.1.0.X -> 26.1
//     let mcVersion = spl[0] + '.' + spl[1];
//     // 26.1.1.X -> 26.1.1
//     if (spl[2] != '0') {
//       mcVersion += '.' + spl[2];
//     }
//
//     // 26.1.0.0-alpha+snapshot-1
//     const splitBySnapshotIdentifier = versionString.split('+');
//     if (splitBySnapshotIdentifier.length == 2) {
//       mcVersion += '-' + splitBySnapshotIdentifier[1];
//     }
//     return mcVersion;
//   }
//   return "1." + getFirstTwoVersionNumbers(versionString);
// }
//
// function getFirstTwoVersionNumbers(versionString: string) {
//   const splitVersion = versionString.split('.');
//   return `${splitVersion[0]}.${splitVersion[1]}`;
// }
//
// function getLastTwoVersionNumbers(versionString: string) {
//   return versionString.substring(versionString.indexOf('.') + 1);
// }