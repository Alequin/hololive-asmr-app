import { useEffect, useState } from "react";

export const useHasSortOrderChanged = (sortOrder) => {
  const [previousSortOrder, setPreviousSortOrder] = useState(sortOrder);

  useEffect(() => {
    setPreviousSortOrder(sortOrder);
  }, [sortOrder.key, sortOrder.direction]);

  return previousSortOrder !== sortOrder;
};
