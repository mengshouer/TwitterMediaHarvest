import MediaTweet from './lib/MediaTweet'
import TwitterMediaFile from './lib/TwitterMediaFile'
import { fetchCookie } from './lib/chromeApi'
import {
  migrateStorage,
  initStorage,
  fetchFileNameSetting,
} from './utils/storageHelper'
import { LOCAL_STORAGE_KEY_ARIA2, ARIA2_ID } from './constants'

/* eslint-disable no-console */
// eslint-disable-next-line no-undef
chrome.runtime.onInstalled.addListener(async details => {
  const reason = details.reason
  const prevVersion = details.previousVersion
  // eslint-disable-next-line no-undef
  const currentVersion = chrome.runtime.getManifest().version
  if (reason === 'update') {
    if (prevVersion === '1.1.6') await migrateStorage()
    console.info('Previous version:', prevVersion)
    console.info('Current version:', currentVersion)
    console.info('The extension has been updated.')
  }
  if (reason === 'install') {
    await initStorage()
  }
  openOptionsPage()
})
/* eslint-enable no-console */

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(async request => {
  await downloadMedias(request)
})

// eslint-disable-next-line no-undef
chrome.browserAction.onClicked.addListener(openOptionsPage)

/**
 * Trigger browser-download
 *
 * @function downloadMedias
 * @param {JSON} info twitter information
 */
async function downloadMedias(info) {
  // eslint-disable-next-line no-undef
  let { value } = await fetchCookie({ url: 'https://twitter.com', name: 'ct0' })

  const twitterMedia = new MediaTweet(info.tweetId, value)
  const mediaList = await twitterMedia.fetchMediaList()
  const setting = await fetchFileNameSetting()

  for (const [index, value] of mediaList.entries()) {
    const mediaFile = new TwitterMediaFile(info, value, index)

    if (JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ARIA2))) {
      const config = mediaFile.makeDownloadConfigBySetting(setting, 'aria2')
      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(ARIA2_ID, config)
    } else {
      const config = mediaFile.makeDownloadConfigBySetting(setting, 'browser')
      // eslint-disable-next-line no-undef
      chrome.downloads.download(config)
    }
  }
}

function openOptionsPage() {
  // eslint-disable-next-line no-undef
  chrome.runtime.openOptionsPage()
}
