// Füge am Anfang ein:
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import * as Icons from '@mui/icons-material';

// Comprehensive list of Material Design icons, with focus on home, buildings, HVAC, etc.
const COMMON_ICONS = [
  // Home & Buildings
  'Home', 'House', 'Apartment', 'Villa', 'Cabin', 'CorporateFare', 'LocationCity', 'Business', 'Warehouse',
  'Storefront', 'Store', 'HomeWork', 'HomeRepairService', 'Gite', 'Chalet', 'HolidayVillage', 'Bungalow',
  'Castle', 'Church', 'Synagogue', 'Mosque', 'Temple', 'Foundation', 'Construction', 'Engineering',
  'Architecture', 'Domain', 'MeetingRoom', 'Balcony', 'Deck', 'Fence', 'Stairs', 'Elevator',
  'DoorFront', 'DoorBack', 'DoorSliding', 'Doorbell', 'Garage', 'Gate', 'Roofing', 'Window',
  'Curtains', 'Blinds', 'Chair', 'Desk', 'Bed', 'Bathtub', 'Shower', 'Toilet', 'Kitchen',
  'Dining', 'Living', 'Bedroom', 'Bathroom', 'Yard', 'Grass', 'Deck', 'Pool',

  // Smart Home & HVAC
  'Thermostat', 'ThermostatAuto', 'DeviceThermostat', 'AcUnit', 'Hvac', 'Air', 'Propane',
  'WaterDrop', 'WaterDamage', 'Waves', 'Flood', 'FireExtinguisher', 'FireHydrantAlt', 'LocalFireDepartment',
  'Co2', 'Co', 'SensorDoor', 'SensorWindow', 'SensorOccupied', 'SecuritySystem', 'SmartButton',
  'ElectricMeter', 'WaterHeater', 'Outlet', 'ElectricalServices', 'Power', 'PowerOff', 'PowerSettingsNew',
  'LightMode', 'DarkMode', 'Light', 'Lightbulb', 'LightbulbOutline', 'LightbulbCircle',
  'WbIncandescent', 'WbIridescent', 'WbShade', 'WbSunny', 'WbTwilight', 'WbCloudy',
  'Heating', 'HeatPump', 'Propane', 'PropaneTank', 'Gas', 'GasMeter', 'EnergySavingsLeaf',
  'SolarPower', 'WindPower', 'ElectricBolt', 'OfflineBolt', 'BatteryChargingFull', 'BatteryFull',
  'BatteryAlert', 'BatterySaver', 'Sensors', 'SensorsOff', 'SettingsRemote', 'RemoteGen',
  'DeviceHub', 'Router', 'NetworkWifi', 'NetworkWifi1Bar', 'NetworkWifi2Bar', 'NetworkWifi3Bar',
  'SignalWifi4Bar', 'SignalWifiStatusbar4Bar', 'SignalWifiConnectedNoInternet4', 'WifiTethering',
  'WifiTetheringError', 'WifiTetheringOff', 'WifiFind', 'WifiLock', 'WifiPassword', 'WifiProtectedSetup',

  // Utilities & Meters
  'WaterDrop', 'Water', 'WaterDamage', 'Opacity', 'Waves', 'LocalDrink', 'Shower', 'Faucet',
  'Plumbing', 'Propane', 'PropaneTank', 'Gas', 'GasMeter', 'ElectricMeter', 'Bolt', 'ElectricBolt',
  'OfflineBolt', 'FlashOn', 'FlashOff', 'Power', 'PowerOff', 'PowerSettingsNew', 'EnergySavingsLeaf',
  'Eco', 'Recycling', 'Compost', 'SolarPower', 'WindPower', 'WaterHeater', 'Outlet', 'ElectricalServices',

  // Sensors & Controls
  'Sensors', 'SensorsOff', 'SettingsRemote', 'RemoteGen', 'DeviceHub', 'DeviceThermostat',
  'DeviceUnknown', 'Thermostat', 'ThermostatAuto', 'Timer', 'TimerOff', 'Schedule', 'Alarm',
  'AlarmOn', 'AlarmOff', 'AlarmAdd', 'Notifications', 'NotificationsActive', 'NotificationsOff',
  'NotificationAdd', 'Monitor', 'MonitorHeart', 'MonitorWeight', 'HealthAndSafety', 'MedicalServices',
  'EmergencyRecording', 'EmergencyShare', 'Warning', 'Error', 'ErrorOutline', 'ReportProblem',
  'SensorDoor', 'SensorWindow', 'SensorOccupied', 'SecuritySystem', 'SmartButton', 'ToggleOn', 'ToggleOff',

  // Weather & Environment
  'WbSunny', 'WbCloudy', 'WbTwilight', 'Cloud', 'CloudQueue', 'CloudCircle', 'CloudDone', 'CloudDownload',
  'CloudUpload', 'CloudOff', 'CloudSync', 'Thunderstorm', 'Rainy', 'Snowing', 'AcUnit', 'Tornado',
  'Air', 'FilterAlt', 'FilterDrama', 'FilterHdr', 'FilterTiltShift', 'FilterVintage', 'Terrain',
  'Landscape', 'Grass', 'Park', 'Nature', 'NaturePeople', 'Forest', 'Eco', 'EnergySavingsLeaf',
  'SolarPower', 'WindPower', 'Recycling', 'Compost', 'Opacity', 'Waves', 'WaterDrop', 'Flood',

  // General UI
  'Settings', 'SettingsApplications', 'SettingsInputComponent', 'SettingsSystemDaydream', 'SettingsSuggest',
  'SettingsVoice', 'SettingsPhone', 'SettingsEthernet', 'SettingsBluetooth', 'SettingsBrightness',
  'SettingsInputAntenna', 'SettingsInputHdmi', 'SettingsInputSvideo', 'SettingsOverscan', 'SettingsPower',
  'Person', 'People', 'Group', 'Family', 'Diversity1', 'Diversity2', 'Diversity3',
  'Info', 'Help', 'HelpCenter', 'HelpOutline', 'LiveHelp', 'SupportAgent', 'ContactSupport',
  'Add', 'AddCircle', 'AddCircleOutline', 'AddBox', 'Remove', 'RemoveCircle', 'RemoveCircleOutline',
  'Edit', 'EditNote', 'EditAttributes', 'EditLocation', 'EditLocationAlt', 'EditRoad', 'EditOff',
  'Delete', 'DeleteForever', 'DeleteOutline', 'DeleteSweep', 'Save', 'SaveAs', 'SaveAlt',
  'Check', 'CheckCircle', 'CheckCircleOutline', 'CheckBox', 'CheckBoxOutlineBlank', 'IndeterminateCheckBox',
  'Close', 'Cancel', 'CancelPresentation', 'CancelScheduleSend', 'Block', 'Clear', 'Backspace',
  'Done', 'DoneAll', 'DoneOutline', 'Visibility', 'VisibilityOff', 'Preview', 'RemoveRedEye',
  'Lock', 'LockOpen', 'LockClock', 'LockPerson', 'LockReset', 'EnhancedEncryption', 'NoEncryption',
  'NoEncryptionGmailerrorred', 'PrivacyTip', 'Security', 'SecurityUpdate', 'SecurityUpdateGood',
  'SecurityUpdateWarning', 'Gpp', 'GppBad', 'GppGood', 'GppMaybe', 'AdminPanelSettings', 'VerifiedUser',
  'Shield', 'ShieldMoon', 'SafetyCheck', 'SafetyDivider', 'HealthAndSafety', 'MedicalServices',
  'Favorite', 'FavoriteBorder', 'FavoriteOutline', 'ThumbUp', 'ThumbDown', 'ThumbUpAlt', 'ThumbDownAlt',
  'Star', 'StarBorder', 'StarOutline', 'StarHalf', 'StarRate', 'Stars', 'Grade',
  'Search', 'SearchOff', 'ManageSearch', 'FindInPage', 'FindReplace', 'Pageview', 'Loupe',
  'Menu', 'MenuOpen', 'MenuBook', 'MoreVert', 'MoreHoriz', 'ExpandMore', 'ExpandLess', 'UnfoldMore', 'UnfoldLess',
  'ArrowBack', 'ArrowForward', 'ArrowUpward', 'ArrowDownward', 'ArrowLeft', 'ArrowRight', 'ArrowDropDown',
  'ArrowDropUp', 'ArrowRight', 'KeyboardArrowDown', 'KeyboardArrowLeft', 'KeyboardArrowRight', 'KeyboardArrowUp',
  'KeyboardDoubleArrowDown', 'KeyboardDoubleArrowLeft', 'KeyboardDoubleArrowRight', 'KeyboardDoubleArrowUp',
  'Refresh', 'Sync', 'SyncAlt', 'SyncProblem', 'SyncDisabled', 'Cached', 'Autorenew', 'Restore',
  'RestoreFromTrash', 'RestorePage', 'Update', 'Upgrade', 'Redo', 'Undo', 'History', 'HistoryToggleOff',
  'Dashboard', 'DashboardCustomize', 'ViewList', 'ViewModule', 'ViewQuilt', 'List', 'GridView', 'TableView',
  'TableRows', 'TableChart', 'PivotTableChart', 'ViewComfy', 'ViewCompact', 'ViewCozy', 'ViewDay', 'ViewHeadline',
  'ViewInAr', 'ViewKanban', 'ViewSidebar', 'ViewStream', 'ViewTimeline', 'ViewWeek', 'View', 'ViewArray',
  'ViewCarousel', 'ViewColumn', 'ViewComfyAlt', 'ViewCompactAlt', 'ViewAgenda', 'ViewDay', 'ViewList', 'ViewModule',
  'ViewQuilt', 'ViewSidebar', 'ViewStream', 'ViewWeek', 'Grid3x3', 'Grid4x4', 'GridGoldenratio', 'GridOn', 'GridOff',
  'GridView', 'Apps', 'AppsOutage', 'Widgets', 'Palette', 'Style', 'AutoAwesome', 'AutoAwesomeMosaic',
  'AutoAwesomeMotion', 'AutoFixHigh', 'AutoFixNormal', 'AutoFixOff', 'AutoGraph', 'AutoStories', 'Animation',
  'Bedtime', 'BedtimeOff', 'Brightness', 'BrightnessAuto', 'BrightnessHigh', 'BrightnessLow', 'BrightnessMedium',
  'Contrast', 'DesignServices', 'Draw', 'Brush', 'Create', 'ColorLens', 'Palette', 'FormatPaint', 'FormatColorFill',
  'Opacity', 'Gradient', 'Texture', 'Tune', 'TuneOff', 'Straighten', 'Transform', 'CropRotate', 'FilterVintage',
  'FilterDrama', 'FilterFrames', 'FilterHdr', 'FilterNone', 'FilterTiltShift', 'Flare', 'FlashAuto', 'FlashOff', 'FlashOn',
  'Flip', 'FlipCameraAndroid', 'FlipCameraIos', 'Rotate90DegreesCcw', 'Rotate90DegreesCw', 'RotateLeft', 'RotateRight',
  'Panorama', 'PanoramaFishEye', 'PanoramaHorizontal', 'PanoramaVertical', 'PanoramaWideAngle', 'PhotoCamera',
  'CameraAlt', 'Camera', 'CameraEnhance', 'CameraFront', 'CameraRear', 'CameraRoll', 'ControlCamera', 'Filter',
  'FilterBAndW', 'FilterCenterFocus', 'FilterFrames', 'FilterHdr', 'FilterNone', 'FilterTiltShift', 'FilterVintage',
  'Grain', 'MovieCreation', 'MovieFilter', 'Music', 'MusicNote', 'MusicOff', 'MusicVideo', 'Subscriptions',
  'Subtitles', 'ClosedCaption', 'ClosedCaptionDisabled', 'ClosedCaptionOff', 'RemoveFromQueue', 'RemoveRedEye',
  'RepeatOne', 'RepeatOneOn', 'Replay', 'Replay10', 'Replay30', 'Replay5', 'ReplayCircleFilled', 'SDCard', 'SdCardAlert',
  'SdStorage', 'Sd', 'SimCard', 'SimCardAlert', 'SimCardDownload', 'SettingsCell', 'SettingsEthernet', 'SettingsInputAntenna',
  'SettingsInputComponent', 'SettingsInputComposite', 'SettingsInputHdmi', 'SettingsInputSvideo', 'SettingsOverscan',
  'SettingsVoice', 'Speaker', 'SpeakerGroup', 'SpeakerNotes', 'SpeakerNotesOff', 'SpeakerPhone', 'Surround',
  'SurroundSound', 'Equalizer', 'GraphicEq', 'Queue', 'QueueMusic', 'QueuePlayNext', 'Radio', 'RecentActors',
  'FeaturedPlayList', 'FeaturedVideo', 'FiberDvr', 'FiberManualRecord', 'FiberNew', 'FiberPin', 'FiberSmartRecord',
  'Forward10', 'Forward30', 'Forward5', 'Games', 'Gamepad', 'Headphones', 'Headset', 'HeadsetMic', 'HeadsetOff',
  'Hearing', 'HearingDisabled', 'HighQuality', 'LibraryAdd', 'LibraryAddCheck', 'LibraryBooks', 'LibraryMusic',
  'Loop', 'Mic', 'MicExternalOff', 'MicExternalOn', 'MicNone', 'MicOff', 'Missed', 'MissedVideoCall', 'Movie',
  'NewReleases', 'Note', 'NotStarted', 'Pause', 'PauseCircle', 'PauseCircleFilled', 'PauseCircleOutline',
  'PausePresentation', 'PlayArrow', 'PlayCircle', 'PlayCircleFilled', 'PlayCircleOutline', 'PlayDisabled',
  'PlaylistAdd', 'PlaylistAddCheck', 'PlaylistAddCheckCircle', 'PlaylistAddCircle', 'PlaylistPlay', 'PlaylistRemove',
  'QueuePlayNext', 'Radio', 'RadioButtonChecked', 'RadioButtonUnchecked', 'RecentActors', 'RemoveFromQueue',
  'Repeat', 'RepeatOn', 'RepeatOne', 'RepeatOneOn', 'Replay', 'Replay10', 'Replay30', 'Replay5', 'ReplayCircleFilled',
  'Shuffle', 'ShuffleOn', 'SkipNext', 'SkipPrevious', 'SlowMotionVideo', 'Snooze', 'SortByAlpha', 'Speed',
  'Stop', 'StopCircle', 'StopScreenShare', 'Subscriptions', 'Subtitles', 'SurroundSound', 'VideoCall',
  'VideoLabel', 'VideoLibrary', 'VideoSettings', 'VolumeDown', 'VolumeMute', 'VolumeOff', 'VolumeUp',
  'Web', 'WebAsset', 'WebAssetOff', 'Website', 'Cast', 'CastConnected', 'CastForEducation', 'Computer',
  'DesktopMac', 'DesktopWindows', 'DeveloperBoard', 'DeveloperBoardOff', 'DeviceHub', 'DeviceUnknown',
  'Devices', 'DevicesOther', 'Dock', 'Earbuds', 'EarbudsBattery', 'Headphones', 'Headset', 'HeadsetMic',
  'HeadsetOff', 'Keyboard', 'KeyboardAlt', 'KeyboardArrowDown', 'KeyboardArrowLeft', 'KeyboardArrowRight',
  'KeyboardArrowUp', 'KeyboardBackspace', 'KeyboardCapslock', 'KeyboardHide', 'KeyboardReturn', 'KeyboardTab',
  'KeyboardVoice', 'Laptop', 'LaptopChromebook', 'LaptopMac', 'LaptopWindows', 'Memory', 'Monitor',
  'PhoneAndroid', 'PhoneIphone', 'PhoneLink', 'PhonelinkOff', 'PointOfSale', 'Power', 'PowerInput',
  'Router', 'Scanner', 'Security', 'SimCard', 'SmartDisplay', 'SmartScreen', 'SmartToy', 'Smartphone',
  'Speaker', 'SpeakerGroup', 'Tablet', 'TabletAndroid', 'TabletMac', 'Toys', 'Tv', 'Videogame',
  'Watch', 'WatchLater', 'ConnectedTv', 'Desktop', 'DesktopAccessDisabled', 'DesktopMac', 'DesktopWindows',
  'DeveloperBoard', 'DeveloperMode', 'DeviceHub', 'DeviceUnknown', 'Devices', 'DevicesOther', 'Dock',
  'Gamepad', 'Headset', 'HeadsetMic', 'Keyboard', 'KeyboardHide', 'KeyboardVoice', 'Laptop', 'LaptopChromebook',
  'LaptopMac', 'LaptopWindows', 'Memory', 'Mouse', 'PhoneAndroid', 'PhoneIphone', 'PhoneLink', 'PhonelinkOff',
  'PowerInput', 'Router', 'Scanner', 'Security', 'SimCard', 'Smartphone', 'Speaker', 'SpeakerGroup', 'Tablet',
  'TabletAndroid', 'TabletMac', 'Toys', 'Tv', 'Videogame', 'Watch'
];

