import log from './log.js'
import drive from './drive-auth.js'
import { encryptedFolder } from './crypt.js'

const driveIds = process.env.TEAM_DRIVES ? process.env.TEAM_DRIVES.split(',') : []
if (driveIds.length === 0) {
  log.info('No team drives configured, using default drive.')
}

async function getDriveAbout (driveId) {
  const about = await drive.about.get({ fields: '*', driveId })
  return about.data
}

async function doListQuery (driveId, query) {
  log.debug('Listing files', { driveId, query })
  log.info('what')
  const req = await drive.files.list({
    corpora: 'drive',
    driveId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    q: query
  })
  return req
}

export async function getObjectByName (driveId, name, folder = false) {
  const req = await doListQuery(driveId, `name='${name}'${folder ? " and mimeType = 'application/vnd.google-apps.folder'" : ''}`)
  if (req.data.files.length === 0) {
    log.debug(`No file found with name ${name} in ${driveId}`)
    return null
  } else if (req.data.files.length > 1) {
    log.debug(`Multiple files found with name ${name} in ${driveId}`, JSON.stringify(req.data.files))
    throw new Error(`Found multiple files with name ${name}`)
  }
  log.debug(`Found file with name ${name} in ${driveId}`, JSON.stringify(req.data.files[0]))
  return req.data.files[0]
}

export async function getObjectIdByName (driveId, name, folder = false) {
  return (await getObjectByName(driveId, name, folder)).id
}

/*
Query examples:
Nonrecursive show files in root PERSONAL folder: "'root' in parents and trashed = false"
Nonrecursive show files in X folder: "'1BHynDC0Doj8-dPynBPojQSP5m9xEsoXN' in parents and trashed = false"
*/
// if (driveIds.length > 0) {
//   driveConfig.driveId = driveIds[0]
//   driveConfig.corpora = 'drive'
//   driveConfig.includeItemsFromAllDrives = true // Must be set to true to get files in team drives
//   driveConfig.q = "'root' in parents and trashed = false"
// }

// const list = await drive.files.list(driveConfig)

const driveAbout = await getDriveAbout(driveIds[0])
const driveEncryptedFolderID = await getObjectByName(driveIds[0], encryptedFolder, true)
// const driveRootFolderID = await getObjectIdByName(driveIds[0], 'root')
