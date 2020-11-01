import { Github } from "@app/github"
import {} from "@app/prelude"
import { HomeState } from "@components/Home/state"
import { runPromiseExit } from "@effect-ts/core/Async"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"
import type { NextPage } from "next"

import { Home, LiveHome } from "../components/Home"

export const { HomePage, getOrg } = Sy.gen(function* (_) {
  const { getOrg } = yield* _(Github)
  const HomeComponent = yield* _(Home)
  const { propagateExit } = yield* _(HomeState)

  const NextPage: NextPage<{
    initial: Parameters<typeof propagateExit>[0]
  }> = ({ initial }) => {
    propagateExit(initial)
    return <HomeComponent />
  }

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
