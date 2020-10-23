import { tag } from "@effect-ts/core/Has"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"
import type { _A, _E } from "@effect-ts/core/Utils"
import { observable } from "mobx"

import { Github } from "../../src/github"
import type { Org } from "../../src/model"

export class Done<A> {
  readonly _tag = "Done"
  constructor(readonly value: A) {}
}

export class Init {
  readonly _tag = "Init"
}

export class Loading {
  readonly _tag = "Loading"
}

export class Interrupted {
  readonly _tag = "Interrupted"
}

export class Error<E> {
  readonly _tag = "Error"
  constructor(readonly error: E) {}
}

export interface State<E, A> {
  current: Init | Loading | Error<E> | Done<A> | Interrupted
}

export const makeHomeSate = Sy.gen(function* (_) {
  const { getOrg } = yield* _(Github)
  const state = observable(<State<_E<ReturnType<typeof getOrg>>, readonly Org[]>>{
    current: new Init()
  })

  return {
    state
  }
})

export interface HomeState extends _A<typeof makeHomeSate> {}

export const HomeState = tag<HomeState>()

export const LiveHomeState = Sl.fromSync(HomeState)(makeHomeSate)
