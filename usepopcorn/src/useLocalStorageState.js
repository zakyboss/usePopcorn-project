import { useState, useEffect } from "react";
export function useLocalStorageState(initialValue, key){
    const [value, setValue] = useState(function () {
        const storedValue = localStorage.getItem(key);
        return JSON.parse(storedValue) || []; // Ensure it's an array
      });
     useEffect(
        function () {
          localStorage.setItem(key, JSON.stringify(value));
        },
        [value,key]
      );
    
      return [value, setValue]
}