import { SlidersHorizontal } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

export type IndexSortOption = {
  value: string;
  label: string;
};

type IndexFilterFieldsProps = {
  id: string;
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  sortOptions: IndexSortOption[];
};

function IndexFilterFields({
  id,
  search,
  onSearchChange,
  sort,
  onSortChange,
  sortOptions,
}: IndexFilterFieldsProps) {
  return (
    <>
      <div className="v2-index-field">
        <Label htmlFor={`${id}-search`}>Search</Label>
        <Input
          id={`${id}-search`}
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title or detail"
        />
      </div>
      <div className="v2-index-field">
        <Label htmlFor={`${id}-sort`}>Sort by</Label>
        <Select value={sort} onValueChange={(value) => value && onSortChange(value)}>
          <SelectTrigger id={`${id}-sort`}>
            <SelectValue>
              {sortOptions.find((option) => option.value === sort)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sortOptions.map((option) => (
                <SelectItem value={option.value} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

export function ContentIndexControls({
  id,
  search,
  onSearchChange,
  sort,
  onSortChange,
  sortOptions,
  resultCount,
  resultLabel,
}: {
  id: string;
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  sortOptions: IndexSortOption[];
  resultCount: number;
  resultLabel: string;
}) {
  return (
    <div className="v2-index-controls" role="search">
      <div className="v2-index-results">
        <span>{String(resultCount).padStart(2, '0')}</span>
        <span>{resultLabel}</span>
      </div>
      <div className="v2-index-filter-panel">
        <IndexFilterFields
          id={`${id}-desktop`}
          search={search}
          onSearchChange={onSearchChange}
          sort={sort}
          onSortChange={onSortChange}
          sortOptions={sortOptions}
        />
      </div>
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="secondary" size="sm" className="v2-index-filter-toggle">
              Filters <SlidersHorizontal data-icon="inline-end" />
            </Button>
          }
        />
        <SheetContent side="bottom" className="v2-index-filter-sheet">
          <SheetHeader>
            <SheetTitle>Filter {resultLabel}</SheetTitle>
            <SheetDescription>Search the complete index or change its order.</SheetDescription>
          </SheetHeader>
          <div className="v2-index-filter-sheet-fields">
            <IndexFilterFields
              id={`${id}-mobile`}
              search={search}
              onSearchChange={onSearchChange}
              sort={sort}
              onSortChange={onSortChange}
              sortOptions={sortOptions}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
