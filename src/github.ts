import * as As from "@effect-ts/core/Async"
import { tag } from "@effect-ts/core/Has"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"
import type { _A } from "@effect-ts/core/Utils"

import { Http, LiveHttp } from "./http"
import { decodeOrgArray } from "./model"

export const makeGithub = Sy.gen(function* (_) {
  const { getJson } = yield* _(Http)

  return {
    getOrg: (from = 0) =>
      As.gen(function* (_) {
        const res = yield* _(
          getJson(`https://api.github.com/organizations?since=${from}`)
        )

        return yield* _(decodeOrgArray(res))
      })
  }
})

export interface Github extends _A<typeof makeGithub> {}

export const Github = tag<Github>()

export const LiveGithub = Sl.fromSync(Github)(makeGithub)["<<<"](LiveHttp)
