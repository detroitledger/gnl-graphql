const db = require('./dist/db/models').default()
const DATADIR = '/Users/bc/gnl/data.detroitledger.org/profiles/gnl_profile/exporters'
const orgs = require(`${DATADIR}/orgs`).orgs
const org = orgs[0]

let o = await db.Organization.create({ name: 'test' })
let o2 = await db.Organization.create({ name: 'test2' })
let g = await db.Grant.create({ from: o.id, to: o2.id })


// sample queries:

await o.getOrganizationGrantsFunded()

await db.Organization.findAll({ include: [ 'OrganizationGrantsFunded', 'OrganizationGrantsReceived' ] })

await db.Grant.findAll({ include: [ 'GrantOrganizationFunder', 'GrantOrganizationRecipient' ] })
