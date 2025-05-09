import React, { Suspense, useMemo } from 'react';
import styled from 'styled-components';
import { ListingFlow } from '../../models/listingFlow';
import { transformElementForExport } from '../../utils/uuidUtils';

// Lazy loading für react-json-view
const ReactJson = React.lazy(() => import('react-json-view'));

interface JsonPreviewProps {
  data: ListingFlow;
  onEdit?: (edit: { updated_src: any }) => void;
}

const PreviewContainer = styled.div`
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  max-height: 100%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const LoadingContainer = styled.div`
  padding: 1rem;
  text-align: center;
  color: #666;
`;

const JsonPreview: React.FC<JsonPreviewProps> = ({ data, onEdit }) => {
  // Transformiere die Daten für den Export
  const transformedData = useMemo(() => {
    // Deep copy der Daten
    const dataCopy = JSON.parse(JSON.stringify(data));

    // Transformiere alle Elemente in allen Seiten
    if (dataCopy.pages_edit) {
      dataCopy.pages_edit = dataCopy.pages_edit.map((page: any) => {
        if (page.elements) {
          page.elements = page.elements.map((element: any) => {
            return { element: transformElementForExport(element.element) };
          });
        }

        // Auch SubFlows transformieren, falls vorhanden
        if (page.sub_flows) {
          page.sub_flows = page.sub_flows.map((subFlow: any) => {
            if (subFlow.elements) {
              subFlow.elements = subFlow.elements.map((element: any) => {
                return { element: transformElementForExport(element.element) };
              });
            }
            return subFlow;
          });
        }

        return page;
      });
    }

    if (dataCopy.pages_view) {
      dataCopy.pages_view = dataCopy.pages_view.map((page: any) => {
        if (page.elements) {
          page.elements = page.elements.map((element: any) => {
            return { element: transformElementForExport(element.element) };
          });
        }
        return page;
      });
    }

    return dataCopy;
  }, [data]);

  return (
    <PreviewContainer>
      <Suspense fallback={<LoadingContainer>Lade JSON-Vorschau...</LoadingContainer>}>
        <ReactJson
          src={transformedData}
          theme="monokai"
          style={{
            backgroundColor: 'transparent',
            fontFamily: "'Source Code Pro', monospace"
          }}
          displayDataTypes={false}
          enableClipboard={true}
          onEdit={onEdit}
          onAdd={onEdit}
          onDelete={onEdit}
          collapsed={2}
        />
      </Suspense>
    </PreviewContainer>
  );
};

export default JsonPreview;
