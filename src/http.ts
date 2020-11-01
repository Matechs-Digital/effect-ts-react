import * as As from "@effect-ts/core/Async"
import { tag } from "@effect-ts/core/Has"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"
import type { _A } from "@effect-ts/core/Utils"

export const makeFetch = () => {
  return {
    fetch
  }
}

export interface Fetch extends ReturnType<typeof makeFetch> {}

export const Fetch = tag<Fetch>()

export const FetchLive = Sl.fromFunction(Fetch)(makeFetch)

export class HttpError {
  readonly _tag = "HttpError"
  constructor(readonly error: unknown) {}
}
export class JsonError {
  readonly _tag = "JsonError"
  constructor(readonly error: unknown) {}
}

export const makeHttp = Sy.gen(function* (_) {
  const { fetch } = yield* _(Fetch)

  return {
    getJson: (url: string) =>
      As.gen(function* (_) {
        const res = yield* _(As.promise((u) => new HttpError(u))(() => fetch(url)))

        const json: unknown = yield* _(
          As.promise((u) => new JsonError(u))(() => res.json())
        )

        return json
      })
  }
})

export interface Http extends _A<typeof makeHttp> {}

export const Http = tag<Http>()

export const LiveHttp = Sl.fromSync(Http)(makeHttp)["<<<"](FetchLive)
