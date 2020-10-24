import {} from "@app/prelude"
import { tag } from "@effect-ts/core/Has"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"
import type { _A } from "@effect-ts/core/Utils"
import { _E, matchTag, onAdtElement } from "@effect-ts/core/Utils"
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

  function Error({
    error
  }: {
    error: State.StateError<typeof state> | State.Interrupted
  }) {
    return error["|>"](
      matchTag({
        DecodeError: () => <div>something wrong with the payload decoding</div>,
        HttpError: () => <div>something wrong with the http request</div>,
        JsonError: () => <div>something wrong with the json decoding</div>,
        Interrupted: () => <div>the http request was interrupted</div>
      })
    )
  }

  return {
    HomeView: observer(() => {
      React.useEffect(() => {
        state.current["|>"](
          onAdtElement("Init", () => {
            next()
          })
        )
      }, [])

      return state.current["|>"](
        matchTag({
          Done: ({ value }) => <Done orgs={value} />,
          Error: ({ error }) => <Error error={error} />,
          Init: () => <Init />,
          Interrupted: (error) => <Error error={error} />,
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
