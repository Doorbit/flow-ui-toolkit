import React, { createContext, useContext, ReactNode } from 'react';
import Ajv, { ErrorObject } from 'ajv';
import { ListingFlow } from '../models/listingFlow';

const ajv = new Ajv({ allErrors: true });

// Schema für das ListingFlow-Format
const listingFlowSchema = {
  type: 'object',
  required: ['id', 'url-key', 'name', 'title', 'icon', 'pages_edit', 'pages_view'],
  properties: {
    id: { type: 'string' },
    'url-key': { type: 'string' },
    name: { type: 'string' },
    title: {
      type: 'object',
      additionalProperties: { type: 'string' }
    },
    icon: { type: 'string' },
    pages_edit: {
      type: 'array',
      items: { $ref: '#/definitions/Page' }
    },
    pages_view: {
      type: 'array',
      items: { $ref: '#/definitions/Page' }
    }
  },
  definitions: {
    Page: {
      type: 'object',
      required: ['pattern_type', 'id', 'elements'],
      properties: {
        pattern_type: { type: 'string' },
        id: { type: 'string' },
        layout: { type: 'string' },
        related_pages: {
          type: 'array',
          items: {
            type: 'object',
            required: ['viewing_context', 'page_id'],
            properties: {
              viewing_context: { enum: ['VIEW', 'EDIT'] },
              page_id: { type: 'string' }
            }
          }
        },
        short_title: {
          type: 'object',
          additionalProperties: { type: 'string' }
        },
        title: {
          type: 'object',
          additionalProperties: { type: 'string' }
        },
        elements: {
          type: 'array',
          items: { $ref: '#/definitions/PatternLibraryElement' }
        }
      }
    },
    PatternLibraryElement: {
      type: 'object',
      required: ['element'],
      properties: {
        element: {
          oneOf: [
            { $ref: '#/definitions/TextUIElement' },
            { $ref: '#/definitions/BooleanUIElement' },
            { $ref: '#/definitions/SingleSelectionUIElement' },
            { $ref: '#/definitions/NumberUIElement' },
            { $ref: '#/definitions/DateUIElement' },
            { $ref: '#/definitions/FileUIElement' },
            { $ref: '#/definitions/GroupUIElement' },
            { $ref: '#/definitions/ArrayUIElement' },
            { $ref: '#/definitions/CustomUIElement' },
            { $ref: '#/definitions/ChipGroupUIElement' }
          ]
        }
      }
    },
    // Gemeinsame Eigenschaften für alle UI-Elemente
    UIElementBase: {
      type: 'object',
      required: ['pattern_type', 'required'],
      properties: {
        pattern_type: { type: 'string' },
        required: { type: 'boolean' },
        title: {
          type: 'object',
          additionalProperties: { type: 'string' }
        },
        short_title: {
          type: 'object',
          additionalProperties: { type: 'string' }
        },
        description: {
          type: 'object',
          additionalProperties: { type: 'string' }
        },
        example_image: { type: 'string' },
        icon: { type: 'string' },
        visibility_condition: {},
        tree_level: { type: 'number' },
        display_position: { enum: ['LEFT', 'RIGHT'] },
        display_variant: { enum: ['DEFAULT', 'FULLSCREEN'] }
      }
    },
    // Text UI Element
    TextUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'text'],
          properties: {
            pattern_type: { enum: ['TextUIElement'] },
            type: { enum: ['PARAGRAPH', 'HEADING'] },
            text: {
              type: 'object',
              additionalProperties: { type: 'string' }
            }
          }
        }
      ]
    },
    // Boolean UI Element
    BooleanUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'field_id'],
          properties: {
            pattern_type: { enum: ['BooleanUIElement'] },
            field_id: {
              type: 'object',
              required: ['field_name'],
              properties: {
                field_name: { type: 'string' }
              }
            },
            default_value: { type: 'boolean' }
          }
        }
      ]
    },
    // Single Selection UI Element
    SingleSelectionUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'field_id', 'options'],
          properties: {
            pattern_type: { enum: ['SingleSelectionUIElement'] },
            field_id: {
              type: 'object',
              required: ['field_name'],
              properties: {
                field_name: { type: 'string' }
              }
            },
            type: { enum: ['DROPDOWN', 'BUTTONGROUP'] },
            options: {
              type: 'array',
              items: {
                type: 'object',
                required: ['key'],
                properties: {
                  key: { type: 'string' },
                  label: {
                    type: 'object',
                    additionalProperties: { type: 'string' }
                  }
                }
              }
            },
            default: { type: 'string' }
          }
        }
      ]
    },
    // Number UI Element
    NumberUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'field_id'],
          properties: {
            pattern_type: { enum: ['NumberUIElement'] },
            field_id: {
              type: 'object',
              required: ['field_name'],
              properties: {
                field_name: { type: 'string' }
              }
            },
            min: { type: 'number' },
            max: { type: 'number' },
            step: { type: 'number' },
            default_value: { type: 'number' }
          }
        }
      ]
    },
    // Date UI Element
    DateUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'field_id'],
          properties: {
            pattern_type: { enum: ['DateUIElement'] },
            field_id: {
              type: 'object',
              required: ['field_name'],
              properties: {
                field_name: { type: 'string' }
              }
            },
            min_date: { type: 'string' },
            max_date: { type: 'string' },
            default_value: { type: 'string' }
          }
        }
      ]
    },
    // File UI Element
    FileUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'field_id'],
          properties: {
            pattern_type: { enum: ['FileUIElement'] },
            field_id: {
              type: 'object',
              required: ['field_name'],
              properties: {
                field_name: { type: 'string' }
              }
            },
            accepted_types: { 
              type: 'array',
              items: { type: 'string' }
            },
            max_size: { type: 'number' }
          }
        }
      ]
    },
    // Group UI Element
    GroupUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'elements'],
          properties: {
            pattern_type: { enum: ['GroupUIElement'] },
            elements: {
              type: 'array',
              items: { $ref: '#/definitions/PatternLibraryElement' }
            }
          }
        }
      ]
    },
    // Array UI Element
    ArrayUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'field_id', 'item_template'],
          properties: {
            pattern_type: { enum: ['ArrayUIElement'] },
            field_id: {
              type: 'object',
              required: ['field_name'],
              properties: {
                field_name: { type: 'string' }
              }
            },
            min_items: { type: 'number' },
            max_items: { type: 'number' },
            item_template: { $ref: '#/definitions/PatternLibraryElement' }
          }
        }
      ]
    },
    // Custom UI Element
    CustomUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'component_name'],
          properties: {
            pattern_type: { enum: ['CustomUIElement'] },
            component_name: { type: 'string' },
            props: { type: 'object' }
          }
        }
      ]
    },
    // Chip Group UI Element
    ChipGroupUIElement: {
      allOf: [
        { $ref: '#/definitions/UIElementBase' },
        {
          type: 'object',
          required: ['pattern_type', 'field_id', 'options'],
          properties: {
            pattern_type: { enum: ['ChipGroupUIElement'] },
            field_id: {
              type: 'object',
              required: ['field_name'],
              properties: {
                field_name: { type: 'string' }
              }
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                required: ['key'],
                properties: {
                  key: { type: 'string' },
                  label: {
                    type: 'object',
                    additionalProperties: { type: 'string' }
                  }
                }
              }
            },
            multi_select: { type: 'boolean' },
            default_values: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      ]
    }
  }
};

// Kompiliere das Schema
const validateListingFlow = ajv.compile(listingFlowSchema);

interface SchemaContextType {
  validateFlow: (flow: ListingFlow) => { isValid: boolean; errors: ErrorObject[] | null };
}

const SchemaContext = createContext<SchemaContextType | null>(null);

export function SchemaProvider({ children }: { children: ReactNode }) {
  const validateFlow = (flow: ListingFlow) => {
    const isValid = validateListingFlow(flow);
    return {
      isValid,
      errors: validateListingFlow.errors || null
    };
  };

  return (
    <SchemaContext.Provider value={{ validateFlow }}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema() {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  return context;
}
