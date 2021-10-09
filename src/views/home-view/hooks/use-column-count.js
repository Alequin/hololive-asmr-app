import { useEffect, useState } from "react";

export const useColumnCount = (zoomModifier = 1) => {
  const baseColumnCount = 4;
  const columnCount = baseColumnCount * zoomModifier;
  const [columnCountToUse, setColumnCountToUse] = useState(columnCount);

  const isUpdatingColumnCount = columnCountToUse !== columnCount;

  useEffect(() => {
    if (isUpdatingColumnCount) setColumnCountToUse(columnCount);
  }, [isUpdatingColumnCount]);

  return { columnCount: columnCountToUse, isUpdatingColumnCount };
};
