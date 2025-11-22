import React, { Suspense, useMemo } from 'react';
import styled from 'styled-components';
import { ListingFlow } from '../../models/listingFlow';
import { transformFlowForExport } from '../../utils/uuidUtils';

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
    return transformFlowForExport(data);
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
