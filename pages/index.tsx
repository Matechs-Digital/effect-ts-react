import {} from "@app/prelude"
import * as Sy from "@effect-ts/core/Sync"
import * as Sl from "@effect-ts/core/Sync/Layer"

import { Home, LiveHome } from "../components/Home"

export const HomePage = Sy.readService(Home)
  ["|>"](Sl.provideSyncLayer(LiveHome))
  ["|>"](Sy.run)

export default HomePage
