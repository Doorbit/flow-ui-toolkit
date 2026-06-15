import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { tokens } from './theme/tokens';
import { generateUUID, transformFlowForExport } from './utils/uuidUtils';
import styled from 'styled-components';
import FlowMetadataDialog, { FlowMetadata } from './components/FlowMetadataDialog/FlowMetadataDialog';
import ModuleManagerDialog from './components/ModuleManager/ModuleManagerDialog';

import Navigation from './components/Navigation/Navigation';
// Wir verwenden jetzt den HybridEditor anstelle dieser Komponenten
// import ElementPalette from './components/ElementPalette/ElementPalette';
// import EditorArea from './components/EditorArea/EditorArea';
// import PropertyEditor from './components/PropertyEditor/PropertyEditor';
import HybridEditor from './components/HybridEditor';
import PageNavigator from './components/PageNavigator/PageNavigator';
import CopyElementToPageDialog from './components/HybridEditor/CopyElementToPageDialog';
import ExportElementToFileDialog from './components/HybridEditor/ExportElementToFileDialog';
import { deepCloneElement } from './utils/deepCloneUtils';
import { isElementAllowedInParent } from './utils/nestingRules';
// DndProvider wird jetzt in index.tsx importiert
// import { DndProvider } from './components/DndProvider';
import { EditorProvider, useEditor, getElementByPath, getContainerType } from './context/EditorContext';
import { logger } from './utils/logger';
import { FieldValuesProvider } from './context/FieldValuesContext';
import { FeedbackProvider, useFeedback } from './context/FeedbackContext';
import KeyboardShortcutsDialog from './components/HybridEditor/KeyboardShortcutsDialog';
import ValidationStatus from './components/common/ValidationStatus';
import OnboardingDialog from './components/common/OnboardingDialog';
import { SchemaProvider } from './context/SchemaContext';
import { SubflowProvider } from './context/SubflowContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { ListingFlow, PatternLibraryElement } from './models/listingFlow';
import {
  TextUIElement,
  BooleanUIElement,
  SingleSelectionUIElement,
  NumberUIElement,
  DateUIElement,
  FileUIElement,
  GroupUIElement,
  ArrayUIElement,
  CustomUIElement,
  ChipGroupUIElement,
  StringUIElement,
  KeyValueListUIElement,
  ImageGalleryUIElement,
  FieldTextUIElement,
  TableUIElement,
  ContactUIElement
} from './models/uiElements';

const theme = createTheme({
  palette: {
    primary: {
      main: tokens.brand.green, // Grün (Corporate Branding)
      dark: tokens.brand.greenDark, // Dunkelgrün
      light: tokens.brand.greenLight, // Helleres Grün
      contrastText: tokens.surface.paper,
    },
    secondary: {
      main: tokens.brand.orange, // Orange/Rot (Corporate Branding)
      dark: tokens.brand.orangeDark,
      light: tokens.brand.orangeLight,
      contrastText: tokens.surface.paper,
    },
    text: {
      primary: tokens.text.primary, // Dunkelblau für Überschriften
      secondary: tokens.text.secondary, // Dunkelgrau für normalen Text
    },
    background: {
      default: tokens.surface.appBg, // Sehr helles Grau/Weiß
      paper: tokens.surface.paper,
    },
    grey: {
      300: tokens.neutral.border,
      400: tokens.neutral.borderStrong,
      500: tokens.neutral.icon, // Grau für Icons und sekundäre Elemente
    },
    error: {
      main: tokens.brand.orange, // Orange/Rot für Fehler und Warnungen
    },
    info: {
      main: tokens.brand.green, // Grün für Infos
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 500,
      color: tokens.text.primary,
    },
    subtitle1: {
      fontWeight: 500,
      color: tokens.text.secondary,
    },
    body1: {
      color: tokens.text.secondary,
    },
    body2: {
      color: tokens.text.secondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          width: 16,
          height: 16,
        },
        track: {
          height: 6,
          borderRadius: 3,
        },
        rail: {
          height: 6,
          borderRadius: 3,
        },
      },
    },
  },
});

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

// Diese Styled Components werden nicht mehr benötigt, da wir jetzt den HybridEditor verwenden
// const EditorContainer = styled.div`
//   display: flex;
//   flex: 1;
//   overflow: hidden;
// `;
//
// const EditorAreaWrapper = styled.div`
//   flex: 0.6; /* 60% der Breite */
//   overflow: auto;
// `;
//
// const PropertyEditorWrapper = styled.div`
//   flex: 0.4; /* 40% der Breite */
//   overflow: auto;
//   border-left: 1px solid #ddd;
// `;

/**
 * Erzeugt ein KeyValueListUIElement für Massedaten (Bill of quantities)
 * Diese Funktion wird verwendet, um automatisch das KeyValueListUIElement in ROOM und ROOM_GROUP Subflows einzufügen
 * @returns Ein KeyValueListUIElement mit vordefinierten Massedaten-Feldern
 */
