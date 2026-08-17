import { PropsWithChildren } from "react";

export function AttrTag({ children }: PropsWithChildren) {
  return (
    <div className="w-14 h-6 flex justify-center items-center text-gray-400 bg-gray-700">
      {children}
    </div>
  );
}
