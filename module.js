const MODULENAME = "pixelize-background";

function setStyle(wrapped, texture, glTexture) {
  // console.log("setStyle", texture, texture?.textureCacheIds);
  if (texture.scaleMode === PIXI.SCALE_MODES.NEAREST || (game.toPixelate?.intersection(new Set(texture?.textureCacheIds ?? []))?.size ?? 0) == 0) {
    console.log("Not pixelating:", texture?.textureCacheIds);
    return wrapped(texture, glTexture);
  };
  console.log("Pixelating:", texture?.textureCacheIds);
  return wrapped({
    ...texture,
    scaleMode: PIXI.SCALE_MODES.NEAREST,
  }, glTexture);
}

/**
 * Add the puzzle settings to the scene configuration!
 * @param {*} sceneConfig 
 * @param {*} html 
 * @param {*} context 
 * @returns 
 */
async function OnRenderSceneConfig(sceneConfig) {
  console.log("OnRenderSceneConfig", sceneConfig);
  const scene = sceneConfig?.document;
  const htmlEl = sceneConfig?.element;
  if (!scene || !htmlEl) return;

  if ($(htmlEl).find(`[name="flags.${MODULENAME}.enabled"]`).length > 0) return;

  $(htmlEl).find(`[name="background.src"]`).parent().parent().after(`<div class="form-group"><label>Pixelate?</label><input type="checkbox" name="flags.${MODULENAME}.enabled" ${(scene.flags[MODULENAME]?.enabled ?? true) ? "checked" : ""}></div>`);
}


// async function Video_cloneTexture(wrapped, ...args) {
//   const vt = await wrapped(...args);
//   if (vt?.baseTexture?._scaleMode == undefined || !game.settings.get(MODULENAME, "avoidBlur")) {
//     return vt;
//   }
//   vt.baseTexture._scaleMode = PIXI.SCALE_MODES.NEAREST;
//   return vt;
// }


export function register() {
  libWrapper.register(MODULENAME, "PIXI.TextureSystem.prototype.setStyle", setStyle, "WRAPPER");
  // libWrapper.register(MODULENAME, "game.video.cloneTexture", Video_cloneTexture, "WRAPPER");
  Hooks.on("renderSceneConfig", OnRenderSceneConfig);
  Object.defineProperty(game, "toPixelate", {
    get: () => new Set(game.scenes.filter(scene => scene.flags[MODULENAME]?.enabled ?? true).map(scene => scene.background.src)),
  });
};

Hooks.on("init", ()=>{
  register();
});
