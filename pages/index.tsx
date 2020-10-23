import "@effect-ts/core/Operators"

import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"

import { Home, LiveHome } from "../components/Home"

export const HomePage = Sy.accessService(Home)((_) => _.HomeView)
  ["|>"](Sl.provideSyncLayer(LiveHome))
  ["|>"](Sy.run)

export default HomePage
