import * as M from "@effect-ts/morphic"
import * as D from "@effect-ts/morphic/Decoder"

const Org_ = M.make((F) =>
  F.interface({
    login: F.string(),
    id: F.number(),
    node_id: F.string(),
    url: F.nullable(F.string()),
    repos_url: F.nullable(F.string()),
    events_url: F.nullable(F.string()),
    hooks_url: F.nullable(F.string()),
    issues_url: F.nullable(F.string()),
    members_url: F.nullable(F.string()),
    public_members_url: F.nullable(F.string()),
    avatar_url: F.nullable(F.string()),
    description: F.nullable(F.string())
  })
)

export interface Org extends M.AType<typeof Org_> {}
export interface OrgRaw extends M.EType<typeof Org_> {}

export const Org = M.opaque<OrgRaw, Org>()(Org_)

export const decodeOrg = D.decoder(Org).decode
export const decodeOrgArray = D.decoder(M.make((F) => F.array(Org(F)))).decode
