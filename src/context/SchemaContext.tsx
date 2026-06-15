import React, { createContext, useContext, ReactNode } from 'react';
import Ajv, { ErrorObject } from 'ajv';
import { ListingFlow } from '../models/listingFlow';
import { listingFlowSchema } from './listingFlowSchema';

const ajv = new Ajv({ allErrors: true });

// Kompiliere das (in listingFlowSchema gepflegte) Schema einmalig
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
