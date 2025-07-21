
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const UserSearchFilter = ({ searchTerm, onSearchChange }: UserSearchFilterProps) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Buscar por nome ou e-mail..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default UserSearchFilter;