const createBillOfQuantitiesElement = (): KeyValueListUIElement => {
  return {
    pattern_type: 'KeyValueListUIElement',
    type: 'TABLE',
    required: false,
    items: [
      {
        icon: 'mdiFloorPlan',
        key: {
          en: 'Nettogrundfläche (NGF)',
          de: 'Nettogrundfläche (NGF)'
        },
        field_value: {
          field_id: {
            field_name: `netto_raumflaeche_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiCube',
        key: {
          en: 'Netto-Rauminhalt (NRI)',
          de: 'Netto-Rauminhalt (NRI)'
        },
        field_value: {
          field_id: {
            field_name: `netto_rauminhalt_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiFloorPlan',
        key: {
          en: 'Bruttogrundfläche (BGF)',
          de: 'Bruttogrundfläche (BGF)'
        },
        field_value: {
          field_id: {
            field_name: `brutto_grundflaeche_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiCube',
        key: {
          en: 'Brutto-Rauminhalt (BRI)',
          de: 'Brutto-Rauminhalt (BRI)'
        },
        field_value: {
          field_id: {
            field_name: `brutto_rauminhalt_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiHeatingCoil',
        key: {
          en: 'Technikfläche (TF)',
          de: 'Technikfläche (TF)'
        },
        field_value: {
          field_id: {
            field_name: `technik_flaeche_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiWalk',
        key: {
          en: 'Verkehrsfläche (VF)',
          de: 'Verkehrsfläche (VF)'
        },
        field_value: {
          field_id: {
            field_name: `verkehrs_flaeche_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiHumanMaleHeight',
        key: {
          en: 'Room height',
          de: 'Raumhöhe'
        },
        field_value: {
          field_id: {
            field_name: `room_height_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiFloorPlan',
        key: {
          en: 'Room perimeter',
          de: 'Raumumfang'
        },
        field_value: {
          field_id: {
            field_name: `slab_perimeter_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiWall',
        key: {
          en: 'Inside area (net)',
          de: 'Innenfläche (netto)'
        },
        field_value: {
          field_id: {
            field_name: `inside_area_net_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiWall',
        key: {
          en: 'Inside area (gross)',
          de: 'Innenfläche (brutto)'
        },
        field_value: {
          field_id: {
            field_name: `inside_area_gross_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiWall',
        key: {
          en: 'Outside area (net)',
          de: 'Außenfläche (netto)'
        },
        field_value: {
          field_id: {
            field_name: `outside_area_net_${uuidv4().substring(0, 8)}`
          }
        }
      },
      {
        icon: 'mdiWall',
        key: {
          en: 'Outside area (gross)',
          de: 'Außenfläche (brutto)'
        },
        field_value: {
          field_id: {
            field_name: `outside_area_gross_${uuidv4().substring(0, 8)}`
          }
        }
      }
    ]
  };
};

// Beispiel für eine leere ListingFlow-Struktur
const emptyFlow: ListingFlow = {
  id: 'new-flow',
  'url-key': 'new-flow',
  name: 'Neuer Flow',
  title: {
    de: 'Neuer Flow',
    en: 'New Flow'
  },
  icon: 'mdiFileOutline',
  pages_edit: [
    {
      pattern_type: 'CustomUIElement',
      id: `edit-${uuidv4()}`,
      layout: '2_COL_RIGHT_FILL', // Default-Layout für Edit-Seiten
      title: {
        de: 'Seite 1',
        en: 'Page 1'
      },
      short_title: {
        de: 'Seite 1', // short_title wird mit title synchronisiert
        en: 'Page 1'  // short_title wird mit title synchronisiert
      },
      elements: []
    }
  ],
  pages_view: []
};

// Funktion zum Erstellen eines Elements basierend auf dem angegebenen Typ
const createElement = (type: string): PatternLibraryElement => {
  switch (type) {
    case 'TextUIElement':
      return {
        element: {
          pattern_type: 'TextUIElement',
          required: false,
          type: 'PARAGRAPH',
          text: {
            de: 'Beispieltext',
            en: 'Example text'
          },
          title: {
            de: 'Text Element',
            en: 'Text Element'
          }
        } as TextUIElement
      };

    case 'BooleanUIElement':
      return {
        element: {
          pattern_type: 'BooleanUIElement',
          required: false,
          field_id: {
            field_name: `boolean_field_${uuidv4()}`
          },
          default_value: false,
          title: {
            de: 'Boolean Element',
            en: 'Boolean Element'
          }
        } as BooleanUIElement
      };

    case 'SingleSelectionUIElement':
      return {
        element: {
          pattern_type: 'SingleSelectionUIElement',
          required: false,
          field_id: {
            field_name: `selection_field_${uuidv4()}`
          },
          type: 'DROPDOWN',
          options: [
            { key: uuidv4(), label: { de: 'Option 1', en: 'Option 1' } },
            { key: uuidv4(), label: { de: 'Option 2', en: 'Option 2' } },
            { key: uuidv4(), label: { de: 'Option 3', en: 'Option 3' } }
          ],
          title: {
            de: 'Auswahl Element',
            en: 'Selection Element'
          }
        } as SingleSelectionUIElement
      };

    case 'NumberUIElement':
      return {
        element: {
          pattern_type: 'NumberUIElement',
          required: false,
          field_id: {
            field_name: `number_field_${uuidv4()}`
          },
          type: 'INTEGER',
          minimum: 0,
          maximum: 100,
          title: {
            de: 'Nummer Element',
            en: 'Number Element'
          }
        } as NumberUIElement
      };

    case 'DateUIElement':
      return {
        element: {
          pattern_type: 'DateUIElement',
          required: false,
          field_id: {
            field_name: `date_field_${uuidv4()}`
          },
          // Standardmäßig Jahresauswahl ('Y') entsprechend enion_esg.json
          type: 'Y',
          title: {
            de: 'Datum Element',
            en: 'Date Element'
          }
        } as DateUIElement
      };

    case 'FileUIElement':
      const fileUuid = uuidv4();
      return {
        element: {
          pattern_type: 'FileUIElement',
          required: false,
          file_type: 'IMAGE',
          allowed_file_types: ['image/jpeg', 'image/png'],
          // KRITISCH: field_id für eindeutige Identifikation des Elements
          field_id: {
            field_name: `fileuielement_${fileUuid}`
          },
          // KRITISCH: id_field_id für Speicherort der Datei-IDs (eindeutig mit UUID)
          id_field_id: {
            field_name: `file_images_id_${uuidv4()}`
          },
          // EMPFOHLEN: caption_field_id für Bildunterschriften (eindeutig mit UUID)
          caption_field_id: {
            field_name: `file_images_caption_${uuidv4()}`
          },
          // EMPFOHLEN: min_count und max_count definieren
          min_count: 0,
          max_count: 10,
          title: {
            de: 'Datei Element',
            en: 'File Element'
          },
          description: {
            de: '',
            en: ''
          }
        } as FileUIElement
      };

    case 'GroupUIElement':
      return {
        element: {
          pattern_type: 'GroupUIElement',
          required: false,
          isCollapsible: false,
          elements: [], // Leere Elemente-Liste
          title: {
            de: 'Gruppen Element',
            en: 'Group Element'
          }
        } as GroupUIElement
      };

    case 'ArrayUIElement':
      return {
        element: {
          pattern_type: 'ArrayUIElement',
          required: false,
          field_id: {
            field_name: `array_field_${uuidv4()}`
          },
          min_count: 0, // Korrigiert: min_count statt min_items
          max_count: 10, // Korrigiert: max_count statt max_items
          elements: [{ // Korrigiert: elements statt item_template
            element: {
              pattern_type: 'TextUIElement',
              required: false,
              type: 'PARAGRAPH',
              text: {
                de: 'Element in Array',
                en: 'Element in Array'
              },
              title: {
                de: 'Array Element',
                en: 'Array Element'
              }
            } as TextUIElement
          }],
          title: {
            de: 'Array Element',
            en: 'Array Element'
          }
        } as ArrayUIElement
      };

    case 'CustomUIElement':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          required: false,
          title: {
            de: 'Benutzerdefiniertes Element',
            en: 'Custom Element'
          }
        } as CustomUIElement
      };

    case 'CustomUIElement_SCANNER':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          type: 'SCANNER',
          id: `scanner-${uuidv4().substring(0, 8)}`,
          related_custom_ui_element_id: `scanner-view-${uuidv4().substring(0, 8)}`,
          display_position: 'RIGHT',
          required: false,
          title: {
            de: 'Scanner (Doorbit Studio)',
            en: 'Scanner (Doorbit Studio)'
          },
          sub_flows: [
            // POI_PHOTO subflow
            {
              type: 'POI_PHOTO',
              elements: [
                {
                  element: {
                    pattern_type: 'FileUIElement',
                    file_type: 'IMAGE',
                    title: {},
                    min_count: 0,
                    max_count: 1,
                    required: false,
                    id_field_id: {
                      field_name: `building_poi_pictures_id_${uuidv4()}`
                    },
                    caption_field_id: {
                      field_name: `building_poi_pictures_caption_${uuidv4()}`
                    },
                    allowed_file_types: []
                  }
                }
              ]
            },
            // POI subflow
            {
              type: 'POI',
              elements: [
                {
                  element: {
                    pattern_type: 'StringUIElement',
                    type: 'TEXT_AREA',
                    required: false,
                    field_id: {
                      field_name: `building_poi_text_${uuidv4()}`
                    },
                    title: {
                      en: 'Description',
                      de: 'Beschreibung'
                    }
                  }
                },
                {
                  element: {
                    pattern_type: 'ChipGroupUIElement',
                    required: false,
                    title: {},
                    chips: [
                      {
                        pattern_type: 'BooleanUIElement',
                        required: false,
                        icon: 'mdiAlert',
                        field_id: {
                          field_name: `building_poi_is_defect_${uuidv4()}`
                        },
                        default_value: false,
                        title: {
                          en: 'Defect',
                          de: 'Mangel'
                        }
                      },
                      {
                        pattern_type: 'BooleanUIElement',
                        required: false,
                        icon: 'mdiWrench',
                        field_id: {
                          field_name: `building_poi_is_todo_${uuidv4()}`
                        },
                        default_value: false,
                        title: {
                          en: 'Todo',
                          de: 'Todo'
                        }
                      }
                    ]
                  }
                },
                {
                  element: {
                    visibility_condition: {
                      field_id: {
                        field_name: 'building_poi_is_todo'
                      },
                      op: 'eq',
                      value: true,
                      operator_type: 'RFO'
                    },
                    pattern_type: 'DateUIElement',
                    type: 'YMD',
                    required: false,
                    field_id: {
                      field_name: 'building_poi_deadline_date'
                    },
                    title: {
                      en: 'To be done until',
                      de: 'Zu erledigen bis'
                    },
                    minimum: '-1Y'
                  }
                },
                {
                  element: {
                    pattern_type: 'ChipGroupUIElement',
                    required: false,
                    title: {},
                    chips: [
                      {
                        visibility_condition: {
                          operator: 'AND',
                          operator_type: 'LO',
                          conditions: [
                            {
                              field_id: {
                                field_name: 'building_poi_is_light_switch'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            },
                            {
                              field_id: {
                                field_name: 'building_poi_is_wall_socket'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            },
                            {
                              field_id: {
                                field_name: 'building_poi_is_lamp'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            }
                          ]
                        },
                        pattern_type: 'BooleanUIElement',
                        required: false,
                        icon: 'mdiRadiator',
                        field_id: {
                          field_name: 'building_poi_is_radiator'
                        },
                        default_value: false,
                        title: {
                          en: 'Radiator',
                          de: 'Heizkörper'
                        }
                      },
                      {
                        visibility_condition: {
                          operator: 'AND',
                          operator_type: 'LO',
                          conditions: [
                            {
                              field_id: {
                                field_name: 'building_poi_is_radiator'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            },
                            {
                              field_id: {
                                field_name: 'building_poi_is_lamp'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            }
                          ]
                        },
                        pattern_type: 'BooleanUIElement',
                        required: false,
                        icon: 'mdiLightSwitch',
                        field_id: {
                          field_name: 'building_poi_is_light_switch'
                        },
                        default_value: false,
                        title: {
                          en: 'Light switch',
                          de: 'Lichtschalter'
                        }
                      },
                      {
                        visibility_condition: {
                          operator: 'AND',
                          operator_type: 'LO',
                          conditions: [
                            {
                              field_id: {
                                field_name: 'building_poi_is_radiator'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            },
                            {
                              field_id: {
                                field_name: 'building_poi_is_lamp'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            }
                          ]
                        },
                        pattern_type: 'BooleanUIElement',
                        required: false,
                        icon: 'mdiPowerSocketDe',
                        field_id: {
                          field_name: 'building_poi_is_wall_socket'
                        },
                        default_value: false,
                        title: {
                          en: 'Wall socket',
                          de: 'Steckdose'
                        }
                      },
                      {
                        visibility_condition: {
                          operator: 'AND',
                          operator_type: 'LO',
                          conditions: [
                            {
                              field_id: {
                                field_name: 'building_poi_is_radiator'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            },
                            {
                              field_id: {
                                field_name: 'building_poi_is_light_switch'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            },
                            {
                              field_id: {
                                field_name: 'building_poi_is_wall_socket'
                              },
                              op: 'ne',
                              value: true,
                              operator_type: 'RFO'
                            }
                          ]
                        },
                        pattern_type: 'BooleanUIElement',
                        required: false,
                        icon: 'mdiLightbulbOn',
                        field_id: {
                          field_name: 'building_poi_is_lamp'
                        },
                        default_value: false,
                        title: {
                          en: 'Lamp',
                          de: 'Lampe'
                        }
                      }
                    ]
                  }
                },
                {
                  element: {
                    pattern_type: 'SingleSelectionUIElement',
                    required: true,
                    field_id: {
                      field_name: 'building_poi_radiator_type'
                    },
                    visibility_condition: {
                      field_id: {
                        field_name: 'building_poi_is_radiator'
                      },
                      op: 'eq',
                      value: true,
                      operator_type: 'RFO'
                    },
                    title: {
                      en: 'Type',
                      de: 'Typ'
                    },
                    options: [
                      {
                        key: 'RADIATOR',
                        label: {
                          en: 'Radiator',
                          de: 'Radiator'
                        },
                        icon: 'mdiFence'
                      },
                      {
                        key: 'PANEL_RADIATOR',
                        label: {
                          en: 'Panel radiator',
                          de: 'Plattenheizkörper'
                        },
                        icon: 'mdiRadiatorDisabled'
                      },
                      {
                        key: 'TUBE_RADIATOR',
                        label: {
                          en: 'Tube radiator',
                          de: 'Badheizkörper'
                        },
                        icon: 'mdiHeatingCoil'
                      },
                      {
                        key: 'CONVECTOR_HEATER',
                        label: {
                          en: 'Convector heater',
                          de: 'Konvektionsheizkörper'
                        },
                        icon: 'mdiRadiator'
                      }
                    ]
                  }
                },
                {
                  element: {
                    pattern_type: 'NumberUIElement',
                    type: 'INTEGER',
                    required: false,
                    field_id: {
                      field_name: 'building_poi_radiator_width'
                    },
                    title: {
                      en: 'Width',
                      de: 'Breite'
                    },
                    visibility_condition: {
                      field_id: {
                        field_name: 'building_poi_is_radiator'
                      },
                      op: 'eq',
                      value: true,
                      operator_type: 'RFO'
                    }
                  }
                },
                {
                  element: {
                    pattern_type: 'NumberUIElement',
                    type: 'INTEGER',
                    required: false,
                    field_id: {
                      field_name: 'building_poi_radiator_height'
                    },
                    title: {
                      en: 'Height',
                      de: 'Höhe'
                    },
                    visibility_condition: {
                      field_id: {
                        field_name: 'building_poi_is_radiator'
                      },
                      op: 'eq',
                      value: true,
                      operator_type: 'RFO'
                    }
                  }
                },
                {
                  element: {
                    pattern_type: 'NumberUIElement',
                    type: 'INTEGER',
                    required: false,
                    field_id: {
                      field_name: 'building_poi_radiator_depth'
                    },
                    title: {
                      en: 'Depth',
                      de: 'Tiefe'
                    },
                    visibility_condition: {
                      field_id: {
                        field_name: 'building_poi_is_radiator'
                      },
                      op: 'eq',
                      value: true,
                      operator_type: 'RFO'
                    }
                  }
                },
                {
                  element: {
                    pattern_type: 'FileUIElement',
                    file_type: 'IMAGE',
                    title: {
                      de: 'Fotos',
                      en: 'Photos'
                    },
                    min_count: 0,
                    max_count: 3,
                    required: false,
                    id_field_id: {
                      field_name: `building_poi_pictures_id_${uuidv4()}`
                    },
                    caption_field_id: {
                      field_name: `building_poi_pictures_caption_${uuidv4()}`
                    },
                    allowed_file_types: [
                      'image/jpeg',
                      'image/png',
                      'image/webp',
                      'image/tiff'
                    ]
                  }
                }
              ]
            },
            // ROOM subflow
            {
              type: 'ROOM',
              elements: [
                {
                  element: {
                    pattern_type: 'GroupUIElement',
                    required: false,
                    title: {
                      en: 'Heating information',
                      de: 'Angaben zur Beheizung'
                    },
                    description: {
                      en: 'Select how the room is heated. A room can also be heated by adjacent rooms if the rooms are connected by a breakthrough.',
                      de: 'Wähle aus, wie der Raum beheizt ist. Ein Raum kann auch durch angrenzende Räume mitbeheizt sein, wenn die Räume mittels Durchbruch verbunden sind.'
                    },
                    elements: [
                      {
                        element: {
                          pattern_type: 'BooleanUIElement',
                          required: true,
                          field_id: {
                            field_name: 'is_room_heated'
                          },
                          default_value: true,
                          title: {
                            en: 'Is room heated',
                            de: 'Ist der Raum beheizt?'
                          }
                        }
                      },
                      {
                        element: {
                          visibility_condition: {
                            field_id: {
                              field_name: 'is_room_heated'
                            },
                            op: 'eq',
                            value: true,
                            operator_type: 'RFO'
                          },
                          pattern_type: 'ChipGroupUIElement',
                          required: false,
                          title: {
                            en: 'How is the room heated?',
                            de: 'Wie ist der Raum beheizt?'
                          },
                          chips: [
                            {
                              pattern_type: 'BooleanUIElement',
                              uuid: generateUUID(),
                              required: false,
                              field_id: {
                                field_name: 'has_radiators'
                              },
                              default_value: false,
                              title: {
                                en: 'Radiators',
                                de: 'Heizkörper'
                              }
                            },
                            {
                              pattern_type: 'BooleanUIElement',
                              uuid: generateUUID(),
                              required: false,
                              field_id: {
                                field_name: 'has_underfloor_heating'
                              },
                              default_value: false,
                              title: {
                                en: 'Underfloor heating',
                                de: 'Fußbodenheizung'
                              }
                            },
                            {
                              pattern_type: 'BooleanUIElement',
                              uuid: generateUUID(),
                              required: false,
                              field_id: {
                                field_name: 'has_fire_place'
                              },
                              default_value: false,
                              title: {
                                en: 'Fire place',
                                de: 'Ofen'
                              }
                            },
                            {
                              pattern_type: 'BooleanUIElement',
                              uuid: generateUUID(),
                              required: false,
                              field_id: {
                                field_name: 'has_indirect_heating'
                              },
                              default_value: false,
                              title: {
                                en: 'Indirect heating',
                                de: 'Mitbeheizt'
                              }
                            }
                          ]
                        }
                      },
                      {
                        element: {
                          pattern_type: 'SingleSelectionUIElement',
                          uuid: generateUUID(),
                          required: true,
                          field_id: {
                            field_name: 'room_temperature_type'
                          },
                          visibility_condition: {
                            field_id: {
                              field_name: 'is_room_heated'
                            },
                            op: 'eq',
                            value: true,
                            operator_type: 'RFO'
                          },
                          title: {
                            en: 'Approx. room temperature',
                            de: 'Ungefähre Raumtemperatur'
                          },
                          options: [
                            {
                              key: 'LIVING_ROOM',
                              label: {
                                en: 'Living room (ca. 20°C)',
                                de: 'Wohnraum (ca. 20°C)'
                              }
                            },
                            {
                              key: 'BATHROOM',
                              label: {
                                en: 'Bathroom (ca. 24°C)',
                                de: 'Badezimmer (ca. 24°C)'
                              }
                            },
                            {
                              key: 'PASSAGE_ROOM',
                              label: {
                                en: 'Passage room (ca. 15°C)',
                                de: 'Flur / Abstellraum (ca. 15°C)'
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                },
                {
                  element: {
                    pattern_type: 'GroupUIElement',
                    uuid: generateUUID(),
                    required: false,
                    title: {
                      en: 'More details',
                      de: 'Weitere Angaben'
                    },
                    elements: [
                      {
                        element: {
                          pattern_type: 'SingleSelectionUIElement',
                          uuid: generateUUID(),
                          required: true,
                          field_id: {
                            field_name: 'room_category'
                          },
                          title: {
                            en: 'Room category',
                            de: 'Raumkategorie'
                          },
                          options: [
                            {
                              key: 'LIVING_ROOM',
                              label: {
                                en: 'Living room',
                                de: 'Wohnzimmer'
                              }
                            },
                            {
                              key: 'KITCHEN',
                              label: {
                                en: 'Kitchen',
                                de: 'Küche'
                              }
                            },
                            {
                              key: 'BEDROOM',
                              label: {
                                en: 'Bedroom',
                                de: 'Schlaf-/Kinderzimmer'
                              }
                            },
                            {
                              key: 'BATHROOM_GUEST_WC',
                              label: {
                                en: 'Bathroom/WC',
                                de: 'Badezimmer/WC'
                              }
                            }
                          ]
                        }
                      },
                      {
                        element: {
                          pattern_type: 'StringUIElement',
                          uuid: generateUUID(),
                          type: 'TEXT',
                          required: false,
                          field_id: {
                            field_name: 'room_name'
                          },
                          title: {
                            en: 'Custom room name',
                            de: 'Eigener Raumname'
                          },
                          description: {
                            en: 'Will be generated from the room category if nothing is maintained.',
                            de: 'Wird aus der Raumkategorie erzeugt, wenn nichts gepflegt wird.'
                          }
                        }
                      }
                    ]
                  }
                },
                {
                  element: {
                    pattern_type: 'GroupUIElement',
                    uuid: generateUUID(),
                    required: false,
                    title: {
                      en: 'Bill of quantities',
                      de: 'Massedaten'
                    },
                    elements: [
                      {
                        element: createBillOfQuantitiesElement()
                      }
                    ]
                  }
                }
              ]
            },
            // ROOM_GROUP subflow
            {
              type: 'ROOM_GROUP',
              elements: [
                {
                  element: {
                    pattern_type: 'GroupUIElement',
                    uuid: generateUUID(),
                    required: false,
                    title: {
                      en: 'Room group details',
                      de: 'Raumgruppen-Details'
                    },
                    elements: [
                      {
                        element: {
                          pattern_type: 'StringUIElement',
                          uuid: generateUUID(),
                          type: 'TEXT',
                          required: true,
                          field_id: {
                            field_name: 'room_group_name'
                          },
                          title: {
                            en: 'Room group name',
                            de: 'Raumgruppenname'
                          }
                        }
                      },
                      {
                        element: {
                          pattern_type: 'SingleSelectionUIElement',
                          uuid: generateUUID(),
                          required: true,
                          field_id: {
                            field_name: 'room_group_type'
                          },
                          title: {
                            en: 'Room group type',
                            de: 'Raumgruppentyp'
                          },
                          options: [
                            {
                              key: 'APARTMENT',
                              label: {
                                en: 'Apartment',
                                de: 'Wohnung'
                              }
                            },
                            {
                              key: 'FLOOR',
                              label: {
                                en: 'Floor',
                                de: 'Etage'
                              }
                            },
                            {
                              key: 'WING',
                              label: {
                                en: 'Wing',
                                de: 'Gebäudeflügel'
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                },
                {
                  element: {
                    pattern_type: 'GroupUIElement',
                    uuid: generateUUID(),
                    required: false,
                    title: {
                      en: 'Bill of quantities',
                      de: 'Massedaten'
                    },
                    elements: [
                      {
                        element: createBillOfQuantitiesElement()
                      }
                    ]
                  }
                }
              ]
            },
            // WINDOW subflow
            {
              type: 'WINDOW',
              elements: [
                {
                  element: {
                    pattern_type: 'BooleanUIElement',
                    required: false,
                    default_value: false,
                    field_id: {
                      field_name: 'has_roller_shutters'
                    },
                    title: {
                      en: 'Has roller shutters',
                      de: 'Rollladen vorhanden'
                    }
                  }
                },
                {
                  element: {
                    visibility_condition: {
                      field_id: {
                        field_name: 'has_roller_shutters'
                      },
                      op: 'eq',
                      value: true,
                      operator_type: 'RFO'
                    },
                    pattern_type: 'NumberUIElement',
                    type: 'DOUBLE',
                    required: false,
                    default: 0.25,
                    field_id: {
                      field_name: 'roller_shutters_height'
                    },
                    title: {
                      en: 'Roller shutters height',
                      de: 'Höhe des Rollladenkastens'
                    },
                    icon: 'mdiArrowExpandVertical'
                  }
                },
                {
                  element: {
                    pattern_type: 'BooleanUIElement',
                    required: false,
                    default_value: false,
                    field_id: {
                      field_name: 'has_heizkoerpernische'
                    },
                    title: {
                      en: 'Has radiator niche',
                      de: 'Heizkörpernische vorhanden'
                    }
                  }
                },
                {
                  element: {
                    visibility_condition: {
                      field_id: {
                        field_name: 'has_heizkoerpernische'
                      },
                      op: 'eq',
                      value: true,
                      operator_type: 'RFO'
                    },
                    pattern_type: 'NumberUIElement',
                    type: 'DOUBLE',
                    required: false,
                    field_id: {
                      field_name: 'heizkoerpernischen_height'
                    },
                    title: {
                      en: 'Radiator niche height',
                      de: 'Höhe der HZK-Nische'
                    },
                    icon: 'mdiArrowExpandVertical'
                  }
                },
                {
                  element: {
                    pattern_type: 'SingleSelectionUIElement',
                    required: true,
                    field_id: {
                      field_name: 'window_glazing_type'
                    },
                    title: {
                      en: 'Window glazing',
                      de: 'Fensterverglasung'
                    },
                    options: [
                      {
                        key: 'SINGLE',
                        label: {
                          en: 'Single glazing',
                          de: '1-fach'
                        }
                      },
                      {
                        key: 'DOUBLE',
                        label: {
                          en: 'Double glazing',
                          de: '2-fach'
                        }
                      },
                      {
                        key: 'TRIPLE',
                        label: {
                          en: 'Triple glazing',
                          de: '3-fach'
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        } as CustomUIElement
      };

    case 'CustomUIElement_ADDRESS':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          type: 'ADDRESS',
          id: `address-${uuidv4().substring(0, 8)}`,
          required: false,
          title: {
            de: 'Adresse ermitteln',
            en: 'Determine address'
          },
          short_title: {
            de: 'Adresse',
            en: 'Address'
          },
          elements: [
            {
              element: {
                pattern_type: 'BooleanUIElement',
                required: false,
                field_id: {
                  field_name: 'address_show_obfuscated_location'
                },
                default_value: false,
                title: {
                  de: 'Adresse verbergen?',
                  en: 'Hide address?'
                },
                description: {
                  de: 'Wird die Adresse verborgen, ist sie nicht öffentlich sichtbar. Stattdessen wird ein ungefährer Standort präsentiert.',
                  en: 'If the address is hidden, it won\'t be publicly visible. Instead, an approximate location will be displayed.'
                }
              }
            }
          ]
        } as CustomUIElement
      };

    case 'CustomUIElement_LOCATION':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          type: 'LOCATION',
          id: `location-${uuidv4().substring(0, 8)}`,
          icon: 'mdiMapMarker',
          required: false,
          short_title: {
            de: 'Lage',
            en: 'Location'
          },
          title: {
            de: 'Standort',
            en: 'Location'
          },
          elements: []
        } as CustomUIElement
      };

    case 'CustomUIElement_ADMIN_BOUNDARY':
      return {
        element: {
          pattern_type: 'CustomUIElement',
          type: 'ADMIN_BOUNDARY',
          id: `admin-boundary-${uuidv4().substring(0, 8)}`,
          icon: 'mdiHomeGroup',
          required: false,
          short_title: {
            de: 'Nachbarschaft',
            en: 'Administrative boundary'
          },
          title: {
            de: 'Umgebungsinfos',
            en: 'Environment information'
          },
          elements: []
        } as CustomUIElement
      };

    case 'ChipGroupUIElement': {
      // Erstelle BooleanUIElements direkt, ohne PatternLibraryElement-Wrapper
      const bool1: BooleanUIElement = {
        pattern_type: 'BooleanUIElement',
        required: false,
        field_id: { field_name: `chip_${uuidv4()}` },
        title: { de: 'Option 1', en: 'Option 1' },
        description: { de: 'Erste Option', en: 'First option' }
      };

      const bool2: BooleanUIElement = {
        pattern_type: 'BooleanUIElement',
        required: false,
        field_id: { field_name: `chip_${uuidv4()}` },
        title: { de: 'Option 2', en: 'Option 2' },
        description: { de: 'Zweite Option', en: 'Second option' }
      };

      return {
        element: {
          pattern_type: 'ChipGroupUIElement',
          required: false,
          title: {
            de: 'Chip-Gruppe Element',
            en: 'Chip Group Element'
          },
          // ChipGroupUIElement.chips erwartet BooleanUIElement[], nicht PatternLibraryElement[]
          chips: [bool1, bool2]
        } as ChipGroupUIElement
      };
    }

    case 'StringUIElement':
      return {
        element: {
          pattern_type: 'StringUIElement',
          required: false,
          type: 'TEXT',
          field_id: {
            field_name: `string_field_${uuidv4()}`
          },
          length_minimum: 0,
          length_maximum: 100,
          title: {
            de: 'String Element',
            en: 'String Element'
          }
        } as StringUIElement
      };

    case 'ImageGalleryUIElement':
      return {
        element: {
          pattern_type: 'ImageGalleryUIElement',
          required: false,
          preferred_size: 'M',
          display_position: 'LEFT',
          id_field_value: { field_id: { field_name: '' } },
          title: {
            de: 'Bildergalerie',
            en: 'Image Gallery'
          }
        } as ImageGalleryUIElement
      };

    case 'FieldTextUIElement':
      return {
        element: {
          pattern_type: 'FieldTextUIElement',
          required: false,
          type: 'PARAGRAPH',
          field_value: { field_id: { field_name: '' } },
          title: {
            de: 'Feldtext',
            en: 'Field Text'
          }
        } as FieldTextUIElement
      };

    case 'TableUIElement':
      return {
        element: {
          pattern_type: 'TableUIElement',
          required: false,
          type: 'TABLE',
          columns: [],
          title: {
            de: 'Tabelle',
            en: 'Table'
          }
        } as TableUIElement
      };

    case 'ContactUIElement':
      return {
        element: {
          pattern_type: 'ContactUIElement',
          required: false,
          identity_type: 'USER_ID',
          show_name: true,
          show_picture: true,
          show_details: false,
          title: {
            de: 'Kontakt',
            en: 'Contact'
          }
        } as ContactUIElement
      };

    default:
      // Fallback auf TextUIElement
      return {
        element: {
          pattern_type: 'TextUIElement',
          required: false,
          type: 'PARAGRAPH',
          text: {
            de: 'Beispieltext',
            en: 'Example text'
          },
          title: {
            de: 'Text Element',
            en: 'Text Element'
          }
        } as TextUIElement
      };
  }
};

const AppContent: React.FC = () => {
  const { state, dispatch } = useEditor();
  const [selectedElementPath, setSelectedElementPath] = useState<number[]>([]);
  const [showFlowMetadataDialog, setShowFlowMetadataDialog] = useState<boolean>(false);
  const [showModuleManager, setShowModuleManager] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  // Erstkontakt-Onboarding: beim ersten Start automatisch zeigen (einmalig via localStorage).
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem('flowToolkit.onboardingSeen') !== 'true';
    } catch {
      return false;
    }
  });
  const closeOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem('flowToolkit.onboardingSeen', 'true');
    } catch {
      /* localStorage nicht verfügbar — kein Hard-Fail */
    }
  };
  const { showSuccess, showWarning, showError, confirm } = useFeedback();
  // Shims auf das zentrale Feedback-System — halten die bestehenden Aufrufstellen kompatibel
  const setGroupErrorSnackbar = (s: { open: boolean; message: string }) => { if (s.open) showWarning(s.message); };
  const setSuccessSnackbar = (s: { open: boolean; message: string }) => { if (s.open) showSuccess(s.message); };
  // Copy/Export dialog state
  const [copyToPageDialogState, setCopyToPageDialogState] = useState<{ open: boolean; elementPath: number[] }>({ open: false, elementPath: [] });
  const [exportToFileDialogState, setExportToFileDialogState] = useState<{ open: boolean; elementPath: number[] }>({ open: false, elementPath: [] });

  // Diese Funktion wurde durch handleSaveWorkflowName ersetzt

  // Tastaturkürzel: Ctrl+Z = Undo, Ctrl+Y = Redo, Ctrl+S = Speichern, Escape = Selektion beenden
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Nicht in Input-Feldern, Textareas oder Selects auslösen
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      // Auch nicht in contenteditable Elementen
      if (target.isContentEditable) return;

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (state.undoStack.length > 0) {
          dispatch({ type: 'UNDO' });
        }
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        if (state.redoStack.length > 0) {
          dispatch({ type: 'REDO' });
        }
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape' && state.isSelectionMode) {
        dispatch({ type: 'TOGGLE_SELECTION_MODE' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.undoStack.length, state.redoStack.length, state.isSelectionMode]);

  // Initialisierung mit leerem Flow oder Mock-Daten
  useEffect(() => {
    // Wir initialisieren den Flow sofort
    dispatch({ type: 'SET_FLOW', flow: emptyFlow });
  }, [dispatch]);

  // Handler für das Öffnen der Dokumentation in einem neuen Tab
  const handleOpenDocumentation = () => {
    // Nutze process.env.PUBLIC_URL für korrekte Pfade in Produktion und Development
    const documentationUrl = `${process.env.PUBLIC_URL}/documentation.html`;
    window.open(documentationUrl, '_blank', 'noopener,noreferrer');
  };



  // Finde aktuelle Seite anhand der selectedPageId im EditorContext
  const currentPage = state.currentFlow?.pages_edit.find(page => page.id === state.selectedPageId);
  const currentElements = currentPage?.elements || [];

  // Verschachtelungsregeln: siehe utils/nestingRules.ts (geteilt mit dem Element-Typ-Dialog)

  // Element-Handler für Haupt- und verschachtelte Elemente
  // Verbesserte Version, die besser mit der Komplexität von doorbit_original.json umgehen kann
  const handleAddElement = (type: string, parentPath?: number[]) => {
    if (!state.selectedPageId) return;

    logger.log('[AppContent handleAddElement] type:', type, 'parentPath:', parentPath);
    const newElement = createElement(type);

    if (parentPath && parentPath.length > 0) {
      // Ziel-Element anhand des Pfads holen
      const currentPage = state.currentFlow?.pages_edit.find(page => page.id === state.selectedPageId);
      if (!currentPage) return;

      // Verwende die verbesserte getElementByPath-Funktion, um das Ziel-Element zu finden
      const target = getElementByPath(currentPage.elements, parentPath);
      logger.log('[AppContent handleAddElement] Ziel-Element gefunden:', target);

      if (!target) {
        logger.error('[AppContent handleAddElement] Ziel-Element nicht gefunden für Pfad:', parentPath);
        return;
      }

      // Bestimme den Containertyp des Zielelements
      const containerType = getContainerType(target);
      logger.log('[AppContent handleAddElement] Container-Typ:', containerType);

      // Prüfe die Verschachtelungsregeln
      if (target.element) {
        const parentType = target.element.pattern_type;
        const elementType = newElement.element.pattern_type;
        const { allowed, message } = isElementAllowedInParent(elementType, parentType);

        if (!allowed) {
          showError(message);
          return;
        }
      }

      // Spezielle Behandlung für verschiedene Containertypen
      switch (containerType) {
        case 'chipgroup':
          // Spezielle Behandlung für ChipGroupUIElement
          handleAddToChipGroup(target, newElement, parentPath);
          break;

        case 'custom':
          // Prüfen, ob das CustomUIElement sub_flows hat
          if ((target.element as any).sub_flows) {
            // Wenn wir direkt in das CustomUIElement einfügen wollen (nicht in einen bestehenden sub_flow)
            if (type.startsWith('CustomUIElement_')) {
              // Füge einen neuen sub_flow hinzu
              handleAddToCustomElement(target, newElement, parentPath);
            } else {
              // Normales Element zu einem CustomUIElement hinzufügen
              dispatch({
                type: 'ADD_SUB_ELEMENT',
                element: newElement,
                path: [...parentPath, 0], // Am Anfang der Unterelemente hinzufügen
                pageId: state.selectedPageId
              });
            }
          } else {
            // CustomUIElement ohne sub_flows behandeln wie ein normales Element
            dispatch({
              type: 'ADD_SUB_ELEMENT',
              element: newElement,
              path: [...parentPath, 0], // Am Anfang der Unterelemente hinzufügen
              pageId: state.selectedPageId
            });
          }
          break;

        case 'subflow':
          // Spezielle Behandlung für Subflow-Objekte
          handleAddToSubflow(target, newElement, parentPath);
          break;

        default:
          // Standardbehandlung für andere Containertypen (group, array, etc.)
          dispatch({
            type: 'ADD_SUB_ELEMENT',
            element: newElement,
            path: [...parentPath, 0], // Am Anfang der Unterelemente hinzufügen
            pageId: state.selectedPageId
          });
          break;
      }
    } else {
      // Element auf oberster Ebene hinzufügen
      dispatch({
        type: 'ADD_ELEMENT',
        element: newElement,
        pageId: state.selectedPageId
      });
    }
  };

  // Hilfsfunktion zum Hinzufügen eines Elements zu einer ChipGroup
  const handleAddToChipGroup = (_chipGroup: PatternLibraryElement, newElement: PatternLibraryElement, parentPath: number[]) => {
    // Deep Copy des Flows
    const updatedFlow = JSON.parse(JSON.stringify(state.currentFlow));
    const pageIndex = updatedFlow.pages_edit.findIndex((page: { id: string }) => page.id === state.selectedPageId);
    if (pageIndex === -1) return;

    // Navigiere zu ChipGroup anhand des Pfads
    let chipGroupObj = getElementByPathInObject(updatedFlow.pages_edit[pageIndex].elements, parentPath);
    if (!chipGroupObj || !chipGroupObj.element) {
      logger.error('[handleAddToChipGroup] ChipGroup nicht gefunden');
      return;
    }

    // Füge das neue BooleanUIElement zu chips hinzu
    if (!chipGroupObj.element.chips) chipGroupObj.element.chips = [];

    // BooleanUIElement extrahieren - ChipGroup erwartet BooleanUIElement, nicht PatternLibraryElement
    const boolElement = newElement.element && newElement.element.pattern_type === 'BooleanUIElement'
      ? {
          ...newElement.element,
          field_id: { field_name: `chip_${uuidv4()}` } // Stelle sicher, dass die field_id eindeutig ist
        }
      : {
          pattern_type: 'BooleanUIElement',
          required: false,
          field_id: { field_name: `chip_${uuidv4()}` },
          title: { de: 'Neue Option', en: 'New Option' }
        };

    chipGroupObj.element.chips.push(boolElement);
    dispatch({ type: 'UPDATE_FLOW', flow: updatedFlow });
  };

  // Hilfsfunktion zum Hinzufügen eines Elements zu einem CustomUIElement mit sub_flows
  const handleAddToCustomElement = (_customElement: PatternLibraryElement, newElement: PatternLibraryElement, parentPath: number[]) => {
    // Deep Copy des Flows
    const updatedFlow = JSON.parse(JSON.stringify(state.currentFlow));
    const pageIndex = updatedFlow.pages_edit.findIndex((page: { id: string }) => page.id === state.selectedPageId);
    if (pageIndex === -1) return;

    // Navigiere zu CustomUIElement anhand des Pfads
    let customElementObj = getElementByPathInObject(updatedFlow.pages_edit[pageIndex].elements, parentPath);
    if (!customElementObj || !customElementObj.element) {
      logger.error('[handleAddToCustomElement] CustomUIElement nicht gefunden');
      return;
    }

    // Stelle sicher, dass sub_flows existiert
    if (!customElementObj.element.sub_flows) customElementObj.element.sub_flows = [];

    // Füge den neuen sub_flow hinzu
    customElementObj.element.sub_flows.push(newElement.element);

    dispatch({ type: 'UPDATE_FLOW', flow: updatedFlow });
  };

  // Hilfsfunktion zum Hinzufügen eines Elements zu einem Subflow
  const handleAddToSubflow = (_subflow: PatternLibraryElement, newElement: PatternLibraryElement, parentPath: number[]) => {
    // Deep Copy des Flows
    const updatedFlow = JSON.parse(JSON.stringify(state.currentFlow));
    const pageIndex = updatedFlow.pages_edit.findIndex((page: { id: string }) => page.id === state.selectedPageId);
    if (pageIndex === -1) return;

    // Navigiere zu Subflow anhand des Pfads
    let subflowObj = getElementByPathInObject(updatedFlow.pages_edit[pageIndex].elements, parentPath);
    if (!subflowObj || !subflowObj.element) {
      logger.error('[handleAddToSubflow] Subflow nicht gefunden');
      return;
    }

    // Stelle sicher, dass elements existiert
    if (!subflowObj.element.elements) subflowObj.element.elements = [];

    // Füge das neue Element hinzu
    subflowObj.element.elements.unshift(newElement.element);

    dispatch({ type: 'UPDATE_FLOW', flow: updatedFlow });
  };

  // Hilfsfunktion zum Finden eines Elements in einem Objekt anhand eines Pfads
  const getElementByPathInObject = (elements: any[], path: number[]): any => {
    if (!elements || elements.length === 0 || path.length === 0) return null;

    let current = elements;
    let currentElement = null;

    for (let i = 0; i < path.length; i++) {
      const index = path[i];

      if (Array.isArray(current) && index < current.length) {
        currentElement = current[index];

        // Navigiere weiter, wenn es nicht das letzte Element im Pfad ist
        if (i < path.length - 1) {
          if (currentElement.element) {
            // PatternLibraryElement
            if (currentElement.element.elements) {
              current = currentElement.element.elements;
            } else if (currentElement.element.chips) {
              current = currentElement.element.chips;
            } else if (currentElement.element.sub_flows) {
              current = currentElement.element.sub_flows;
            } else {
              // Keine weiteren Kinder
              return null;
            }
          } else {
            // Direktes Element (z.B. in sub_flows oder chips)
            if (currentElement.elements) {
              current = currentElement.elements;
            } else if (currentElement.chips) {
              current = currentElement.chips;
            } else if (currentElement.sub_flows) {
              current = currentElement.sub_flows;
            } else {
              // Keine weiteren Kinder
              return null;
            }
          }
        }
      } else {
        // Ungültiger Index
        return null;
      }
    }

    return currentElement;
  };

  // Diese Funktion wird vom HybridEditor intern verwendet
  // und muss nicht mehr hier definiert werden
  // const handleUpdateElement = (updatedElement: PatternLibraryElement) => {
  //   // Implementierung auskommentiert, da sie jetzt im HybridEditor ist
  // };

  // ==================== Multi-Selektion Handlers ====================

  /** Selektionsmodus ein-/ausschalten */
  const handleToggleSelectionMode = () => {
    dispatch({ type: 'TOGGLE_SELECTION_MODE' });
  };

  /** Element zur Multi-Selektion hinzufügen/entfernen */
  const handleMultiSelect = (path: number[]) => {
    if (!state.selectedPageId) return;
    dispatch({ type: 'TOGGLE_MULTI_SELECT', path, pageId: state.selectedPageId });
  };

  /** Multi-Selektion zurücksetzen */
  const handleClearMultiSelect = () => {
    dispatch({ type: 'CLEAR_MULTI_SELECT' });
  };

  /**
   * Selektierte Elemente in eine neue Gruppe zusammenfassen.
   * Führt 5 Validierungen durch bevor der Dispatch erfolgt.
   */
  const handleWrapInGroup = (paths: number[][], groupTitle: string, groupFieldId: string) => {
    if (!state.selectedPageId || paths.length < 1) return;

    // 1. Gleiche Elternebene: Alle Pfade müssen denselben Parent-Pfad haben
    const parentPaths = paths.map(p => JSON.stringify(p.slice(0, -1)));
    const uniqueParents = new Set(parentPaths);
    if (uniqueParents.size !== 1) {
      setGroupErrorSnackbar({ open: true, message: 'Nur Elemente derselben Ebene können gruppiert werden.' });
      return;
    }

    const parentPath = paths[0].slice(0, -1);

    // 2. Nicht in SubFlow: SubFlow-Pfade ausschließen (Phase 1)
    if (parentPath.length > 0) {
      const parentElement = getElementByPath(currentElements, parentPath);
      if (parentElement) {
        const parentType = parentElement.element.pattern_type;
        // CustomUIElement mit sub_flows = SubFlow
        if (parentType === 'CustomUIElement' || parentType?.startsWith('CustomUIElement_')) {
          setGroupErrorSnackbar({ open: true, message: 'Elemente innerhalb eines SubFlows können nicht gruppiert werden.' });
          return;
        }
      }
    }

    // 3. Nicht in ArrayUIElement
    if (parentPath.length > 0) {
      const parentElement = getElementByPath(currentElements, parentPath);
      if (parentElement && parentElement.element.pattern_type === 'ArrayUIElement') {
        setGroupErrorSnackbar({ open: true, message: 'Elemente innerhalb eines Arrays können nicht gruppiert werden.' });
        return;
      }
    }

    // 4. Keine Chips: Parent darf kein ChipGroupUIElement sein
    if (parentPath.length > 0) {
      const parentElement = getElementByPath(currentElements, parentPath);
      if (parentElement && parentElement.element.pattern_type === 'ChipGroupUIElement') {
        setGroupErrorSnackbar({ open: true, message: 'Chips innerhalb einer Chip-Gruppe können nicht gruppiert werden.' });
        return;
      }
    }

    // 5. Kein GroupUIElement in der Selektion
    for (const path of paths) {
      const element = getElementByPath(currentElements, path);
      if (element && element.element.pattern_type === 'GroupUIElement') {
        setGroupErrorSnackbar({ open: true, message: 'Gruppen können nicht erneut gruppiert werden.' });
        return;
      }
    }

    // Alle Validierungen bestanden → Dispatch
    dispatch({
      type: 'WRAP_IN_GROUP',
      payload: { paths, groupTitle, groupFieldId, pageId: state.selectedPageId }
    });

    // Selektion zurücksetzen
    setSelectedElementPath([]);
    setSuccessSnackbar({ open: true, message: `${paths.length} Elemente wurden zu Gruppe "${groupTitle}" zusammengefasst.` });
  };

  /**
   * Gruppierung eines GroupUIElement auflösen.
   * Extrahiert die Kinder der Gruppe und fügt sie an der Stelle der Gruppe ein.
   */
  const handleUngroup = (path: number[]) => {
    if (!state.selectedPageId || path.length === 0) return;

    // Validierung: Element muss ein GroupUIElement sein
    const element = getElementByPath(currentElements, path);
    if (!element || element.element.pattern_type !== 'GroupUIElement') {
      setGroupErrorSnackbar({ open: true, message: 'Nur Gruppen können aufgelöst werden.' });
      return;
    }

    const groupTitle = (element.element as any).title?.de || 'Gruppe';
    dispatch({
      type: 'UNGROUP',
      payload: { path, pageId: state.selectedPageId }
    });

    // Selektion zurücksetzen
    setSelectedElementPath([]);
    setSuccessSnackbar({ open: true, message: `Gruppe "${groupTitle}" wurde aufgelöst.` });
  };

  // ==================== Copy to Page / Export to File ====================

  /**
   * Opens the "Copy to Page" dialog for the element at the given path
   */
  const handleCopyToPage = (path: number[]) => {
    if (!state.selectedPageId || path.length === 0) return;
    const element = getElementByPath(currentElements, path);
    if (!element) {
      setGroupErrorSnackbar({ open: true, message: 'Element konnte nicht gefunden werden.' });
      return;
    }
    setCopyToPageDialogState({ open: true, elementPath: path });
  };

  /**
   * Called when user confirms the copy-to-page dialog
   */
  const handleCopyElementToPageConfirm = (targetPageId: string, position: 'top' | 'bottom') => {
    const element = getElementByPath(currentElements, copyToPageDialogState.elementPath);
    if (!element) return;

    // Clone with new field_ids (intra-file copy, avoid duplicates)
    const cloned = deepCloneElement(element, { preserveFieldIds: false, regenerateUUIDs: true });

    dispatch({
      type: 'COPY_ELEMENT_TO_PAGE',
      payload: { targetPageId, clonedElement: cloned, position }
    });

    setCopyToPageDialogState({ open: false, elementPath: [] });
    const elementTitle = (element.element as any).title?.de || (element.element as any).field_id?.field_name || 'Element';
    setSuccessSnackbar({ open: true, message: `"${elementTitle}" wurde erfolgreich kopiert.` });
  };

  /**
   * Opens the "Export to File" dialog for the element at the given path
   */
  const handleExportToFile = (path: number[]) => {
    if (path.length === 0) return;
    const element = getElementByPath(currentElements, path);
    if (!element) {
      setGroupErrorSnackbar({ open: true, message: 'Element konnte nicht gefunden werden.' });
      return;
    }
    setExportToFileDialogState({ open: true, elementPath: path });
  };

  // ==================== Ende Copy to Page / Export to File ====================

  // ==================== Ende Multi-Selektion ====================

  const handleSelectElement = (path: number[]) => {
    if (!state.selectedPageId) return;

    setSelectedElementPath(path);

    dispatch({
      type: 'SELECT_ELEMENT_BY_PATH',
      path,
      pageId: state.selectedPageId
    });
  };

  const handleRemoveElement = (path: number[]) => {
    if (!state.selectedPageId) return;

    // Element-Titel vor dem Entfernen ermitteln
    const elementToRemove = currentPage ? getElementByPath(currentPage.elements, path) : null;
    const removedTitle = elementToRemove ? ((elementToRemove.element as any).title?.de || (elementToRemove.element as any).field_id?.field_name || 'Element') : 'Element';

    if (path.length === 1) {
      // Element auf oberster Ebene entfernen
      dispatch({
        type: 'REMOVE_ELEMENT',
        elementIndex: path[0],
        pageId: state.selectedPageId
      });
    } else {
      // Verschachteltes Element entfernen
      dispatch({
        type: 'REMOVE_SUB_ELEMENT',
        path,
        pageId: state.selectedPageId
      });
    }

    // Selektion zurücksetzen, wenn das aktuell ausgewählte Element entfernt wurde
    if (JSON.stringify(selectedElementPath) === JSON.stringify(path)) {
      setSelectedElementPath([]);
    }
    setSuccessSnackbar({ open: true, message: `"${removedTitle}" wurde gelöscht.` });
  };

  /**
   * Regeneriert field_ids für duplizierte Elemente.
   * Delegiert an die zentrale deepCloneElement-Utility, die alle Element-Typen
   * rekursiv verarbeitet (GroupUIElement, ArrayUIElement, ChipGroupUIElement,
   * CustomUIElement mit sub_flows, SingleSelectionUIElement, FileUIElement).
   */
  const regenerateFieldIds = (element: PatternLibraryElement): PatternLibraryElement => {
    return deepCloneElement(element, { preserveFieldIds: false, regenerateUUIDs: true });
  };

  const handleDuplicateElement = (path: number[]) => {
    if (!state.selectedPageId || !currentPage) return;

    const elementToDuplicate = getElementByPath(currentPage.elements, path);
    if (!elementToDuplicate) return;

    // Regeneriere alle field_ids im duplizierten Element und seinen Unterelementen
    const duplicatedElement = regenerateFieldIds(elementToDuplicate);

    if (path.length === 1) {
      // Element auf oberster Ebene duplizieren
      dispatch({
        type: 'ADD_ELEMENT',
        element: duplicatedElement,
        pageId: state.selectedPageId
      });
    } else {
      // Verschachteltes Element duplizieren
      const parentPath = path.slice(0, -1);
      const siblingIndex = path[path.length - 1] + 1;
      const targetPath = [...parentPath, siblingIndex];

      dispatch({
        type: 'ADD_SUB_ELEMENT',
        element: duplicatedElement,
        path: targetPath,
        pageId: state.selectedPageId
      });
    }
    const elTitle = (elementToDuplicate.element as any).title?.de || (elementToDuplicate.element as any).field_id?.field_name || 'Element';
    setSuccessSnackbar({ open: true, message: `"${elTitle}" wurde dupliziert.` });
  };

  // Datei-Handler
  const handleNew = async () => {
    const ok = await confirm({
      title: 'Neuen Flow erstellen?',
      message: 'Ungespeicherte Änderungen gehen verloren.',
      confirmLabel: 'Neu erstellen',
      destructive: true,
    });
    if (ok) {
      dispatch({ type: 'SET_FLOW', flow: emptyFlow });
      setSelectedElementPath([]);
      // Die selectedPageId wird automatisch in der SET_FLOW Aktion gesetzt
    }
  };

  // Handler für das Bearbeiten der Flow-Metadaten
  const handleEditWorkflowName = () => {
    setShowFlowMetadataDialog(true);
  };

  // Handler für das Speichern der Flow-Metadaten (id, url-key, name, title, icon)
  const handleSaveFlowMetadata = (meta: FlowMetadata) => {
    const fields = {
      id: meta.id,
      'url-key': meta.urlKey,
      name: meta.name,
      title: { de: meta.titleDe, en: meta.titleEn || meta.titleDe },
      icon: meta.icon,
    };

    if (state.currentFlow) {
      dispatch({ type: 'UPDATE_FLOW', flow: { ...state.currentFlow, ...fields } });
    } else {
      dispatch({ type: 'SET_FLOW', flow: { ...emptyFlow, ...fields } });
    }
  };

  const handleOpen = () => {
    // Öffne einen Datei-Dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            // Vor dem Ersetzen eines nicht-leeren Flows um Bestätigung bitten (Datenverlust-Schutz)
            const hasContent = !!state.currentFlow &&
              ((state.currentFlow.pages_edit?.length ?? 0) > 0 || (state.currentFlow.pages_view?.length ?? 0) > 0);
            if (hasContent) {
              const ok = await confirm({
                title: 'Flow ersetzen?',
                message: 'Der aktuelle Flow wird durch die geöffnete Datei ersetzt. Ungespeicherte Änderungen gehen verloren.',
                confirmLabel: 'Ersetzen',
                destructive: true,
              });
              if (!ok) return;
            }
            // Normalisiere die Elementtypen, bevor der Flow gesetzt wird
            const { normalizeElementTypes } = await import('./utils/normalizeUtils');
            const normalizedJson = normalizeElementTypes(json);
            dispatch({ type: 'SET_FLOW', flow: normalizedJson });
            setSelectedElementPath([]);
            showSuccess('Flow erfolgreich geöffnet.');
            // Die selectedPageId wird automatisch in der SET_FLOW Aktion gesetzt
          } catch (error) {
            showError('Ungültiges JSON-Format: ' + error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSave = () => {
    if (!state.currentFlow) return;

    // Importiere die Validierungsfunktion
    import('./utils/fileElementValidator').then(async ({ validateAllFileUIElements }) => {
      // Validiere alle FileUIElements in pages_edit
      const editValidationResults = validateAllFileUIElements(
        state.currentFlow!.pages_edit.flatMap(page => page.elements || [])
      );

      // Validiere alle FileUIElements in pages_view
      const viewValidationResults = validateAllFileUIElements(
        state.currentFlow!.pages_view.flatMap(page => page.elements || [])
      );

      const allValidationResults = [...editValidationResults, ...viewValidationResults];

      // Zeige Warnungen und Fehler an
      if (allValidationResults.length > 0) {
        const errors = allValidationResults.filter(r => !r.result.isValid);
        const warnings = allValidationResults.filter(r => r.result.isValid && r.result.warnings.length > 0);

        let message = '';

        if (errors.length > 0) {
          message += '❌ FEHLER: Die folgenden FileUIElements haben kritische Probleme:\n\n';
          errors.forEach(({ path, result }) => {
            message += `Pfad: ${path}\n`;
            result.errors.forEach(error => {
              message += `  • ${error}\n`;
            });
            message += '\n';
          });
          message += '\n⚠️ Die JSON-Datei kann im Zielsystem NICHT korrekt dargestellt werden!\n\n';
          message += 'Möchten Sie trotzdem fortfahren?';

          if (!(await confirm({ title: 'Validierungsfehler', message, confirmLabel: 'Trotzdem fortfahren', destructive: true }))) {
            return;
          }
        } else if (warnings.length > 0) {
          message += '⚠️ WARNUNGEN: Die folgenden FileUIElements haben optionale Probleme:\n\n';
          warnings.forEach(({ path, result }) => {
            message += `Pfad: ${path}\n`;
            result.warnings.forEach(warning => {
              message += `  • ${warning}\n`;
            });
            message += '\n';
          });
          message += '\nMöchten Sie trotzdem fortfahren?';

          if (!(await confirm({ title: 'Warnungen', message, confirmLabel: 'Trotzdem fortfahren' }))) {
            return;
          }
        }
      }

      // Erstelle einen Blob aus dem exportbereiten JSON (ohne interne UUIDs)
      const exportFlow = transformFlowForExport(state.currentFlow!);
      const json = JSON.stringify(exportFlow, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Erstelle einen Link zum Herunterladen
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.currentFlow!.id || 'listing-flow'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessSnackbar({ open: true, message: `Flow "${state.currentFlow!.id || 'listing-flow'}" wurde erfolgreich gespeichert.` });
    });
  };

  // Diese Funktion wird vom HybridEditor intern verwendet
  // und muss nicht mehr hier definiert werden
  // const selectedElement = currentPage
  //   ? getElementByPath(currentPage.elements, selectedElementPath)
  //   : null;

  return (
    <FieldValuesProvider flow={state.currentFlow || undefined}>
      <AppContainer>
        <Navigation
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          canUndo={state.undoStack.length > 0}
          canRedo={state.redoStack.length > 0}
          onUndo={() => dispatch({ type: 'UNDO' })}
          onRedo={() => dispatch({ type: 'REDO' })}
          onEditWorkflowName={handleEditWorkflowName}
          onEditModules={() => setShowModuleManager(true)}
          onOpenDocumentation={handleOpenDocumentation}
          onShowShortcuts={() => setShowShortcuts(true)}
          onShowOnboarding={() => setShowOnboarding(true)}
          validationSlot={<ValidationStatus />}
          workflowName={state.currentFlow?.name || "Workflow"}
        />

        <KeyboardShortcutsDialog open={showShortcuts} onClose={() => setShowShortcuts(false)} />
        <OnboardingDialog open={showOnboarding} onClose={closeOnboarding} />

        {/* Flow-Metadaten-Dialog */}
        <FlowMetadataDialog
          open={showFlowMetadataDialog}
          onClose={() => setShowFlowMetadataDialog(false)}
          onSave={handleSaveFlowMetadata}
          initial={{
            name: state.currentFlow?.name ?? emptyFlow.name,
            id: state.currentFlow?.id ?? emptyFlow.id,
            urlKey: state.currentFlow?.['url-key'] ?? emptyFlow['url-key'],
            titleDe: state.currentFlow?.title?.de ?? '',
            titleEn: state.currentFlow?.title?.en ?? '',
            icon: state.currentFlow?.icon ?? emptyFlow.icon,
          }}
        />

        {/* Modul-Katalog-Manager */}
        <ModuleManagerDialog
          open={showModuleManager}
          onClose={() => setShowModuleManager(false)}
        />

        {/* Seitennavigation */}
        {state.currentFlow && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: tokens.surface.subtle }}>
            <PageNavigator
              pages={state.currentFlow.pages_edit}
              selectedPageId={state.selectedPageId}
            />
          </Box>
        )}

      <MainContent>
        {/* Verwende den neuen HybridEditor anstelle der separaten Komponenten */}
        <HybridEditor
          elements={currentElements}
          selectedElementPath={selectedElementPath}
          onSelectElement={handleSelectElement}
          onRemoveElement={handleRemoveElement}
          onDuplicateElement={handleDuplicateElement}
          isSelectionMode={state.isSelectionMode}
          selectedElementPaths={state.selectedElementPaths}
          onToggleSelectionMode={handleToggleSelectionMode}
          onMultiSelect={handleMultiSelect}
          onWrapInGroup={handleWrapInGroup}
          onClearMultiSelect={handleClearMultiSelect}
          onUngroup={handleUngroup}
          onCopyToPage={handleCopyToPage}
          onExportToFile={handleExportToFile}
          onAddSubElement={(parentPath, type) => {
            logger.log('[AppContent onAddSubElement] parentPath:', parentPath, 'type:', type);
            handleAddElement(type || 'TextUIElement', parentPath);
          }}
          onDropElement={handleAddElement}
          onAddElement={(type, elementPath) => {
            logger.log('[AppContent onAddElement] type:', type, 'elementPath:', elementPath);
            handleAddElement(type || 'TextUIElement', elementPath);
          }}
          onMoveElement={(sourceIndex, targetIndex, targetParentPath, sourcePath) => {
            if (!state.selectedPageId) return;

            // Bestimme, ob Quelle und Ziel auf oberster Ebene sind
            const isSourceTopLevel = !sourcePath || sourcePath.length === 1;
            const isTargetTopLevel = !targetParentPath || targetParentPath.length === 0;

            // Vollständiger Quellpfad
            const fullSourcePath = sourcePath || [sourceIndex];

            if (isSourceTopLevel && isTargetTopLevel) {
              // Fall 1: Verschieben eines Elements innerhalb der obersten Ebene
              dispatch({
                type: 'MOVE_ELEMENT',
                sourceIndex,
                targetIndex,
                pageId: state.selectedPageId
              });
            } else {
              // Fall 2: Verschieben zwischen Hierarchieebenen
              // Wir verwenden MOVE_SUB_ELEMENT für alle anderen Fälle
              const targetPath = isTargetTopLevel ? [targetIndex] : [...targetParentPath, targetIndex];

              dispatch({
                type: 'MOVE_SUB_ELEMENT',
                sourcePath: fullSourcePath,
                targetPath,
                pageId: state.selectedPageId
              });
            }
          }}
        />
      </MainContent>

      {/*
      JSON-Vorschau im eingeklappten Zustand unten - temporär auskommentiert
      Zum Reaktivieren einfach die Kommentarzeichen entfernen

      {state.currentFlow && (
        <Box
          sx={{
            height: '5vh',
            borderTop: `1px solid ${tokens.neutral.border}`,
            overflow: 'hidden',
            position: 'relative',
            '&:hover': {
              height: '30vh',
              transition: 'height 0.3s ease-in-out'
            }
          }}
        >
          <JsonPreview
            data={state.currentFlow}
            onEdit={({ updated_src }) => {
              dispatch({ type: 'UPDATE_FLOW', flow: updated_src });
            }}
          />
        </Box>
      )}
      */}
      {/* Copy to Page Dialog */}
      <CopyElementToPageDialog
        open={copyToPageDialogState.open}
        onClose={() => setCopyToPageDialogState({ open: false, elementPath: [] })}
        onCopy={handleCopyElementToPageConfirm}
        pages={state.currentFlow?.pages_edit || []}
        currentPageId={state.selectedPageId || ''}
        elementTitle={
          copyToPageDialogState.open && copyToPageDialogState.elementPath.length > 0
            ? (() => {
                const el = getElementByPath(currentElements, copyToPageDialogState.elementPath);
                return el ? ((el.element as any).title?.de || (el.element as any).field_id?.field_name || 'Element') : 'Element';
              })()
            : 'Element'
        }
      />

      {/* Export to File Dialog */}
      <ExportElementToFileDialog
        open={exportToFileDialogState.open}
        onClose={() => setExportToFileDialogState({ open: false, elementPath: [] })}
        elementToExport={
          exportToFileDialogState.open && exportToFileDialogState.elementPath.length > 0
            ? getElementByPath(currentElements, exportToFileDialogState.elementPath) || null
            : null
        }
        elementTitle={
          exportToFileDialogState.open && exportToFileDialogState.elementPath.length > 0
            ? (() => {
                const el = getElementByPath(currentElements, exportToFileDialogState.elementPath);
                return el ? ((el.element as any).title?.de || (el.element as any).field_id?.field_name || 'Element') : 'Element';
              })()
            : 'Element'
        }
      />

    </AppContainer>
    </FieldValuesProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SchemaProvider>
        <EditorProvider>
          <SubflowProvider>
            <UserPreferencesProvider>
              <FeedbackProvider>
                <AppContent />
              </FeedbackProvider>
            </UserPreferencesProvider>
          </SubflowProvider>
        </EditorProvider>
      </SchemaProvider>
    </ThemeProvider>
  );
};

export default App;
