import * as As from "@effect-ts/core/Async"
import { tag } from "@effect-ts/core/Has"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"
import type { _A, _E } from "@effect-ts/core/Utils"
import { observer } from "mobx-react"
import React from "react"

import { Github, LiveGithub } from "../../src/github"
import type { Org } from "../../src/model"
import * as State from "./state"

export const makeHome = Sy.gen(function* (_) {
  const { getOrg } = yield* _(Github)
  const { state } = yield* _(State.HomeState)

  function propagate(ex: As.Exit<_E<ReturnType<typeof getOrg>>, readonly Org[]>) {
    switch (ex._tag) {
      case "Interrupt": {
        state.current = new State.Interrupted()
        return
      }
      case "Failure": {
        state.current = new State.Error(ex.e)
        return
      }
      case "Success": {
        state.current = new State.Done(ex.a)
        return
      }
    }
  }

  function Init() {
    React.useEffect(() => As.runAsync(getOrg(), propagate), [])
    return <div>Init</div>
  }

  function Done({ orgs }: { orgs: readonly Org[] }) {
    if (orgs.length > 0) {
      return (
        <>
          {orgs.map((o) => (
            <div key={o.id}>{o.login}</div>
          ))}
        </>
      )
    }
    return <div>Done</div>
  }

  function Loading() {
    return <div>Loading</div>
  }

  function Error<E>(p: { e: State.Error<E> }) {
    return <div>Error: {JSON.stringify(p.e)}</div>
  }

  function Interrupted() {
    return <div>Interrupted</div>
  }

  return {
    HomeView: observer(() => {
      switch (state.current._tag) {
        case "Done": {
          return <Done orgs={state.current.value} />
        }
        case "Error": {
          return <Error e={state.current} />
        }
        case "Init": {
          return <Init />
        }
        case "Loading": {
          return <Loading />
        }
        case "Interrupted": {
          return <Interrupted />
        }
      }
    })
  }
})

export interface Home extends _A<typeof makeHome> {}
export const Home = tag<Home>()

export const LiveHome = Sl.fromSync(Home)(makeHome)
  ["<<<"](State.LiveHomeState)
  ["<<<"](LiveGithub)
