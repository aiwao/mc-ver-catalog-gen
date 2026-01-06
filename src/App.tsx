import {useEffect, useState} from "react"
import './App.css'
import {Box, Button, FormControlLabel, IconButton, Slider, Switch, Tooltip} from "@mui/material"
import {Controller, type SubmitHandler, useForm} from "react-hook-form"
import {
  type GameVersion,
  getApiVersionForMinecraft,
  getGameVersions,
  getMinecraftYarnVersions, type YarnVersion
} from "./api/fabric.ts"
import {ArrowForward, ContentCopy} from "@mui/icons-material"
import {getNeoForgeVersions} from "./api/neoforge.ts"

type GenFormData = {
  versionRange: number[],
  minecraft: boolean,
  yarn: boolean,
  api: boolean,
  neoForge: boolean
}

function App() {
  const [verMap, setVerMap] = useState<Map<number, string>>(new Map())
  const [yarnVerMap, setYarnVerMap] = useState<Map<number, string>>(new Map())
  const [apiVerMap, setApiVerMap] = useState<Map<number, string>>(new Map())
  const [neoForgeVerMap, setNeoForgeVerMap] = useState<Map<number, string>>(new Map())
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rangeText, setRangeText] = useState("")
  const [maxValue, setMaxValue] = useState(0)
  const { control, handleSubmit, setValue } = useForm<GenFormData>({
    defaultValues: {
      versionRange: [0, 0],
      minecraft: true,
      yarn: true,
      api: true,
      neoForge: true,
    }
  })
  const [catalog, setCatalog] = useState<string | null>(null)

  const getVerText = (map: Map<number, string>, value: number): string => {
    const ver = map.get(value)
    if (ver) return ver
    return "undefined"
  }

  const handleCopy = () => {
    if (catalog)
      navigator.clipboard.writeText(catalog)
  }

  const onGenSubmit: SubmitHandler<GenFormData> = (data) => {
    const verSectionMap: Map<string, string[]> = new Map()
    const libSectionMap: Map<string, string[]> = new Map()
    const addCatalog = (map: Map<number, string>, index: number, prefix: string, maven: string, mcVer: string) => {
      const ver = map.get(index)
      if (ver) {
        const verSection = verSectionMap.get(prefix) ?? []
        const name = `${prefix}-mc${mcVer.replace(/\D/g, "")}`
        verSection.push(`${name} = "${ver}"`)
        verSectionMap.set(prefix, verSection)
        const libSection = libSectionMap.get(prefix) ?? []
        libSection.push(`${name} = { module = "${maven}", version.ref = "${name}" }`)
        libSectionMap.set(prefix, libSection)
      }
    }
    for (let i = data.versionRange[0]; i <= data.versionRange[1]; i++) {
      const mcVer = verMap.get(i)
      if (mcVer) {
        if (data.minecraft) addCatalog(verMap, i, "minecraft", "com.mojang:minecraft", mcVer)
        if (data.yarn) addCatalog(yarnVerMap, i, "yarn", "net.fabricmc:yarn", mcVer)
        if (data.api) addCatalog(apiVerMap, i, "fabric", "net.fabricmc.fabric-api:fabric-api", mcVer)
        if (data.neoForge) addCatalog(neoForgeVerMap, i, "neoforge", "net.neoforged:neoforge", mcVer)
      }
    }
    if (verSectionMap.size != 0 && libSectionMap.size != 0) {
      const verSection: string[] = []
      const libSection: string[] = []
      for (const value of [...verSectionMap.values()]) {
        verSection.push(...value)
      }
      for (const value of [...libSectionMap.values()]) {
        libSection.push(...value)
      }
      setCatalog(`[versions]\n${verSection.join("\n")}\n\n[libraries]\n${libSection.join("\n")}`)
    }
  }

  useEffect(() => {
    const fetchVersions = async () => {
      let mcVersions: GameVersion[]
      try {
        mcVersions = await getGameVersions()
      } catch (e) {
        console.error(e)
        throw new Error("failed to fetch minecraft versions")
      }
      const stableVersions = mcVersions
        .filter(v => v.stable)
        .reverse()
      const neoForgeVersions = await getNeoForgeVersions()
      const tempVerMap = new Map<number, string>()
      const tempYarnVerMap = new Map<number, string>()
      const tempApiVerMap = new Map<number, string>()
      const tempNeoForgeVerMap = new Map<number, string>()

      for (let i = 0; i < stableVersions.length; i++) {
        const gameVer = stableVersions[i]
        const gameVerStr = gameVer.version
        tempVerMap.set(i, gameVerStr)
        let yarnVerForGameVer: YarnVersion[]
        try {
          yarnVerForGameVer = await getMinecraftYarnVersions(gameVerStr)
        } catch (e) {
          console.error(e)
          throw new Error(`failed to fetch yarn version for ${gameVerStr}`)
        }
        if (yarnVerForGameVer.length != 0)
          tempYarnVerMap.set(i, yarnVerForGameVer.shift()!.version)
        let apiVerForGameVer: string
        try {
          apiVerForGameVer = await getApiVersionForMinecraft(gameVerStr)
        } catch (e) {
          console.error(e)
          throw new Error(`failed to fetch fabric-api version for ${gameVerStr}`)
        }
        tempApiVerMap.set(i, apiVerForGameVer)
        const neoForgeVer = neoForgeVersions.get(gameVerStr)
        if (neoForgeVer) {
          tempNeoForgeVerMap.set(i, neoForgeVer!)
        }
      }

      const versionSize = tempVerMap.size-1
      setMaxValue(versionSize)
      setValue("versionRange", [0, versionSize])
      setVerMap(tempVerMap)
      setYarnVerMap(tempYarnVerMap)
      setApiVerMap(tempApiVerMap)
      setNeoForgeVerMap(tempNeoForgeVerMap)
      setRangeText(`${getVerText(tempVerMap, 0)} - ${getVerText(tempVerMap, versionSize)}`)
    }
    fetchVersions()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {loading &&
        <p>Loading</p>
      }
      {error &&
        <>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </>
      }
      {!loading && !error &&
        <Box
          component="form"
          sx={{ width: 300, display: "flex", flexDirection: "column", gap:5}}
          onSubmit={handleSubmit(onGenSubmit)}
        >
          <Box>
            <p>{rangeText}</p>
            <Controller name="versionRange" control={control} render={({ field }) => (
              <Slider
                {...field}
                valueLabelDisplay="auto"
                min={0}
                max={maxValue}
                value={field.value}
                onChange={(e, v) => {
                  setRangeText(`${getVerText(verMap, v[0])} - ${getVerText(verMap, v[1])}`)
                  field.onChange(e)
                }}
                valueLabelFormat={(v) => getVerText(verMap, v)}
              />
            )}>
            </Controller>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Controller name="minecraft" control={control} render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Switch checked={field.value} defaultChecked />}
                label="Minecraft"
              />
            )}>
            </Controller>
            <Controller name="yarn" control={control} render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Switch checked={field.value} defaultChecked />}
                label="Yarn"
              />
            )}>
            </Controller>
            <Controller name="api" control={control} render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Switch checked={field.value} defaultChecked />}
                label="Fabric API"
              />
            )}>
            </Controller>
            <Controller name="neoForge" control={control} render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Switch checked={field.value} defaultChecked />}
                label="Neo Forge"
              />
            )}>
            </Controller>
          </Box>
          <Button variant="contained" type="submit" endIcon={<ArrowForward/>}>Generate</Button>
          {catalog &&
            <Box
              sx={{
                position: "relative",
                backgroundColor: "#1e1e1e",
                color: "#fff",
                p: 2,
                borderRadius: 1,
                fontFamily: "monospace",
                whiteSpace: "pre",
              }}
            >
              <Tooltip title="Copy">
                <IconButton
                  onClick={handleCopy}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#fff",
                  }}
                  size="small"
                >
                  <ContentCopy fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <pre style={{ margin: 0, textAlign: "start", padding: 2, overflowX: "scroll" }}>
                <code>{catalog}</code>
              </pre>
            </Box>
          }
        </Box>
      }
    </>
  )
}

export default App
