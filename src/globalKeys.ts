import { ApplicationKeyMap, ExtendedKeyMapOptions, KeyMapOptions, MouseTrapKeySequence } from 'react-hotkeys';
/**
 * Contains mappings for special keyboard controls, beyond what is usually expected of a webpage
 * Learn more about keymaps at https://github.com/greena13/react-hotkeys#defining-key-maps (12.03.2021)
 *
 * Additional global configuration settins are placed in './config.ts'
 * (They are not placed here, because that somehow makes the name fields of keymaps undefined for some reason)
 *
 * If you add a new keyMap, be sure to add it to the getAllHotkeys function
 */
import { KeyMap } from "react-hotkeys";
import { isMacOs } from 'react-device-detect';
import i18next from "i18next";

// Groups for displaying hotkeys in the overview page
const groupVideoPlayer = "Video Player"
const groupCuttingView = "Cutting"
const groupCuttingViewScrubber = "Scrubbing"
const groupSubtitleList = "Subtitles"

/**
 * Helper function that rewrites keys based on the OS
 */
const rewriteKeys = (key: string) => {
  let newKey = key
  if (isMacOs) {
    newKey = newKey.replace("Alt", "Option")
  }

  return newKey
}

/**
 * (Semi-) global map for video player controls
 */
export const videoPlayerKeyMap: KeyMap = {
  preview: {
    name: i18next.t("video.previewButton"),
    sequence: rewriteKeys("Control+Alt+p"),
    action: "keydown",
    group: groupVideoPlayer,
  },
  play: {
    name: i18next.t("keyboardControls.videoPlayButton"),
    sequence: rewriteKeys("Space"),
    sequences: [rewriteKeys("Space"), rewriteKeys("Control+Alt+Space")],
    action: "keydown",
    group: groupVideoPlayer,
  },
}

/**
 * (Semi-) global map for the buttons in the cutting view
 */
export const cuttingKeyMap: KeyMap = {
  cut: {
    name: i18next.t("cuttingActions.cut-button"),
    sequence: rewriteKeys("Control+Alt+c"),
    action: "keydown",
    group: groupCuttingView,
  },
  delete: {
    name: i18next.t("cuttingActions.delete-button"),
    sequence: rewriteKeys("Control+Alt+d"),
    action: "keydown",
    group: groupCuttingView,
  },
  mergeLeft: {
    name: i18next.t("cuttingActions.mergeLeft-button"),
    sequence: rewriteKeys("Control+Alt+n"),
    action: "keydown",
    group: groupCuttingView,
  },
  mergeRight: {
    name: i18next.t("cuttingActions.mergeRight-button"),
    sequence: rewriteKeys("Control+Alt+m"),
    action: "keydown",
    group: groupCuttingView,
  },
}

/**
 * (Semi-) global map for moving the scrubber
 */
export const scrubberKeyMap: KeyMap = {
  left: {
    name: i18next.t("keyboardControls.scrubberLeft"),
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+j"),
    sequences: [rewriteKeys("Control+Alt+j"), "Left"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
  right: {
    name: i18next.t("keyboardControls.scrubberRight"),
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+l"),
    sequences: [rewriteKeys("Control+Alt+l"), "Right"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
  increase: {
    name: i18next.t("keyboardControls.scubberIncrease"),
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+i"),
    sequences: [rewriteKeys("Control+Alt+i"), "Up"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
  decrease: {
    name: i18next.t("keyboardControls.scrubberDecrease"),
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+k"),
    sequences: [rewriteKeys("Control+Alt+k"), "Down"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
}

export const subtitleListKeyMap: KeyMap = {
  addAbove: {
    name: i18next.t("subtitleList.addSegmentAbove"),
    sequence: rewriteKeys("Control+Alt+q"),
    action: "keydown",
    group: groupSubtitleList,
  },
  addBelow: {
    name: i18next.t("subtitleList.addSegmentBelow"),
    sequence: rewriteKeys("Control+Alt+a"),
    action: "keydown",
    group: groupSubtitleList,
  },
  jumpAbove: {
    name: i18next.t("subtitleList.jumpToSegmentAbove"),
    sequence: rewriteKeys("Control+Alt+w"),
    action: "keydown",
    group: groupSubtitleList,
  },
  jumpBelow: {
    name: i18next.t("subtitleList.jumpToSegmentBelow"),
    sequence: rewriteKeys("Control+Alt+s"),
    action: "keydown",
    group: groupSubtitleList,
  },
  delete : {
    name: i18next.t("subtitleList.deleteSegment"),
    sequence: rewriteKeys("Control+Alt+d"),
    action: "keydown",
    group: groupSubtitleList,
  }
}

/**
 * Combines all keyMaps into a single list of keys for KeyboardControls to display
 * Placing this under the keyMaps is important, else the translation hooks won't happen
 */
 export const getAllHotkeys = () => {
  const allKeyMaps = [videoPlayerKeyMap, cuttingKeyMap, scrubberKeyMap, subtitleListKeyMap]
  const allKeys : ApplicationKeyMap = {}

  for (const keyMap of allKeyMaps) {
    for (const [key, value] of Object.entries(keyMap)) {

      // Parse sequences
      let sequences : KeyMapOptions[] = []
      if ((value as ExtendedKeyMapOptions).sequences !== undefined) {
        for (const sequence of (value as ExtendedKeyMapOptions).sequences) {
          sequences.push({sequence: sequence as MouseTrapKeySequence, action: (value as ExtendedKeyMapOptions).action})
        }
      } else {
        sequences = [ {sequence: (value as ExtendedKeyMapOptions).sequence, action: (value as ExtendedKeyMapOptions).action } ]
      }

      // Create new key
      allKeys[key] = {
        name: (value as ExtendedKeyMapOptions).name,
        group: (value as ExtendedKeyMapOptions).group,
        sequences: sequences,
      }
    }
  }

  return allKeys
}
