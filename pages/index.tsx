import { Github } from "@app/github"
import type { Org } from "@app/model"
import {} from "@app/prelude"
import type { StateError } from "@components/Home/state"
import { HomeState } from "@components/Home/state"
import type { Exit } from "@effect-ts/core/Async"
import { runPromiseExit } from "@effect-ts/core/Async"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"
import { observer } from "mobx-react"
import type { NextPage } from "next"

import { Home, LiveHome } from "../components/Home"

export const { HomePage, getOrg } = Sy.gen(function* (_) {
  const { getOrg } = yield* _(Github)
  const HomeComponent = yield* _(Home)
  const { propagateExit } = yield* _(HomeState)

  const NextPage: NextPage<{
    initial: Parameters<typeof propagateExit>[0]
  }> = observer(({ initial }) => {
    propagateExit(initial)
    return <HomeComponent />
  })

  return {
    HomePage: NextPage,
    getOrg
  }
})
  ["|>"](Sl.provideSyncLayer(LiveHome))
  ["|>"](Sy.run)

HomePage.getInitialProps = async () => {
  const initial = await runPromiseExit(getOrg())

  return {
    initial
  }
}

export default HomePage
