
import React, { useState } from 'react';
import { useBusinessSegments, useBusinessTypes } from '@/hooks/useBusinessSegments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface BusinessSegmentSelectorProps {
  onSegmentChange?: (segmentId: string, segmentName: string) => void;
  onTypeChange?: (typeId: string, typeName: string) => void;
  selectedSegmentId?: string;
  selectedTypeId?: string;
}

export const BusinessSegmentSelector: React.FC<BusinessSegmentSelectorProps> = ({
  onSegmentChange,
  onTypeChange,
  selectedSegmentId,
  selectedTypeId,
}) => {
  const [internalSegmentId, setInternalSegmentId] = useState<string>(selectedSegmentId || '');
  const [internalTypeId, setInternalTypeId] = useState<string>(selectedTypeId || '');

  const { data: segments, isLoading: segmentsLoading, error: segmentsError } = useBusinessSegments();
  const { data: types, isLoading: typesLoading, error: typesError } = useBusinessTypes(internalSegmentId);

  const handleSegmentChange = (segmentId: string) => {
    setInternalSegmentId(segmentId);
    setInternalTypeId(''); // Reset type when segment changes
    
    const selectedSegment = segments?.find(s => s.id === segmentId);
    if (selectedSegment && onSegmentChange) {
      onSegmentChange(segmentId, selectedSegment.segment_name);
    }
  };

  const handleTypeChange = (typeId: string) => {
    setInternalTypeId(typeId);
    
    const selectedType = types?.find(t => t.id === typeId);
    if (selectedType && onTypeChange) {
      onTypeChange(typeId, selectedType.type_name);
    }
  };

  if (segmentsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2">Carregando segmentos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (segmentsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">
            Erro ao carregar segmentos: {segmentsError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione seu Segmento de Atuação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Segmento de Atuação
          </label>
          <Select value={internalSegmentId} onValueChange={handleSegmentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um segmento" />
            </SelectTrigger>
            <SelectContent>
              {segments && segments.map((segment) => (
                <SelectItem key={segment.id} value={segment.id}>
                  {segment.segment_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {internalSegmentId && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tipo de Serviço
            </label>
            {typesLoading ? (
              <div className="flex items-center">
                <LoadingSpinner />
                <span className="ml-2">Carregando tipos...</span>
              </div>
            ) : typesError ? (
              <div className="text-red-500">
                Erro ao carregar tipos: {typesError.message}
              </div>
            ) : (
              <Select value={internalTypeId} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {types && types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {internalSegmentId && internalTypeId && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Selecionado:</strong><br />
              Segmento: {segments?.find(s => s.id === internalSegmentId)?.segment_name}<br />
              Tipo: {types?.find(t => t.id === internalTypeId)?.type_name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
