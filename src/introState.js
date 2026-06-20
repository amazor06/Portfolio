const SESSION_KEY = "corridorPlayed";
export const corridorHasPlayed = () => sessionStorage.getItem(SESSION_KEY) === "1";
export const markCorridorPlayed = () => sessionStorage.setItem(SESSION_KEY, "1");
