import { useEffect } from "react";
export function useKey(code, callBack) {
  useEffect(
    function () {
      function handleKeyPress(e) {
        if (e.code.toLowerCase() === code.toLowerCase()) {
          callBack();
          console.log("Closing");
        }
      }
      document.addEventListener("keydown", handleKeyPress);
      return function () {
        document.removeEventListener("keydown", handleKeyPress);
      };
    },
    [callBack, code]
  );
}