// Prioritätsbasierte Icon-Kategorisierung mit verbesserten RegEx-Patterns
const ICON_CATEGORIES = (() => {
  // Helper-Funktion zur Kategorisierung
  const categorizeIcon = (icon: string): string => {
    // Haus & Gebäude (höchste Priorität)
    if (/^(Home|House|Villa|Cabin|Apartment|Building|Door|Window|Room|Kitchen|Bath|Bed|Living|Dining|Pool|Gate|Garage|Deck|Balcony|Stair)/i.test(icon)) {
      return 'home';
    }
    
    // Smart Home & HVAC
    if (/^(Thermostat|Smart|Device|Light|Heat|Ac|Hvac|Remote|Wifi|Network)/i.test(icon)) {
      return 'smart';
    }
    
    // Sensoren & Steuerung
    if (/^(Sensor|Alarm|Monitor|Control|Timer|Schedule|Security|Emergency|Warning|Safety)/i.test(icon)) {
      return 'sensors';
    }
    
    // Versorgung & Zähler
    if (/^(Water|Electric|Power|Gas|Meter|Energy|Solar|Wind|Battery|Outlet|Propane|Bolt)/i.test(icon)) {
      return 'utilities';
    }
    
    // Wetter & Umwelt
    if (/^(Cloud|Weather|Sun|Rain|Snow|Wind|Storm|Nature|Air|Forest|Eco|Wb|Landscape|Park)/i.test(icon)) {
      return 'weather';
    }
    
    // UI Elemente
    if (/^(Settings|View|Grid|Menu|Button|List|Table|Add|Edit|Delete|Save|Arrow|Dashboard)/i.test(icon)) {
      return 'ui';
    }
    
    return 'all';
  };

  // Vorkategorisierte Icons
  const categorizedIcons = {
    all: COMMON_ICONS,
    home: COMMON_ICONS.filter(icon => categorizeIcon(icon) === 'home'),
    smart: COMMON_ICONS.filter(icon => categorizeIcon(icon) === 'smart'),
    utilities: COMMON_ICONS.filter(icon => categorizeIcon(icon) === 'utilities'),
    sensors: COMMON_ICONS.filter(icon => categorizeIcon(icon) === 'sensors'),
    weather: COMMON_ICONS.filter(icon => categorizeIcon(icon) === 'weather'),
    ui: COMMON_ICONS.filter(icon => categorizeIcon(icon) === 'ui')
  };

  // Kategorie-Definitionen mit vorberechneten Icon-Listen
  return [
    { id: 'all', label: 'Alle', icons: categorizedIcons.all },
    { id: 'home', label: 'Haus & Gebäude', icons: categorizedIcons.home },
    { id: 'smart', label: 'Smart Home & HVAC', icons: categorizedIcons.smart },
    { id: 'utilities', label: 'Versorgung & Zähler', icons: categorizedIcons.utilities },
    { id: 'sensors', label: 'Sensoren & Steuerung', icons: categorizedIcons.sensors },
    { id: 'weather', label: 'Wetter & Umwelt', icons: categorizedIcons.weather },
    { id: 'ui', label: 'UI Elemente', icons: categorizedIcons.ui }
  ];
})();

