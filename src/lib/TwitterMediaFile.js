import path from 'path'
import {
  makeBrowserDownloadConfig,
  makeAria2DownloadConfig,
} from '../utils/maker'

/**
 * Tweet information
 *
 * @typedef tweetInfo
 * @type {Object}
 * @property {String} screenName
 * @property {String} tweetId
 */
/**
 * @class TwitterMediaFile
 */
export default class TwitterMediaFile {
  /**
   * @constructor
   * @param {tweetInfo} tweetInfo
   * @param {String} url
   * @param {Number} index
   */
  constructor(tweetInfo, url, index = 0) {
    this.screenName = tweetInfo.screenName
    this.tweetId = tweetInfo.tweetId
    this.url = cleanUrl(url)
    this.src = makeOrigSrc(this.url)
    this.ext = path.extname(this.url)
    this.name = path.basename(this.url, this.ext)
    this.order = String(index + 1)
  }

  /**
   *
   * @typedef {import('../utils/storageHelper').fileNameSetting} fileNameSetting
   * @param {fileNameSetting} setting
   */
  makeFileNameBySetting(setting) {
    const root = setting.directory

    const accountPart = setting.filename_pattern.account
      ? `${this.screenName}-`
      : ''

    let serialPart
    switch (setting.filename_pattern.serial) {
      case 'order':
        serialPart = this.order.padStart(2, '0')
        break

      case 'file_name':
        serialPart = this.name
        break

      default:
        serialPart = this.order.padStart(2, '0')
    }

    const basename = accountPart.concat(this.tweetId, '-', serialPart)
    const fullPath = root.concat('/', basename, this.ext)

    return fullPath
  }

  getSrc() {
    return this.src
  }

  /**
   * Create download config
   *
   * @param {fileNameSetting} setting
   * @param {'browser'|'aria2'} mode
   */
  makeDownloadConfigBySetting(setting, mode = 'browser') {
    const url = this.getSrc()
    const fileName = this.makeFileNameBySetting(setting)
    let config

    if (mode === 'aria2') config = makeAria2DownloadConfig(url, fileName)
    if (mode === 'browser') config = makeBrowserDownloadConfig(url, fileName)

    return config
  }
}

/**
 * Make original quality source of tweet media from media url
 *
 * @param {String} url
 * @returns {String}
 */
function makeOrigSrc(url) {
  if (path.extname(url) === '.mp4') return url

  // const ext = path.extname(url).split('.')[1]
  // baseUrl.searchParams.append('format', ext)
  // baseUrl.searchParams.append('name', 'orig')

  return `${url}:orig`
}

/**
 * Clean all searchParams
 *
 * @param {String} url
 * @returns {String}
 */
function cleanUrl(url) {
  const theUrl = new URL(url)
  theUrl.searchParams.delete('tag')

  return theUrl.href
}

export { TwitterMediaFile, makeOrigSrc }
