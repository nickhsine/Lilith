// 'use strict';

const ENTITY = {
  DIVIDER: {
    type: 'DIVIDER',
  },
  ANNOTATION: {
    type: 'ANNOTATION',
  },
  BLOCKQUOTE: {
    type: 'BLOCKQUOTE',
  },
  LINK: {
    type: 'LINK',
  },
  INFOBOX: {
    type: 'INFOBOX',
  },
  COLORBOX: {
    type: 'COLORBOX',
  },
  EMBEDDEDCODE: {
    type: 'EMBEDDEDCODE',
  },
  AUDIO: {
    type: 'AUDIO',
  },
  VIDEO: {
    type: 'VIDEO',
  },
  IMAGE: {
    type: 'IMAGE',
  },
  STOREDIMAGE: {
    type: 'STOREDIMAGE',
  },
  IMAGEDIFF: {
    type: 'IMAGEDIFF',
  },
  IMAGELINK: {
    type: 'IMAGELINK',
  },
  SLIDESHOW: {
    type: 'SLIDESHOW',
    slideshowSelectionLimit: 30,
  },
  ['SLIDESHOW-V2']: {
    type: 'SLIDESHOW-V2',
    slideshowSelectionLimit: 30,
  },
  YOUTUBE: {
    type: 'YOUTUBE',
  },
  TABLE: {
    type: 'TABLE',
  },
  BACKGROUNDIMAGE: {
    type: 'BACKGROUNDIMAGE',
  },
  BACKGROUNDVIDEO: {
    type: 'BACKGROUNDVIDEO',
  },
  RELATEDPOST: {
    type: 'RELATEDPOST',
  },
  SIDEINDEX: {
    type: 'SIDEINDEX',
  },
}

export default ENTITY
