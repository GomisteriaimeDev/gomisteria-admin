import React, { useMemo, useState } from "react";
import FilterDropdown from "../FilterDropdown/FilterDropdown";

export type TableAction = {
  id: string;
  label: string;
  minSelected?: number; // default 0
  maxSelected?: number; // optional
  disabled?: boolean;
};

type Props = {
  label: string;
  actions: TableAction[];
  selectedCount: number;
  onAction: (actionId: string) => void;

  // optional text customization
  placeholder?: string;
};

const ActionsDropdown = ({
  label,
  actions,
  selectedCount,
  onAction,
  placeholder = "Zgjidh veprim...",
}: Props) => {
  const [selectedValue, setSelectedValue] = useState<string>(placeholder);

  const labelToAction = useMemo(() => {
    const map = new Map<string, TableAction>();
    (actions || []).forEach((a) => map.set(a.label, a));
    return map;
  }, [actions]);

  const options: string[] = useMemo(() => {
    // FilterDropdown expects string[] (same as Sales status filter)
    return [placeholder, ...(actions || []).map((a) => a.label)];
  }, [actions, placeholder]);

  const isAllowed = (a: TableAction) => {
    if (a.disabled) return false;

    const min = a.minSelected ?? 0;
    if (selectedCount < min) return false;

    if (a.maxSelected != null && selectedCount > a.maxSelected) return false;

    return true;
  };

  const handleChange = (value: any) => {
    const v = String(value);

    setSelectedValue(v);

    // ignore placeholder selection
    if (v === placeholder) return;

    const action = labelToAction.get(v);
    if (!action) {
      setSelectedValue(placeholder);
      return;
    }

    if (!isAllowed(action)) {
      // do nothing if not allowed; reset to placeholder
      setSelectedValue(placeholder);
      return;
    }

    onAction(action.id);

    // reset after executing
    setSelectedValue(placeholder);
  };

  return (
    <FilterDropdown
      label={label}
      options={options}
      selectedValue={selectedValue}
      onChange={handleChange}
    />
  );
};

export default ActionsDropdown;
