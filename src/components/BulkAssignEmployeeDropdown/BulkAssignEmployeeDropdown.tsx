// src/components/BulkAssignEmployeeDropdown/BulkAssignEmployeeDropdown.tsx
import React, { useMemo, useState } from "react";
import FilterDropdown from "../FilterDropdown/FilterDropdown";

type Props = {
  label: string;
  employees: any[];
  selectedCount: number;
  onAssign: (payload: { employeeId: string }) => void;

  // optional text customization
  placeholder?: string;
};

const BulkAssignEmployeeDropdown = ({
  label,
  employees,
  selectedCount,
  onAssign,
  placeholder = "Zgjidh punetorin",
}: Props) => {
  const [selectedValue, setSelectedValue] = useState<string>(placeholder);

  const labelToEmployeeId = useMemo(() => {
    const map = new Map<string, string>();

    (employees || []).forEach((e: any) => {
      const fullName =
        e?.specialFields?.fullName || e?.fullName || e?.email || "Employee";
      // Ensure unique-ish labels if duplicates exist
      const key = `${fullName}${
        e?.id ? ` (#${String(e.id).slice(0, 6)})` : ""
      }`;
      map.set(key, e.id);
    });

    return map;
  }, [employees]);

  const options: string[] = useMemo(() => {
    const employeeLabels = (employees || []).map((e: any) => {
      const fullName =
        e?.specialFields?.fullName || e?.fullName || e?.email || "Employee";
      return `${fullName}${e?.id ? ` (#${String(e.id).slice(0, 6)})` : ""}`;
    });

    return [placeholder, ...employeeLabels];
  }, [employees, placeholder]);

  const handleChange = (value: any) => {
    const v = String(value);
    setSelectedValue(v);

    // ignore placeholder selection
    if (v === placeholder) return;

    // must have at least 1 selected order
    if (selectedCount < 1) {
      setSelectedValue(placeholder);
      return;
    }

    const employeeId = labelToEmployeeId.get(v);
    if (!employeeId) {
      setSelectedValue(placeholder);
      return;
    }

    onAssign({ employeeId });

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

export default BulkAssignEmployeeDropdown;
