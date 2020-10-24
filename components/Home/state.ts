import {} from "@app/prelude"
import * as As from "@effect-ts/core/Async"
import * as Assoc from "@effect-ts/core/Classic/Associative"
import * as Ord from "@effect-ts/core/Classic/Ord"
import { tag } from "@effect-ts/core/Has"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"
import type { _A, _E } from "@effect-ts/core/Utils"
import { matchTag } from "@effect-ts/core/Utils"
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

  function propagateExit(ex: As.Exit<_E<ReturnType<typeof getOrg>>, readonly Org[]>) {
    ex["|>"](
      matchTag({
        Success: ({ a }) => {
          state.current = new Done(a)
        },
        Failure: ({ e }) => {
          state.current = new Error(e)
        },
        Interrupt: () => {
          state.current = new Interrupted()
        }
      })
    )
  }

  const maxNumber = Assoc.fold(Assoc.join(Ord.ordNumber))(0)

  function getLastId() {
    return state.current["|>"](
      matchTag(
        {
          Done: ({ value }) => maxNumber(value.map((_) => _.id))
        },
        () => 0
      )
    )
  }

  function next() {
    const current = getLastId()

    const cancel = As.runAsync(getOrg(current), propagateExit)

    state.current = new Loading()

    return cancel
  }

  return {
    state,
    next,
    propagateExit
  }
})

export interface HomeState extends _A<typeof makeHomeSate> {}

export const HomeState = tag<HomeState>()

export const LiveHomeState = Sl.fromSync(HomeState)(makeHomeSate)

export type StateError<S extends State<any, any>> = [S] extends [
  State<infer E, infer A>
]
  ? E
  : never
