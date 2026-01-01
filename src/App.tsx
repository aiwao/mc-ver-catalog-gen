import {useEffect, useState} from 'react'
import './App.css'
import {Box, Button, FormControlLabel, Slider, Switch} from "@mui/material"
import {Controller, type SubmitHandler, useForm} from "react-hook-form"
import {getApiVersions, getGameVersions, getYarnVersions} from "./fabric/api.ts"

type GenFormData = {
  versionRange: number[],
  yarn: boolean,
  minecraft: boolean,
  fabric: boolean,
}

function App() {
  const [verMap, setVerMap] = useState<Map<number, string>>(new Map())
  const [yarnVerMap, setYarnVerMap] = useState<Map<string, string>>
  const [fabricVerMap, setFabricVerMap] = useState<Map<string, string>>
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [maxValue, setMaxValue] = useState(0)
  const [catalog, setCatalog] = useState<Catalog | null>(null)

  const { control, handleSubmit } = useForm<GenFormData>({
    defaultValues: {
      versionRange: [0, 0],
      yarn: true,
      minecraft: true,
      fabric: true
    }
  })

  const catalogToText = (value: Catalog): string => {
    const versions = value.versions
    const versionSection = "[versions]\n"
      +versions
        .map(v => v.version.map(v2 => v.prefix+v2.replaceAll(".", "")))
        .join("\n")

    const libraries = value.libraries
    const librarySection = "[libraries]\n"
      +libraries
        .map(v => v.versions.version.map(v2 => `{ module = ${v.module}, version.ref = "${v.versions.version+v2}" }`))
        .join("\n")

    return versionSection+"\n\n"+librarySection
  }

  const getVerText = (value: number): string => {
    const ver = verMap.get(value)
    if (ver) return ver
    return "undefined"
  }

  const onGenSubmit: SubmitHandler<GenFormData> = (data) => {
    const yarnVersions: string[] = []
    const mcVersions: string[] = []
    const fabricVersions: string[] = []
    for (let i = data.versionRange[0]; i <= data.versionRange[1]; i++) {
      const mcVer = verMap.get(i)
      if (!mcVer) continue

      if (data.yarn) {
        const ver = yarnVerMap.get(mcVer)
        yarnVersions.push(ver)
      }
      if (data.minecraft) {
        mcVersions.push(mcVer)
      }
      if (data.fabric) {
        const ver = fabricVerMap.get(mcVer)
        fabricVersions.push(ver)
      }
    }
    const yarnVer = {
      prefix: "yarn",
      version: yarnVersions
    }
    const mcVer = {
      prefix: "mc",
      version: mcVersions
    }
    const fabricVer = {
      prefix: "fabric",
      version: fabricVersions
    }
    setCatalog({
      versions: [
        yarnVer,
        mcVer,
        fabricVer,
      ],
      libraries: [
        {
          module: "net.fabricmc:yarn",
          versions: yarnVer
        },
        {
          module: "com.mojang:minecraft",
          versions: mcVer
        },
        {
          module: "net.fabricmc.fabric-api:fabric-api",
          versions: fabricVer
        }
      ]
    })
  }

  useEffect(() => {
    const fetchVersions = async () => {
      const yarnVersions = await getYarnVersions()
      const mcVersions = await getGameVersions()
    }
    fetchVersions()
  }, [])

  return (
    <>
      {loading &&
        <p>Loading</p>
      }
      {!loading && !error &&
        <Box
          component="form"
          sx={{ width: 300, display: "flex", flexDirection: "column", gap:5}}
          onSubmit={handleSubmit(onGenSubmit)}
        >
          <Box>
            <p>Versions</p>
            <Controller name="versionRange" control={control} render={({ field }) => (
              <Slider
                {...field}
                valueLabelDisplay="auto"
                min={0}
                max={maxValue}
                value={field.value}
                onChange={field.onChange}
                valueLabelFormat={(v) => getVerText(v)}
              />
            )}>
            </Controller>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Controller name="yarn" control={control} render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Switch checked={field.value} defaultChecked />}
                label="Yarn"
              />
            )}>
            </Controller>
            <Controller name="minecraft" control={control} render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Switch checked={field.value} defaultChecked />}
                label="Minecraft"
              />
            )}>
            </Controller>
            <Controller name="fabric" control={control} render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Switch checked={field.value} defaultChecked />}
                label="Fabric"
              />
            )}>
            </Controller>
          </Box>
          <Button type="submit">Generate</Button>
        </Box>
      }
      {error &&
        <>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </>
      }
      {catalog &&
        catalogToText(catalog)
      }
    </>
  )
}

export default App
