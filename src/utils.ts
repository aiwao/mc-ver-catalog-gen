// import {z} from "zod"
//
// const BASE_URL = "https://meta.fabricmc.net/v2/versions"
// const GAME_VER_URL = BASE_URL + "/game"
// const YARN_VER_URL = BASE_URL + "/yarn"
//
// const GameResponse = z.array(
//   z.object({
//     version: z.string(),
//     stable: z.boolean(),
//   })
// )
// type GameResponse = z.infer<typeof GameResponse>
//
// const YarnResponse = z.array(
//   z.object({
//     gameVersion: z.string(),
//     separator: z.string(),
//     build: z.number(),
//     maven: z.string(),
//     version: z.string(),
//     stable: z.boolean(),
//   })
// )
// type YarnResponse = z.infer<typeof YarnResponse>
//
// export async function getVersions(): Promise<GameResponse> {
//   let res: Response
//   let json: JSON
//   try {
//     res = await fetch(GAME_VER_URL)
//     json = await res.json()
//   } catch {
//     throw new Error("failed to fetch")
//   }
//   const result = GameResponse.safeParse(json)
//   if (!result.success) {
//     throw new Error(result.error.message)
//   }
//   return result.data
// }
//
// export async function getYarnVersion(): Promise<YarnResponse> {
//   let res: Response
//   let json: JSON
//   try {
//     res = await fetch(YARN_VER_URL)
//     json = await res.json()
//   } catch {
//     throw new Error("failed to fetch")
//   }
//   const result = YarnResponse.safeParse(json)
//   if (!result.success) {
//     throw new Error(result.error.message)
//   }
//   return result.data
// }