import {xmlVersionParser} from "./common.ts"

const MAVEN_URL = "https://maven.minecraftforge.net/net/minecraftforge/forge/"

export async function getForgeVersions() {
  const res = await fetch(MAVEN_URL+"maven-metadata.xml")
  if (!res.ok) {
    throw new Error("failed to fetch maven-metadata")
  }
  const text = await res.text();
  const versions = xmlVersionParser(text)
  if (!versions) {
    throw new Error("failed to parse maven-metadata")
  }
  const latestVersions = versions.
}