import { Rclone } from 'rclone'

import { posix as path } from 'node:path'

const rcloneConfig = {
  password: process.env.RCLONE_PASSWORD,
  salt: process.env.RCLONE_PASSWORD2
}

const rclone = await Rclone(rcloneConfig)

export const encryptedFolder = process.env.ENCRYPTED_FOLDER || ''
export const encryptedFolderNameEncrypted = rclone.Path.encrypt(encryptedFolder)

function cleanPath (string) {
  let cleaned = string.replace(/\\/g, '/')
  if (cleaned.startsWith('/')) {
    cleaned = cleaned.substring(1)
  }
  if (cleaned.startsWith(encryptedFolder)) {
    cleaned = cleaned.substring(encryptedFolder.length)
  }
  if (cleaned.startsWith(encryptedFolderNameEncrypted)) {
    cleaned = cleaned.substring(encryptedFolderNameEncrypted.length)
  }
  return cleaned
}

export function plaintextToEncrypted (plainText) {
  return rclone.Path.encrypt(plainText)
}

export function encryptedToPlaintext (encrypted) {
  return rclone.Path.decrypt(encrypted)
}

export function plaintextPathToEncryptedPath (plaintextPath) {
  return path.join('/', encryptedFolder, plaintextToEncrypted(cleanPath(plaintextPath)))
}

export function encryptedPathToPlaintextPath (encryptedPath) {
  return path.join('/', encryptedFolder, encryptedToPlaintext(cleanPath(encryptedPath)))
}

// const test = plaintextPathToEncryptedPath("small_movie_collection_test/Avengement (2019) (tt8836988) {Remux-1080p}.mkv")
