import globcb from 'glob'
import util from 'util'
import path from 'node:path'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'

const glob = util.promisify(globcb)

const oauthConf = {
  clientId: process.env.DRIVE_CLIENT_ID,
  clientSecret: process.env.DRIVE_CLIENT_SECRET
}

const useOauth = !!(process.env.DRIVE_USE_OAUTH?.toLowerCase() !== 'false' && (oauthConf.clientId && oauthConf.clientSecret))
const serviceAccounts = !useOauth && (await glob('service_accounts/*.json') || await glob('/service_accounts/*.json'))

if (!useOauth && !serviceAccounts.length) {
  throw new Error(`No valid authentication method found. Either set DRIVE_CLIENT_ID, DRIVE_CLIENT_SECRET and DRIVE_TOKEN or put service accounts in ${path.join(process.cwd(), 'service_accounts')} or /service_accounts`)
}

try {
  oauthConf.token = JSON.parse(process.env.DRIVE_TOKEN)
} catch (e) {
  throw new Error('DRIVE_TOKEN is not valid JSON.')
}

let authClient

if (useOauth) {
  const oAuth2Client = new OAuth2Client(oauthConf.clientId, oauthConf.clientSecret)
  oAuth2Client.setCredentials(oauthConf.token)
  authClient = oAuth2Client
}

const drive = google.drive({ version: 'v3', auth: authClient })
export default drive
