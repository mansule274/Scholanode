import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 8;
const EDGE = 12;

/**
 * Anchored popover that renders outside the table markup so scroll containers
 * cannot clip it. Position is recomputed while the page or a scrollable
 * ancestor moves, and it flips above the anchor when there is no room below.
 */
export default function PopoverMenu({ anchorRef, onClose, width = 216, children }) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [anchorVisible, setAnchorVisible] = useState(true);

  useLayoutEffect(() => {
    const place = () => {
      const anchor = anchorRef.current;

      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();

      // Pages render every row twice, as a table row and as a mobile card, and
      // only one copy is on screen. The hidden copy has an empty rectangle, so
      // it must not publish a panel of its own.
      if (rect.width === 0 && rect.height === 0) {
        setAnchorVisible(false);
        return;
      }

      setAnchorVisible(true);

      const panel = panelRef.current;

      if (!panel) return;

      const height = panel.offsetHeight;
      const spaceBelow = window.innerHeight - rect.bottom - EDGE;
      const spaceAbove = rect.top - EDGE;
      const flipUp = height + GAP > spaceBelow && spaceAbove > spaceBelow;
      const rawTop = flipUp ? rect.top - GAP - height : rect.bottom + GAP;
      const rawLeft = rect.right - panel.offsetWidth;

      setPosition({
        top: Math.max(EDGE, Math.min(rawTop, window.innerHeight - height - EDGE)),
        left: Math.max(EDGE, Math.min(rawLeft, window.innerWidth - panel.offsetWidth - EDGE)),
      });
    };

    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);

    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [anchorRef, width, anchorVisible]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        anchorRef.current?.contains(event.target)
      ) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, onClose]);

  if (!anchorVisible) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="menu"
      onClick={(event) => {
        // Selecting any item dismisses the menu, including when the action
        // itself leaves the row state untouched.
        if (event.target.closest("button")) onClose();
      }}
      style={{
        position: "fixed",
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        width,
        visibility: position ? "visible" : "hidden",
      }}
      className="z-[70] max-h-[min(26rem,calc(100vh-1.5rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-xl shadow-slate-900/10"
    >
      {children}
    </div>,
    document.body
  );
}
