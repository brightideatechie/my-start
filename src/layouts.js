/** My Start layout registry. Layout definitions are data, not executable markup. */
export const LAYOUTS = Object.freeze({
  minimal_launcher: {name:"Minimal Launcher",regions:["hero","main"],description:"Clock, search and essential shortcuts"},
  focus_card: {name:"Focus Card",regions:["hero","main"],description:"Focus prompt and tasks"},
  bookmark_grid: {name:"Classic Bookmark Grid",regions:["main"],description:"Search and tiled shortcuts"},
  three_column_dashboard: {name:"Three-Column Dashboard",regions:["left","center","right"],description:"Links, productivity and information"},
  bento_grid: {name:"Bento Grid",regions:["main"],description:"Mixed-size modular cards"},
  kanban: {name:"Kanban Start Page",regions:["main"],description:"Task workflow columns"},
  news_reader: {name:"News Reader",regions:["main","sidebar"],description:"Feed and headlines"},
  command_palette: {name:"Command Palette",regions:["hero","main"],description:"Keyboard-first launcher"}
});
export function getLayout(id){return LAYOUTS[id] ?? null;}
export function listLayouts(){return Object.entries(LAYOUTS).map(([id,layout])=>({id,...layout}));}
export function validateLayoutConfig(config){
  if(!config || typeof config!=="object" || !getLayout(config.layout)) return false;
  return Array.isArray(config.widgets) && config.widgets.every(w=>w && typeof w.id==="string" && typeof w.type==="string" && typeof w.region==="string" && getLayout(config.layout).regions.includes(w.region));
}
