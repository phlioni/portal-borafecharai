
import React from 'react';
import { BusinessSegmentSelector } from '@/components/BusinessSegmentSelector';

const TestBusinessSegments = () => {
  const handleSegmentChange = (segmentId: string, segmentName: string) => {
    console.log('Segmento selecionado:', { segmentId, segmentName });
  };

  const handleTypeChange = (typeId: string, typeName: string) => {
    console.log('Tipo selecionado:', { typeId, typeName });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teste dos Segmentos de Negócio</h1>
      <BusinessSegmentSelector
        onSegmentChange={handleSegmentChange}
        onTypeChange={handleTypeChange}
      />
    </div>
  );
};

export default TestBusinessSegments;
