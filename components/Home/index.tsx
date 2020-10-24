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

  function Error({ message }: { message: string }) {
    return <div>Error: {message}</div>
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
          Error: ({ error }) =>
            error["|>"](
              matchTag({
                DecodeError: () => (
                  <Error message={"something wrong with the payload decoding"} />
                ),
                HttpError: () => (
                  <Error message={"something wrong with the http request"} />
                ),
                JsonError: () => (
                  <Error message={"something wrong with the json decoding"} />
                )
              })
            ),
          Init: () => <Init />,
          Interrupted: () => <Error message={"http request was interrupted"} />,
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
