import {} from "@app/prelude"
import * as As from "@effect-ts/core/Async"
import { tag } from "@effect-ts/core/Has"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"
import type { _A } from "@effect-ts/core/Utils"
import { _E, matchTag } from "@effect-ts/core/Utils"
import { observer } from "mobx-react"
import React from "react"

import { LiveGithub } from "../../src/github"
import type { Org } from "../../src/model"
import * as State from "./state"

export const makeHome = Sy.gen(function* (_) {
  const { next, state } = yield* _(State.HomeState)

  function Init() {
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

  function Error({ message }: { message: string }) {
    return <div>Error: {message}</div>
  }

  function Interrupted() {
    return <div>Interrupted</div>
  }

  return {
    HomeView: observer(() => {
      React.useEffect(() => {
        if (state.current._tag === "Init") {
          return next()
        }
      }, [])

      return state.current["|>"](
        matchTag({
          Done: ({ value }) => <Done orgs={value} />,
          Error: ({ error }) => <Error message={JSON.stringify(error)} />,
          Init: () => <Init />,
          Interrupted: () => <Interrupted />,
          Loading: () => <Loading />
        })
      )
    })
  }
})

export interface Home extends _A<typeof makeHome> {}
export const Home = tag<Home>()

export const LiveHome = Sl.fromSync(Home)(makeHome)
  ["<<<"](State.LiveHomeState)
  ["<<<"](LiveGithub)
