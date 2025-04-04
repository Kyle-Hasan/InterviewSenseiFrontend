"use client";
import React, { ReactNode, useRef } from "react";
import Spinner from "./Spinner";
interface VirtualScrollerProps {
  totalItems: number;

  refreshFunction: Function;

  numberRendered: number;

  children: React.ReactNode;

  listLoading: boolean;
}
const VirtualScroller = ({
  refreshFunction,
  totalItems,
  numberRendered,
  children,
  listLoading,
}: VirtualScrollerProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleScroll = async () => {
    // when you reach the bottom of the pages, its time to loads more

    const reachedBottom =
      divRef.current &&
      divRef.current.scrollHeight >
        divRef.current.clientHeight + divRef.current.scrollTop;

    if (reachedBottom && totalItems > numberRendered) {
      await refreshFunction();
    }
  };

  return (
    <div
      className=" h-[95%] overflow-auto  w-auto space-y-4  flex flex-col items-center"
      ref={divRef}
      onScroll={handleScroll}
    >
      {children}
      {listLoading && <Spinner></Spinner>}
    </div>
  );
};

export default VirtualScroller;
