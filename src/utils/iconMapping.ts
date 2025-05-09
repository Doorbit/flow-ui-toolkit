// Mapping von Material UI Icon-Namen zu MDI-Icon-Namen
export const materialToMdiMapping: Record<string, string> = {
  // Allgemeine Icons
  'Home': 'mdiHome',
  'Delete': 'mdiDelete',
  'Edit': 'mdiPencil',
  'Add': 'mdiPlus',
  'Remove': 'mdiMinus',
  'Close': 'mdiClose',
  'Check': 'mdiCheck',
  'Info': 'mdiInformation',
  'Warning': 'mdiAlert',
  'Error': 'mdiAlertCircle',
  'Help': 'mdiHelpCircle',
  'Settings': 'mdiCog',
  'Search': 'mdiMagnify',
  'Menu': 'mdiMenu',
  'MoreVert': 'mdiDotsVertical',
  'MoreHoriz': 'mdiDotsHorizontal',
  'ArrowBack': 'mdiArrowLeft',
  'ArrowForward': 'mdiArrowRight',
  'ArrowUpward': 'mdiArrowUp',
  'ArrowDownward': 'mdiArrowDown',
  'Refresh': 'mdiRefresh',
  'Save': 'mdiContentSave',
  'Print': 'mdiPrinter',
  'Share': 'mdiShareVariant',
  'Favorite': 'mdiHeart',
  'FavoriteBorder': 'mdiHeartOutline',
  'Star': 'mdiStar',
  'StarBorder': 'mdiStarOutline',
  'Person': 'mdiAccount',
  'People': 'mdiAccountGroup',
  'Visibility': 'mdiEye',
  'VisibilityOff': 'mdiEyeOff',
  'Lock': 'mdiLock',
  'LockOpen': 'mdiLockOpen',
  'Email': 'mdiEmail',
  'Phone': 'mdiPhone',
  'LocationOn': 'mdiMapMarker',
  'Schedule': 'mdiClock',
  'Today': 'mdiCalendarToday',
  'Event': 'mdiCalendar',
  'Attachment': 'mdiPaperclip',
  'Link': 'mdiLink',
  'Cloud': 'mdiCloud',
  'CloudUpload': 'mdiCloudUpload',
  'CloudDownload': 'mdiCloudDownload',
  'FileUpload': 'mdiFileUpload',
  'FileDownload': 'mdiFileDownload',
  'Folder': 'mdiFolder',
  'FolderOpen': 'mdiFolderOpen',
  'Create': 'mdiPencilPlus',
  'AccountTree': 'mdiAccountTree',
  
  // Spezifische Icons für die Anwendung
  'FloorPlan': 'mdiFloorPlan',
  'FileOutline': 'mdiFileOutline',
  'Alert': 'mdiAlert',
  'Wrench': 'mdiWrench',
  'Radiator': 'mdiRadiator',
  'LightSwitch': 'mdiLightSwitch',
  'LightbulbOn': 'mdiLightbulbOn',
  'Fence': 'mdiFence',
  'RadiatorDisabled': 'mdiRadiatorDisabled',
  'HeatingCoil': 'mdiHeatingCoil'
};

// Konvertiere Material UI Icon-Namen zu MDI-Icon-Namen
export const convertToMdiIconName = (materialIconName: string): string => {
  return materialToMdiMapping[materialIconName] || `mdi${materialIconName}`;
};

// Konvertiere MDI-Icon-Namen zu Material UI Icon-Namen
export const convertToMaterialIconName = (mdiIconName: string): string => {
  // Entferne das 'mdi'-Präfix
  const iconName = mdiIconName.replace(/^mdi/, '');
  
  // Suche nach dem Material UI Icon-Namen
  for (const [materialName, mdiName] of Object.entries(materialToMdiMapping)) {
    if (mdiName === mdiIconName) {
      return materialName;
    }
  }
  
  return iconName;
};
