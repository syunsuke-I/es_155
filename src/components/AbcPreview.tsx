import { useEffect, useRef } from "react";
import abcjs from "abcjs";

export const AbcPreview = ({ abc }: { abc: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      abcjs.renderAbc(ref.current, abc, {
        responsive: "resize",
      });
    }
  }, [abc]);

  return <div ref={ref} className="w-full" />;
};
