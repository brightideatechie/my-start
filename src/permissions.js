/** Capability gate: deny by default. A UI permission is not OS authorization. */
const allowed=new Set(["read:local-config","read:public-feed"]);
export function isAllowed(capability){return allowed.has(capability);}
export function assertAllowed(capability){if(!isAllowed(capability))throw new Error("Permission denied: "+capability);}
export function requestPrivilegedAction(){throw new Error("Privileged actions require a separately authenticated local companion and explicit user approval.");}