interface IconSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  currentIcon?: string;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  open,
  onClose,
  onSelectIcon,
  currentIcon
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredIcons, setFilteredIcons] = useState<string[]>(COMMON_ICONS);

  // Vereinfachte, direkte Filterung ohne Cache
  const getIconsForCategory = React.useCallback((category: string) => {
    return category === 'all'
      ? COMMON_ICONS
      : ICON_CATEGORIES.find(cat => cat.id === category)?.icons || [];
  }, []);

  const filterIcons = React.useCallback((icons: string[], search: string) => {
    if (!search.trim()) return icons;
    const terms = search.toLowerCase().trim().split(/\s+/);
    return icons.filter(icon => {
      const name = icon.toLowerCase();
      return terms.every(term => name.includes(term));
    });
  }, []);

  useEffect(() => {
    setFilteredIcons(getIconsForCategory(selectedCategory));
  }, [selectedCategory, getIconsForCategory]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredIcons(getIconsForCategory(selectedCategory));
      return;
    }
    
    const handle = setTimeout(() => {
      const baseIcons = getIconsForCategory(selectedCategory);
      const filtered = filterIcons(baseIcons, searchTerm);
      setFilteredIcons(filtered);
    }, 150);

    return () => clearTimeout(handle);
  }, [searchTerm, selectedCategory, getIconsForCategory, filterIcons]);

  // Zurücksetzen beim Öffnen
  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setSelectedCategory('all');
      setFilteredIcons(COMMON_ICONS);
    }
  }, [open]);


  // Handle icon selection
  const handleIconSelect = (iconName: string) => {
    onSelectIcon(iconName);
    onClose();
  };

  // Dynamically render the icon component
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Material Design Icon auswählen</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Icon suchen"
            type="text"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {ICON_CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedCategory(category.id)}
                sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
              >
                {category.label}
              </Button>
            ))}
          </Box>
        </Box>

        {filteredIcons.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filteredIcons.map((iconName) => (
              <Box key={iconName} sx={{ width: { xs: 'calc(16.66% - 8px)', sm: 'calc(12.5% - 8px)', md: 'calc(10% - 8px)' } }}>
                <IconButton
                  onClick={() => handleIconSelect(iconName)}
                  sx={{
                    width: '100%',
                    height: '64px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 1,
                    border: currentIcon === iconName ? '2px solid #1976d2' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      border: '1px solid #1976d2'
                    }
                  }}
                >
                  {renderIcon(iconName)}
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', mt: 0.5, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {iconName}
                  </Typography>
                </IconButton>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Keine Icons gefunden
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IconSelector;
