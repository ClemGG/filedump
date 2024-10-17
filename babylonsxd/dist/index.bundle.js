"use strict";
(self["webpackChunkwwwroot"] = self["webpackChunkwwwroot"] || []).push([["index"],{

/***/ 82333:
/*!*************************************!*\
  !*** ./src/assets/PausableScene.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PausableScene = void 0;
const scene_1 = __webpack_require__(/*! @babylonjs/core/scene */ 78480);
class PausableScene extends scene_1.Scene {
    //#endregion
    //#region Constructor
    /**
     * constructeur
     * @param pausedOnStart TRUE si la scène est en pause
     * @param engine Le moteur babylon
     * @param options Les options de la scène
     */
    constructor(pausedOnStart, engine, options) {
        super(engine, options);
        //#region Variables d'instance
        /**
         * TRUE si la scène est en pause
         */
        this.IsPaused = false;
        this.IsPaused = pausedOnStart;
    }
}
exports.PausableScene = PausableScene;


/***/ }),

/***/ 63458:
/*!******************************************!*\
  !*** ./src/assets/animatedGifTexture.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnimatedGifTexture = void 0;
const baseTexture_1 = __webpack_require__(/*! @babylonjs/core/Materials/Textures/baseTexture */ 56526);
const constants_1 = __webpack_require__(/*! @babylonjs/core/Engines/constants */ 96125);
const precisionDate_1 = __webpack_require__(/*! @babylonjs/core/Misc/precisionDate */ 76237);
const effectRenderer_1 = __webpack_require__(/*! @babylonjs/core/Materials/effectRenderer */ 84255);
// Ensures Raw texture are included
__webpack_require__(/*! @babylonjs/core/Engines/Extensions/engine.rawTexture */ 52426);
// Import our Shader Config
const animatedGifTextureShader_1 = __webpack_require__(/*! ./animatedGifTextureShader */ 66719);
// Gifs external library to parse Gif datas
const Gifuct_js_1 = __webpack_require__(/*! Gifuct-js */ 27945);
/**
 * This represents an animated Gif textures.
 * Yes... It is truly animating ;-)
 */
class AnimatedGifTexture extends baseTexture_1.BaseTexture {
    /**
     * Instantiates an AnimatedGifTexture from the following parameters.
     *
     * @param url The location of the Gif
     * @param engine engine the texture will be used in
     * @param onLoad defines a callback to trigger once all ready.
     */
    constructor(url, engine, onLoad = null) {
        super(engine);
        this._frames = null;
        this._nextFrameIndex = 0;
        this.name = url;
        this._onLoad = onLoad;
        this._createInternalTexture();
        this._createRenderer();
        this._createRenderLoopCallback();
        this._loadGifTexture();
    }
    /**
     * Creates the internal texture used by the engine.
     */
    _createInternalTexture() {
        this._texture = this._engine.createRawTexture(null, 1, 1, constants_1.Constants.TEXTUREFORMAT_RGBA, false, false, constants_1.Constants.TEXTURE_BILINEAR_SAMPLINGMODE, null, constants_1.Constants.TEXTURETYPE_UNSIGNED_INT);
        // Do not be ready before the data has been loaded
        this._texture.isReady = false;
        // Setups compatibility with gl1
        this.wrapU = constants_1.Constants.TEXTURE_CLAMP_ADDRESSMODE;
        this.wrapV = constants_1.Constants.TEXTURE_CLAMP_ADDRESSMODE;
        this.wrapR = constants_1.Constants.TEXTURE_CLAMP_ADDRESSMODE;
        this.anisotropicFilteringLevel = 1;
    }
    /**
     * Create the renderer resources used to draw the Gif patches in the texture.
     */
    _createRenderer() {
        // Creates a wrapper around our custom shader
        this._patchEffectWrapper = new effectRenderer_1.EffectWrapper(Object.assign(Object.assign({}, animatedGifTextureShader_1.AnimatedGifShaderConfiguration), { engine: this._engine }));
        // Creates a dedicated fullscreen renderer for the frame blit
        this._patchEffectRenderer = new effectRenderer_1.EffectRenderer(this._engine, {
            positions: [1, 1, 0, 1, 0, 0, 1, 0]
        });
    }
    /**
     * Creates the current render loop callback.
     */
    _createRenderLoopCallback() {
        this._renderLoopCallback = () => {
            this._renderFrame();
        };
    }
    /**
     * Starts loading the Gif data.
     */
    _loadGifTexture() {
        // Defines what happens after we read the data from the url
        const callback = (buffer) => {
            this._parseGifData(buffer);
            this._createGifResources();
            // Start Rendering the sequence of frames
            this._engine.runRenderLoop(this._renderLoopCallback);
        };
        // Load the array buffer from the Gif file
        this._engine._loadFile(this.name, callback, undefined, undefined, true);
    }
    /**
     * Parses the Gif data and creates the associated frames.
     * @param buffer Defines the buffer containing the data
     */
    _parseGifData(buffer) {
        const gifData = (0, Gifuct_js_1.parseGIF)(buffer);
        this._frames = (0, Gifuct_js_1.decompressFrames)(gifData, true);
    }
    /**
     * Creates the GPU resources associated with the Gif file.
     * It will create the texture for each frame as well as our render target used
     * to hold the final Gif.
     */
    _createGifResources() {
        for (let frame of this._frames) {
            // Creates a dedicated texture for each frames
            // This only contains patched data for a portion of the image
            frame.texture = this._engine.createRawTexture(new Uint8Array(frame.patch.buffer), frame.dims.width, frame.dims.height, constants_1.Constants.TEXTUREFORMAT_RGBA, false, true, constants_1.Constants.TEXTURE_NEAREST_SAMPLINGMODE, null, constants_1.Constants.TEXTURETYPE_UNSIGNED_INT);
            // As it only contains part of the image, we need to translate and scale
            // the rendering of the pacth to fit with the location data from the file
            const sx = frame.dims.width / this._frames[0].dims.width;
            const sy = frame.dims.height / this._frames[0].dims.height;
            const tx = frame.dims.left / this._frames[0].dims.width;
            // As we render from the bottom, the translation needs to be computed accordingly
            const ty = (this._frames[0].dims.height - (frame.dims.top + frame.dims.height)) / this._frames[0].dims.height;
            frame.worldMatrix = new Float32Array([
                sx, 0, tx,
                0, sy, ty,
                0, 0, 1,
            ]);
            // Ensures webgl 1 compat
            this._engine.updateTextureWrappingMode(frame.texture, constants_1.Constants.TEXTURE_CLAMP_ADDRESSMODE, constants_1.Constants.TEXTURE_CLAMP_ADDRESSMODE);
        }
        // Creates our main render target based on the Gif dimensions
        this._renderTarget = this._engine.createRenderTargetTexture(this._frames[0].dims, {
            format: constants_1.Constants.TEXTUREFORMAT_RGBA,
            generateDepthBuffer: false,
            generateMipMaps: false,
            generateStencilBuffer: false,
            samplingMode: constants_1.Constants.TEXTURE_BILINEAR_SAMPLINGMODE,
            type: constants_1.Constants.TEXTURETYPE_UNSIGNED_BYTE
        });
        // Release the extra resources from the current internal texture
        this._engine._releaseTexture(this._texture);
        // Swap our internal texture by our new render target one
        this._renderTarget.texture._swapAndDie(this._texture);
        // And adapt its data
        this._engine.updateTextureWrappingMode(this._texture, constants_1.Constants.TEXTURE_CLAMP_ADDRESSMODE, constants_1.Constants.TEXTURE_CLAMP_ADDRESSMODE);
        this._texture.width = this._frames[0].dims.width;
        this._texture.height = this._frames[0].dims.height;
        this._texture.isReady = false;
    }
    /**
     * Render the current frame when all is ready.
     */
    _renderFrame() {
        // Keep the current frame as long as specified in the Gif data
        if (this._currentFrame && (precisionDate_1.PrecisionDate.Now - this._previousDate) < this._currentFrame.delay) {
            return;
        }
        // Replace the current frame
        this._currentFrame = this._frames[this._nextFrameIndex];
        // Patch the texture
        this._drawPatch();
        // Recall the current draw time for this frame.
        this._previousDate = precisionDate_1.PrecisionDate.Now;
        // Update the next frame index
        this._nextFrameIndex++;
        if (this._nextFrameIndex >= this._frames.length) {
            this._nextFrameIndex = 0;
        }
    }
    /**
     * Draw the patch texture on top of the previous one.
     */
    _drawPatch() {
        // The texture is only ready when we are able to render
        if (!this._patchEffectWrapper.effect.isReady()) {
            return;
        }
        // Get the current frame
        const frame = this._currentFrame;
        // Record the old viewport
        const oldViewPort = this._engine.currentViewport;
        // Clear the previous frame if requested in the Gif data
        if (this._previousFrame && (this._previousFrame.disposalType === 2 || this._nextFrameIndex === 0)) {
            // We need to apply our special inputs to the effect when it renders
            this._patchEffectWrapper.onApplyObservable.addOnce(() => {
                this._patchEffectWrapper.effect.setFloat4("color", 0, 0, 0, 0);
                this._patchEffectWrapper.effect.setMatrix3x3("world", this._previousFrame.worldMatrix);
                this._patchEffectWrapper.effect._bindTexture("textureSampler", this._previousFrame.texture);
            });
            this._patchEffectRenderer.render(this._patchEffectWrapper, this._renderTarget);
        }
        // We need to apply our special inputs to the effect when it renders
        this._patchEffectWrapper.onApplyObservable.addOnce(() => {
            this._patchEffectWrapper.effect.setFloat4("color", 1, 1, 1, 1);
            this._patchEffectWrapper.effect.setMatrix3x3("world", frame.worldMatrix);
            this._patchEffectWrapper.effect._bindTexture("textureSampler", frame.texture);
        });
        // Render the current Gif frame on top of the previous one
        this._patchEffectRenderer.render(this._patchEffectWrapper, this._renderTarget);
        // Save the disposal type for the next update
        this._previousFrame = frame;
        // Reset the old viewport
        this._engine.setViewport(oldViewPort);
        // We are now all ready to roll
        if (!this._texture.isReady) {
            this._texture.isReady = true;
            this._onLoad && this._onLoad();
        }
    }
    /**
     * Dispose the texture and release its associated resources.
     */
    dispose() {
        // Stops the current Gif update loop
        this._engine.stopRenderLoop(this._renderLoopCallback);
        // Clear the render helpers
        this._patchEffectWrapper.dispose();
        this._patchEffectRenderer.dispose();
        // Clear the textures from the Gif
        for (let frame of this._frames) {
            frame.texture.dispose();
        }
        this._renderTarget.dispose();
        // Disposes the render target associated resources
        super.dispose();
    }
}
exports.AnimatedGifTexture = AnimatedGifTexture;


/***/ }),

/***/ 66719:
/*!************************************************!*\
  !*** ./src/assets/animatedGifTextureShader.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {


// This shader is used to blit every new Gif Frames on top of the previous one
// As the patch is not of the same size and position than our original Gif,
// We need a simple way to offset the data localtion.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnimatedGifShaderConfiguration = void 0;
const vertexShader = `
// Attributes
attribute vec2 position;

// Transform matrix to offset the patch
uniform mat3 world;

// Output
varying vec2 vUV;

void main(void) {
    // We chose position from 0 to 1 to simplify to matrix computation
    // So the UVs will be a straight match
    vUV = position;

    // Transform to the requested patch location
    vec3 wPosition = vec3(position, 1) * world;

    // Go back from 0 to 1 to -1 to 1 for clip space coordinates
    wPosition = wPosition * 2.0 - 1.0;

    // Assign the location (depth is disabled in the pipeline)
    gl_Position = vec4(wPosition.xy, 0.0, 1.0);
}`;
const fragmentShader = `
// Inputs from vertex
varying vec2 vUV;

// Color Lookup
uniform sampler2D textureSampler;

// Color mix
uniform vec4 color;

void main(void) 
{
    // We simply display the color from the texture
    vec2 uv = vec2(vUV.x, 1.0 - vUV.y);
    vec4 finalColor = texture2D(textureSampler, vUV) * color;

    // With a pinch of alpha testing as defined in the data
    // Else everything could have been handled in a texSubImage2d.
    if (color.a == 1. && finalColor.a == 0.) {
        discard;
    }

    gl_FragColor = finalColor;
}`;
/**
 * Defines all the data required for our effect
 */
exports.AnimatedGifShaderConfiguration = {
    name: "Patch",
    vertexShader,
    fragmentShader,
    samplerNames: ["textureSampler"],
    uniformNames: ["world", "color"],
};


/***/ }),

/***/ 28156:
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


//#region Imports
Object.defineProperty(exports, "__esModule", ({ value: true }));
// import "@babylonjs/core/Debug/debugLayer"; // Augments the scene with the debug methods
// import "@babylonjs/inspector"; // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version
__webpack_require__(/*! @babylonjs/loaders/glTF/2.0 */ 58620);
const sceneLoader_1 = __webpack_require__(/*! @babylonjs/core/Loading/sceneLoader */ 46632);
const glTFFileLoader_1 = __webpack_require__(/*! @babylonjs/loaders/glTF/glTFFileLoader */ 22887);
const PerfUtils_1 = __webpack_require__(/*! ./viewModels/utils/PerfUtils */ 42452);
const MainScene_1 = __webpack_require__(/*! ./viewModels/main/MainScene */ 81525);
const Fonts_1 = __webpack_require__(/*! ./models/Fonts */ 36989);
const i18n_1 = __webpack_require__(/*! ./viewModels/localization/i18n */ 94140);
//#endregion
// Initialise la traduction avec la langue du navigateur
(0, i18n_1.SetBrowserLanguage)(window.navigator.language);
// Récupère les éléments HTML
const canvas = document.getElementById("renderCanvas");
const divFps = document.getElementById("fps");
divFps.style.display = 'none';
//Initialise la scène
const engine = (0, PerfUtils_1.CreateEngine)(canvas, true, { powerPreference: 'high-performance' });
(0, PerfUtils_1.OptimiseEngine)(engine);
const scene = (0, MainScene_1.CreateShowroomsScene)(engine);
//scene.debugLayer.show();
sceneLoader_1.SceneLoader.RegisterPlugin(new glTFFileLoader_1.GLTFFileLoader());
// Affiche la scène une fois les polices chargées
(0, Fonts_1.LoadAllFontsAsync)().then(() => {
    // Render every frame
    engine.runRenderLoop(() => {
        if (!scene.IsPaused) {
            scene.render();
        }
        divFps.innerHTML = engine.getFps().toFixed() + " fps";
    });
});
// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
// Commandes
canvas.onkeydown = (e) => {
    switch (e.key) {
        case "Tab":
            divFps.style.display = divFps.style.display == 'none' ? 'block' : 'none';
            break;
        case "Enter":
            window.open("editor.html", "_other");
            break;
    }
};


/***/ }),

/***/ 36989:
/*!*****************************!*\
  !*** ./src/models/Fonts.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoadAllFontsAsync = void 0;
/**
 * La liste de toutes le spolices utilisées dans ce projet
 */
const fontsInProject = {
    'Roboto': { weight: 400, style: "normal" },
    'Roboto-Bold': { weight: 900, style: "normal" },
    'Roboto-Italic': { weight: 400, style: "italic" },
    'Roboto-BoldItalic': { weight: 900, style: "italic" },
};
/**
 * Charge toutes les polices du projet
 * @returns Une promesse asynchrone
 */
function LoadAllFontsAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        const { default: ffo } = yield Promise.resolve().then(() => __importStar(__webpack_require__(/*! fontfaceobserver */ 78904)));
        const observers = [];
        // Make one observer for each font,
        // by iterating over the data we already have
        Object.keys(fontsInProject).forEach(function (family) {
            const data = fontsInProject[family];
            const obs = new ffo(family, data);
            observers.push(obs.load(undefined, 3000));
        });
        return Promise.all(observers);
    });
}
exports.LoadAllFontsAsync = LoadAllFontsAsync;


/***/ }),

/***/ 38056:
/*!*******************************************!*\
  !*** ./src/models/refTypes/Dictionary.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Dictionary = void 0;
class Dictionary {
    constructor(init) {
        this._keys = [];
        this._values = [];
        this.add(init);
    }
    add(added) {
        if (this.isArray(added)) {
            for (var i = 0; i < added.length; i++) {
                this[added[i].key] = added[i].value;
                this._keys.push(added[i].key);
                this._values.push(added[i].value);
            }
        }
        else {
            this[added.key] = added.value;
            this._keys.push(added.key);
            this._values.push(added.value);
        }
    }
    remove(key) {
        if (this.isArray(key)) {
            for (let i = 0; i < key.length; i++) {
                var index = this._keys.indexOf(key[i], 0);
                this._keys.splice(index, 1);
                this._values.splice(index, 1);
                delete this[key[i]];
            }
        }
        else {
            var index = this._keys.indexOf(key, 0);
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
            delete this[key];
        }
    }
    clear() {
        this._keys.splice(0, this._keys.length);
        this._values.splice(0, this._values.length);
    }
    keys() {
        return this._keys;
    }
    values() {
        return this._values;
    }
    containsKey(key) {
        if (this.isArray(key)) {
            for (let i = 0; i < key.length; i++) {
                if (typeof this[key[i]] === "undefined") {
                    return false;
                }
            }
        }
        else {
            if (typeof this[key] === "undefined") {
                return false;
            }
        }
        return true;
    }
    toLookup() {
        return this;
    }
    isArray(args) {
        return Array.isArray(args);
    }
}
exports.Dictionary = Dictionary;


/***/ }),

/***/ 31202:
/*!***********************************************!*\
  !*** ./src/models/sceneData/GIDescription.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GIDescription = void 0;
/**
 * Contient la description d'une interaction pour une scène
 */
class GIDescription {
    //#endregion
    //#region Constructeur
    /**
     * Constructeur par défaut
     * @param title Le nom du point d'interfaction
     * @param imagesSourcesAndSizes L'url et la taille de l'image s'il y en a une
     * @param texts Description du point d'interaction, fragmenté en plusieurs textes pour faciliter leur stylisation
     */
    constructor(title, imagesSourcesAndSizes, texts) {
        this.Title = title;
        this.ImagesSourcesAndSizes = imagesSourcesAndSizes;
        this.Texts = texts;
    }
}
exports.GIDescription = GIDescription;


/***/ }),

/***/ 20484:
/*!************************************************!*\
  !*** ./src/models/sceneData/POIDescription.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.POIDescription = void 0;
/**
 * Contient la description d'une interaction pour une scène
 */
class POIDescription {
    //#endregion
    //#region Constructeur
    /**
     * Constructeur par défaut
     * @param title Le nom du point d'interfaction
     * @param header En-tête
     * @param subTitle1 Sous-titre
     * @param subTitle2 Sous-titre
     * @param footnote La note en fin de description
     * @param imageSourceAndSize L'url et la taille de l'image s'il y en a une
     * @param images2 L'url et la taille de l'image s'il y en a une
     * @param VideoInfo Les urls de la video
     * @param texts1 Description du point d'interaction, fragmenté en plusieurs textes pour faciliter leur stylisation
     * @param texts2 Description du point d'interaction, fragmenté en plusieurs textes pour faciliter leur stylisation
     */
    constructor(title, header, subTitle1, subTitle2, footnote, imageSourceAndSize, images2, videoInfo, texts1, texts2) {
        this.Title = title;
        this.Header = header,
            this.Subtitle1 = subTitle1;
        this.Subtitle2 = subTitle2;
        this.Footnote = footnote;
        this.ImageSourceAndSize = imageSourceAndSize;
        this.Images2 = images2;
        this.VideoInfo = videoInfo;
        this.Texts1 = texts1;
        this.Texts2 = texts2;
    }
}
exports.POIDescription = POIDescription;


/***/ }),

/***/ 68877:
/*!*********************************************!*\
  !*** ./src/models/sceneData/SceneAssets.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SceneAssets = void 0;
const renderTargetTexture_1 = __webpack_require__(/*! @babylonjs/core/Materials/Textures/renderTargetTexture */ 75474);
/**
 * Contient toutes les assets d'une scène qui ne fait pas partie du fichier .babylon associé
 * (skybox, etc...)
 */
class SceneAssets {
    //#endregion
    //#region Constructeur
    /**
     * Constructeur
     * @param skybox Le mesh de la skybox de la scène
     * @param csg Le générateur d'ombres de la scène
     * @param staticRootMeshes Le mesh racine de la scène
     * @param teleporters Les téléporteurs de la scène
     * @param poiBtns Les boutons flottants des POIs de la scène
     * @param giBtns Les boutons flottants des GIs de la scène
     * @param homeBtn Le bouton flottant d'accueil
     */
    constructor(skybox, staticCSG, dynamicCSG, staticRootMeshes, dynamicRootMeshes, excludedFromDynamicShadows, teleporters, poiBtns, giBtns, homeBtn) {
        this._skybox = skybox;
        this._staticCSG = staticCSG;
        this._dynamicCSG = dynamicCSG;
        this._staticRootMeshes = staticRootMeshes;
        this._dynamicRootMeshes = dynamicRootMeshes;
        this._excludedFromDynamicShadows = excludedFromDynamicShadows;
        this._teleporters = teleporters;
        this._poiBtns = poiBtns;
        this._giBtns = giBtns;
        this._homeBtn = homeBtn;
    }
    //#endregion
    //#region Méthodes publiques
    /**
     * Active les assets de la scène
     */
    Enable() {
        this._skybox.isVisible = true;
        for (let i = 0; i < this._staticRootMeshes.length; ++i) {
            this._staticCSG.addShadowCaster(this._staticRootMeshes[i]);
        }
        for (let i = 0; i < this._dynamicRootMeshes.length; ++i) {
            this._dynamicCSG.addShadowCaster(this._dynamicRootMeshes[i]);
        }
        for (let i = 0; i < this._excludedFromDynamicShadows.length; ++i) {
            this._dynamicCSG.removeShadowCaster(this._excludedFromDynamicShadows[i]);
        }
        this._staticCSG.getShadowMap().refreshRate = renderTargetTexture_1.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        for (let i = 0; i < this._teleporters.length; ++i) {
            this._teleporters[i].Enable();
        }
        for (let i = 0; i < this._poiBtns.length; ++i) {
            this._poiBtns[i].isVisible = true;
        }
        for (let i = 0; i < this._giBtns.length; ++i) {
            this._giBtns[i].isVisible = true;
        }
        this._homeBtn.isVisible = true;
    }
    /**
     * Désactive les assets de la scène
     */
    Disable() {
        this._skybox.isVisible = false;
        for (let i = 0; i < this._staticRootMeshes.length; ++i) {
            this._staticCSG.removeShadowCaster(this._staticRootMeshes[i]);
        }
        for (let i = 0; i < this._dynamicRootMeshes.length; ++i) {
            this._dynamicCSG.removeShadowCaster(this._dynamicRootMeshes[i]);
        }
        for (let i = 0; i < this._teleporters.length; ++i) {
            this._teleporters[i].Disable();
        }
        for (let i = 0; i < this._poiBtns.length; ++i) {
            this._poiBtns[i].isVisible = false;
        }
        for (let i = 0; i < this._giBtns.length; ++i) {
            this._giBtns[i].isVisible = false;
        }
        this._homeBtn.isVisible = false;
    }
}
exports.SceneAssets = SceneAssets;


/***/ }),

/***/ 86443:
/*!*******************************************!*\
  !*** ./src/models/sceneData/Showrooms.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GIPositions = exports.POIPositions = exports.AssetContainers = exports.ScenesAssets = exports.TeleportersGifsURLs = exports.TeleportersDatas = exports.ShowroomOffsetPositions = exports.CameraOffsets = exports.SkyboxURLs = exports.ExcludeFromDynamicShadows = exports.StaticMeshesReceivers = exports.MaterialsNoSpecular = exports.ShowroomDynamicFileNames = exports.ShowroomStaticFileNames = exports.ShowroomRootURLs = exports.ShowroomNames = exports.NbShowrooms = void 0;
const Pose_1 = __webpack_require__(/*! ../valueTypes/Pose */ 62609);
const TeleporterData_1 = __webpack_require__(/*! ./TeleporterData */ 23010);
const math_vector_1 = __webpack_require__(/*! @babylonjs/core/Maths/math.vector */ 79923);
/**
 * Le nombre de showrooms dans le projet
 */
exports.NbShowrooms = 1;
/**
 * Les noms de chaque scène
 */
exports.ShowroomNames = [
    "Showroom industrie 4.0",
];
/**
 * Les chemins d'accès des dossiers de chaque scène
 */
exports.ShowroomRootURLs = [
    "/scenes/Montargis/",
];
/**
 * Les noms des scènes babylon statiques de chaque showroom
 */
exports.ShowroomStaticFileNames = [
    ["sceneLights.babylon", "Scene_BAT.glb", "GLB_Environnement.glb", "Scene_Collider.glb", "Scene_POI.glb", "Misc.glb", "Scene_TP.glb"],
];
/**
 * Les noms des scènes babylon dynamiques de chaque showroom
 */
exports.ShowroomDynamicFileNames = [
    ["Sherpa-B_Animated.glb", "Sherpa-P_Animated.glb", "Omron.glb", "Misc_2_Animated.glb"],
];
/**
 * Les noms des materials dont on doit retirer la specular
 */
exports.MaterialsNoSpecular = [
    "SBS_Aluminium Dark",
];
/**
 * Les noms des meshs statiques pouvant recevoir des ombres dynamiques
 */
exports.StaticMeshesReceivers = [
    "Linoléum_gris", "_n"
];
/**
 * Les noms des meshs dynamique ne pouvant pas projeter d'ombres
 */
exports.ExcludeFromDynamicShadows = [
    "Misc_Anim_2", "Sherpa-B_Carton2",
];
/**
 * Les chemins d'accès des skyboxes pour chaque showroom
 */
exports.SkyboxURLs = [
    "/textures/skybox/TropicalSunnyDay",
];
/**
 * Les poses que doit prendre la caméra pour chaque showroom
 */
exports.CameraOffsets = [
    new Pose_1.Pose(new math_vector_1.Vector3(0, 2, 0), new math_vector_1.Vector3(0, -Math.PI / 2, 0)),
];
/**
 * Le décalage de position du showroom importé
 */
exports.ShowroomOffsetPositions = [
    math_vector_1.Vector3.Zero(),
];
/**
 * Les listes des téléporteurs pour chaque scène
 */
exports.TeleportersDatas = [
    [
        new TeleporterData_1.TeleporterData(new math_vector_1.Vector3(4, 1, 3.5), new math_vector_1.Vector3(1.5, 2, 1.5), new math_vector_1.Vector3(6.5, 5, -4), new math_vector_1.Vector3(0, -Math.PI / 4, 0)),
        new TeleporterData_1.TeleporterData(new math_vector_1.Vector3(6.5, 4.4, 3), new math_vector_1.Vector3(1.5, 2, 1.5), new math_vector_1.Vector3(2, 2, 2), new math_vector_1.Vector3(0, -Math.PI / 2, 0)),
    ],
];
/**
 * Les urls des gifs des téléporteurs pour chaque scène
 */
exports.TeleportersGifsURLs = [
    ["textures/ui/Portal_Hangar.gif", "textures/ui/Portal_Bureau.gif"],
];
/**
 * Les assets supplémentaires créées lors de l'importation de chaque scène
 * (skybox, shadowGenerator, etc.)
 */
exports.ScenesAssets = new Array(exports.NbShowrooms);
/**
 * Les AssetsContainers de chaque scène
 */
exports.AssetContainers = new Array(exports.NbShowrooms);
/**
 * Les positions de chaque point d'intérêt (cas d'usage) de chaque scène
 */
exports.POIPositions = new Array(exports.NbShowrooms);
/**
 * Les positions de chaque info générale de chaque scène
 */
exports.GIPositions = new Array(exports.NbShowrooms);


/***/ }),

/***/ 23010:
/*!************************************************!*\
  !*** ./src/models/sceneData/TeleporterData.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TeleporterData = void 0;
/**
 * Données d'instantiation des téléporteurs d'une scène .babylon
 */
class TeleporterData {
    //#endregion
    //#region  Constructeur
    /**
     * Constructeur par défaut
     * @param entryPos Position d'entrée du téléporteur
     * @param size Taille du téléporteur
     * @param destPos Position de destination du téléporteur
     * @param destRot Rotation de destination du téléporteur
     */
    constructor(entryPos, size, destPos, destRot) {
        this.EntryPos = entryPos;
        this.Size = size;
        this.DestPos = destPos;
        this.DestRot = destRot;
    }
}
exports.TeleporterData = TeleporterData;


/***/ }),

/***/ 6648:
/*!********************************************!*\
  !*** ./src/models/sceneObjs/Teleporter.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Teleporter = void 0;
/**
 * Téléporteur transportant la caméra à différents endroits de la carte
 */
class Teleporter {
    //#endregion
    //#region Constructeur
    /**
     * Constructeur
     * @param entryBox La zone d'entrée du téléporteur
     * @param onTriggerAction L'action à réaliser quand la caméra entre dans le téléporteur
     */
    constructor(entryBox, teleportIconPlane, onTriggerAction) {
        this.entryBox = entryBox;
        this.teleportIconPlane = teleportIconPlane;
        this.onTriggerAction = onTriggerAction;
    }
    //#endregion
    //#region Fonctions publiques
    /**
     * Active le téléporteur
     */
    Enable() {
        this.entryBox.actionManager.registerAction(this.onTriggerAction);
        this.teleportIconPlane.isVisible = true;
    }
    /**
     * Désactive le téléporteur
     */
    Disable() {
        this.entryBox.actionManager.unregisterAction(this.onTriggerAction);
        this.teleportIconPlane.isVisible = false;
    }
}
exports.Teleporter = Teleporter;


/***/ }),

/***/ 97174:
/*!*************************************!*\
  !*** ./src/models/styles/Styles.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gridSlateStyle = exports.menuBtnsSlateStyle = exports.poiInfoSlateStyle = exports.loadingSlateStyle = exports.worldMapSlateStyle = exports.defaultVideoLocaleStyle = exports.poiInfoPlaneStyle = exports.topRightLogoImageStyle = exports.defaultFullscreenImageStyle = exports.defaultImageLocaleStyle = exports.loadingBackgroundRectangleStyle = exports.hiddenRectangleStyle = exports.hyperlinkButtonsHStackPanelStyle = exports.defaultHStackPanelStyle = exports.defaultVStackPanelStyle = exports.contactBtnStyle = exports.youtubeBtnStyle = exports.linkedinBtnStyle = exports.i18nButtonStyle = exports.worldMapOpenButtonStyle = exports.worldMap2DCloseButtonStyle = exports.poiInfoButtonStyle = exports.worldMap2DSelectButtonStyle = exports.sceneSelectButtonStyle = exports.loadingTextBlockStyle = exports.defaultTextBlockStyle = exports.welcomeTextItalicGreyStyle = exports.welcomeTextRegularUnderlineGreenStyle = exports.welcomeTextRegularGreenStyle = exports.welcomeTitleBoldStyle = exports.poiDescVideoStyle = exports.poiCloseButtonStyle = exports.poiScrollViewerStyle = exports.poiInnerRectStyle = exports.poiRectStyle = exports.poiStackPanelStyle = exports.poiIconStyle = exports.poiImgStyle = exports.poiTextBoldItalicStyle = exports.poiTextItalicGreyStyle = exports.poiTextItalicWhiteStyle = exports.poiTextRegularUnderlineGreenStyle = exports.poiTextRegularGreenStyle = exports.poiTitleBoldStyle = exports.worldMap2DButtonTextBlockStyle = exports.teleportIconMaterialStyle = exports.homeInfoMaterialStyle = exports.generalInfoMaterialStyle = exports.poiInfoMaterialStyle = exports.Styles = void 0;
exports.worldMap3DSelectButtonStyle = exports.worldMap3DCloseButtonStyle = void 0;
const control_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/control */ 22905);
const math_color_1 = __webpack_require__(/*! @babylonjs/core/Maths/math.color */ 26041);
const math_vector_1 = __webpack_require__(/*! @babylonjs/core/Maths/math.vector */ 79923);
const mesh_1 = __webpack_require__(/*! @babylonjs/core/Meshes/mesh */ 76595);
const material_1 = __webpack_require__(/*! @babylonjs/core/Materials/material */ 5860);
exports.Styles = __importStar(__webpack_require__(/*! ./Styles */ 97174));
//#region Polices
/**
 * Polices des descriptions des POIs
 */
const roboto20 = {
    FontFamily: "Roboto",
    FontWeight: "400",
    FontSize: 20,
    FontStyle: "normal",
};
/**
 * Roboto Regular 22px
 */
const roboto22 = {
    FontFamily: "Roboto",
    FontWeight: "400",
    FontSize: 22,
    FontStyle: "normal",
};
/**
 * Roboto Bold 22px
 */
const robotoBold22 = {
    FontFamily: "Roboto-Bold",
    FontWeight: "900",
    FontSize: 22,
    FontStyle: "normal",
};
/**
 * Roboto Bold 24px
 */
const robotoBold24 = {
    FontFamily: "Roboto-Bold",
    FontWeight: "900",
    FontSize: 24,
    FontStyle: "normal",
};
/**
 * Roboto Italic 24px
 */
const robotoItalic20 = {
    FontFamily: "Roboto-Italic",
    FontWeight: "400",
    FontSize: 20,
    FontStyle: "italic",
};
/**
 * Roboto Bold Italic 24px
 */
const robotoBoldItalic22 = {
    FontFamily: "Roboto-BoldItalic",
    FontWeight: "900",
    FontSize: 22,
    FontStyle: "italic",
};
//#endregion
//#region Materials
/**
 * Material des points d'intérêt
 */
exports.poiInfoMaterialStyle = {
    DiffuseColor: math_color_1.Color3.White(),
    EmissiveColor: math_color_1.Color3.White(),
    TransparencyMode: material_1.Material.MATERIAL_ALPHABLEND,
    SpecularPower: -1,
    DiffuseTexHasAlpha: true,
    UseAlphaFromDiffuseTexture: true,
    DisableLighting: true
};
/**
 * Material des points d'information générale
 */
exports.generalInfoMaterialStyle = {
    DiffuseColor: math_color_1.Color3.White(),
    EmissiveColor: math_color_1.Color3.White(),
    TransparencyMode: material_1.Material.MATERIAL_ALPHABLEND,
    SpecularPower: -1,
    DiffuseTexHasAlpha: true,
    UseAlphaFromDiffuseTexture: true,
    DisableLighting: true
};
/**
 * Material du point du btn d'accueil
 */
exports.homeInfoMaterialStyle = {
    DiffuseColor: math_color_1.Color3.White(),
    EmissiveColor: math_color_1.Color3.White(),
    TransparencyMode: material_1.Material.MATERIAL_ALPHABLEND,
    SpecularPower: -1,
    DiffuseTexHasAlpha: true,
    UseAlphaFromDiffuseTexture: true,
    DisableLighting: true
};
/**
 * Material des icônes des téléporteurs
 */
exports.teleportIconMaterialStyle = {
    DiffuseColor: math_color_1.Color3.White(),
    EmissiveColor: math_color_1.Color3.White(),
    TransparencyMode: material_1.Material.MATERIAL_ALPHABLEND,
    SpecularPower: -1,
    DiffuseTexHasAlpha: true,
    UseAlphaFromDiffuseTexture: true,
    DisableLighting: true
};
//#endregion
//#region UIs 2D
//#region World Map
/**
 * Style de TextBlock des boutons de la carte
 */
exports.worldMap2DButtonTextBlockStyle = {
    Width: "100%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: robotoBold22.FontFamily,
    FontWeight: robotoBold22.FontWeight,
    FontSize: robotoBold22.FontSize,
    FontStyle: robotoBold22.FontStyle,
    TextWrapping: false,
    Color: "white",
    Underline: false,
};
//#endregion
//#region Descriptions des POIs
/**
 * Style de TextBlock d'une description de POI
 */
exports.poiTitleBoldStyle = {
    Width: "90%",
    Height: 30,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: robotoBold24.FontFamily,
    FontWeight: robotoBold24.FontWeight,
    FontSize: robotoBold24.FontSize,
    FontStyle: robotoBold24.FontStyle,
    TextWrapping: false,
    Color: "white",
    Underline: false,
};
/**
 * Style de TextBlock d'une description de POI
 */
exports.poiTextRegularGreenStyle = {
    Width: "90%",
    Height: 90,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: roboto20.FontFamily,
    FontWeight: roboto20.FontWeight,
    FontSize: roboto20.FontSize,
    FontStyle: roboto20.FontStyle,
    TextWrapping: true,
    Color: "#6FBC94",
    Underline: false,
};
/**
 * Style de TextBlock d'une description de POI
 */
exports.poiTextRegularUnderlineGreenStyle = {
    Width: "90%",
    Height: 30,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: roboto20.FontFamily,
    FontWeight: roboto20.FontWeight,
    FontSize: roboto20.FontSize,
    FontStyle: roboto20.FontStyle,
    TextWrapping: false,
    Color: "#6FBC94",
    Underline: true,
};
/**
 * Style de TextBlock d'une description de POI
 */
exports.poiTextItalicWhiteStyle = {
    Width: "90%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: robotoItalic20.FontFamily,
    FontWeight: robotoItalic20.FontWeight,
    FontSize: robotoItalic20.FontSize,
    FontStyle: robotoItalic20.FontStyle,
    TextWrapping: true,
    Color: "white",
    Underline: false,
};
/**
 * Style de TextBlock d'une description de POI
 */
exports.poiTextItalicGreyStyle = {
    Width: "90%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: robotoItalic20.FontFamily,
    FontWeight: robotoItalic20.FontWeight,
    FontSize: robotoItalic20.FontSize,
    FontStyle: robotoItalic20.FontStyle,
    TextWrapping: true,
    Color: "#C2C2C2",
    Underline: false,
};
/**
 * Style de TextBlock d'une description de POI
 */
exports.poiTextBoldItalicStyle = {
    Width: "90%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: robotoBoldItalic22.FontFamily,
    FontWeight: robotoBoldItalic22.FontWeight,
    FontSize: robotoBoldItalic22.FontSize,
    FontStyle: robotoBoldItalic22.FontStyle,
    TextWrapping: true,
    Color: "white",
    Underline: false,
};
/**
 * Style d'image d'une description de POI
 */
exports.poiImgStyle = {
    Width: 610,
    Height: 316,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_BOTTOM,
};
/**
 * Style d'icône d'une description de POI
 */
exports.poiIconStyle = {
    Width: 150,
    Height: 150,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_TOP,
};
/**
 * Style de StackPanel vertical d'une description de POI
 */
exports.poiStackPanelStyle = {
    Width: "90%",
    Height: "95%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    IsVertical: true,
    Spacing: 30
};
/**
 * Style de Rectangle chargé de masquer ses sous-éléments
 */
exports.poiRectStyle = {
    Width: 720,
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    CornerRadius: 0,
    ForegroundColor: "transparent",
    BackgroundColor: "#002439",
    ClipChildren: true,
    Thickness: 0
};
/**
 * Style de Rectangle chargé de masquer ses sous-éléments
 */
exports.poiInnerRectStyle = {
    Width: "100%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    CornerRadius: 0,
    ForegroundColor: "red",
    BackgroundColor: "red",
    ClipChildren: true,
    Thickness: 0
};
/**
 * Style de ScrollViewer chargé de masquer ses sous-éléments
 */
exports.poiScrollViewerStyle = {
    Width: "100%",
    Height: "50%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_RIGHT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    CornerRadius: 0,
    ForegroundColor: "white",
    BackgroundColor: "transparent",
    IsImageBased: false,
    Thickness: 0
};
/**
 * Style de Button de fermeture de la description d'un POI
 */
exports.poiCloseButtonStyle = {
    Width: 50,
    Height: 50,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_RIGHT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_TOP,
};
/**
 * Style de VideoLocale par défaut
 */
exports.poiDescVideoStyle = {
    Dimensions: new math_vector_1.Vector2(9.6, 5.4),
    SideOrientation: mesh_1.Mesh.FRONTSIDE,
    AutoPlay: false,
    AutoUpdateTexture: true,
    Loop: false,
    PauseOnLocalize: true,
};
//#endregion
//#region Welcome UI
/**
 * Style de TextBlock de l'écran d'accueil
 */
exports.welcomeTitleBoldStyle = {
    Width: "90%",
    Height: 30,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: robotoBold24.FontFamily,
    FontWeight: robotoBold24.FontWeight,
    FontSize: robotoBold24.FontSize,
    FontStyle: robotoBold24.FontStyle,
    TextWrapping: false,
    Color: "white",
    Underline: false,
};
/**
 * Style de TextBlock de l'écran d'accueil
 */
exports.welcomeTextRegularGreenStyle = {
    Width: "90%",
    Height: 90,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: roboto20.FontFamily,
    FontWeight: roboto20.FontWeight,
    FontSize: roboto20.FontSize,
    FontStyle: roboto20.FontStyle,
    TextWrapping: true,
    Color: "#6FBC94",
    Underline: false,
};
/**
 * Style de TextBlock de l'écran d'accueil
 */
exports.welcomeTextRegularUnderlineGreenStyle = {
    Width: "90%",
    Height: 30,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: roboto20.FontFamily,
    FontWeight: roboto20.FontWeight,
    FontSize: roboto20.FontSize,
    FontStyle: roboto20.FontStyle,
    TextWrapping: false,
    Color: "#6FBC94",
    Underline: true,
};
/**
 * Style de TextBlock de l'écran d'accueil
 */
exports.welcomeTextItalicGreyStyle = {
    Width: "90%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: robotoItalic20.FontFamily,
    FontWeight: robotoItalic20.FontWeight,
    FontSize: robotoItalic20.FontSize,
    FontStyle: robotoItalic20.FontStyle,
    TextWrapping: true,
    Color: "#C2C2C2",
    Underline: false,
};
//#endregion
//#region Autres
/**
 * Style de TextBlock par défaut
 */
exports.defaultTextBlockStyle = {
    Width: 200,
    Height: 20,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: roboto22.FontFamily,
    FontWeight: roboto22.FontWeight,
    FontSize: roboto22.FontSize,
    FontStyle: roboto22.FontStyle,
    TextWrapping: false,
    Color: "white",
    Underline: false,
};
/**
 * Style de TextBlock de l'écran de chargement
 */
exports.loadingTextBlockStyle = {
    Width: 500,
    Height: 30,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    TextHorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    TextVerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: roboto22.FontFamily,
    FontWeight: roboto22.FontWeight,
    FontSize: roboto22.FontSize,
    FontStyle: roboto22.FontStyle,
    TextWrapping: false,
    Color: "white",
    Underline: false,
};
/**
 * Style de Button de sélection de scène
 */
exports.sceneSelectButtonStyle = {
    Width: 200,
    Height: 50,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_TOP,
    FontFamily: roboto22.FontFamily,
    FontWeight: roboto22.FontWeight,
    FontSize: roboto22.FontSize,
    FontStyle: roboto22.FontStyle,
    CornerRadius: 5,
    ForegroundColor: "white",
    BackgroundColor: "green",
};
/**
 * Style de Button de sélection de scène
 */
exports.worldMap2DSelectButtonStyle = {
    Width: 200,
    Height: 50,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: roboto22.FontFamily,
    FontWeight: roboto22.FontWeight,
    FontSize: roboto22.FontSize,
    FontStyle: roboto22.FontStyle,
    CornerRadius: 5,
    ForegroundColor: "white",
    BackgroundColor: "green",
};
/**
 * Style de Button de sélection de scène
 */
exports.poiInfoButtonStyle = {
    Width: "100%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: roboto22.FontFamily,
    FontWeight: roboto22.FontWeight,
    FontSize: roboto22.FontSize,
    FontStyle: roboto22.FontStyle,
    CornerRadius: 5,
    ForegroundColor: "white",
    BackgroundColor: "#6FBC94",
};
/**
 * Style de Button de fermeture de la carte du monde
 */
exports.worldMap2DCloseButtonStyle = {
    Width: 50,
    Height: 50,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_RIGHT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_TOP,
};
/**
 * Style de Button d'ouverture de la carte du monde
 */
exports.worldMapOpenButtonStyle = {
    Width: 65,
    Height: 65,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_RIGHT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_BOTTOM,
};
/**
 * Style de Button de traduction
 */
exports.i18nButtonStyle = {
    Width: 74,
    Height: 74,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_RIGHT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_BOTTOM,
};
/**
 * Style de bouton hyperlien
 */
exports.linkedinBtnStyle = {
    Width: 50,
    Height: 50,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
};
/**
 * Style de bouton hyperlien
 */
exports.youtubeBtnStyle = {
    Width: 71,
    Height: 50,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
};
/**
 * Style de bouton hyperlien
 */
exports.contactBtnStyle = {
    Width: 72,
    Height: 72,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
};
/**
 * Style de StackPanel vertical par défaut
 */
exports.defaultVStackPanelStyle = {
    Width: 600,
    Height: 680,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_TOP,
    IsVertical: true,
    Spacing: 15
};
/**
 * Style de StackPanel horizontal par défaut
 */
exports.defaultHStackPanelStyle = {
    Width: 600,
    Height: 50,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_TOP,
    IsVertical: false,
    Spacing: 15
};
/**
 * Style de StackPanel horizontal par défaut
 */
exports.hyperlinkButtonsHStackPanelStyle = {
    Width: 600,
    Height: 74,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_BOTTOM,
    IsVertical: false,
    Spacing: 15
};
/**
 * Style de Rectangle chargé de masquer ses sous-éléments
 */
exports.hiddenRectangleStyle = {
    Width: "100%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    CornerRadius: 0,
    ForegroundColor: "#00000000",
    BackgroundColor: "#00000000",
    ClipChildren: true,
    Thickness: 0
};
/**
 * Style de Rectangle de l'écran de chargement
 */
exports.loadingBackgroundRectangleStyle = {
    Width: "100%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    CornerRadius: 0,
    ForegroundColor: "#00000000",
    BackgroundColor: "#000000AA",
    ClipChildren: true,
    Thickness: 0
};
/**
 * Style d'ImageLocale par défaut
 */
exports.defaultImageLocaleStyle = {
    Width: 300,
    Height: 200,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_TOP,
};
/**
 * Style d'Image par défaut
 */
exports.defaultFullscreenImageStyle = {
    Width: "100%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
};
/**
 * Style d'Image par défaut
 */
exports.topRightLogoImageStyle = {
    Width: "287px",
    Height: "109px",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_RIGHT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_TOP,
};
//#endregion
//#endregion
//#region  UIs 3D
/**
 * Style de Plane par défaut
 */
exports.poiInfoPlaneStyle = {
    Dimensions: new math_vector_1.Vector2(.5, .5),
    SideOrientation: mesh_1.Mesh.FRONTSIDE,
    AlwaysFacesPlayer: true,
};
/**
 * Style de VideoLocale par défaut
 */
exports.defaultVideoLocaleStyle = {
    Dimensions: new math_vector_1.Vector2(9.6, 5.4),
    SideOrientation: mesh_1.Mesh.FRONTSIDE,
    AutoPlay: true,
    AutoUpdateTexture: true,
    Loop: true,
    PauseOnLocalize: true,
};
/**
 * Style d'HolographicSlate de la carte du monde
 */
exports.worldMapSlateStyle = {
    Dimensions: new math_vector_1.Vector2(16, 16),
    TitleBarHeight: 0,
    Scaling: new math_vector_1.Vector3(1, 1, 1),
    ShowGizmos: false,
};
/**
 * Style d'HolographicSlate de l'écran de chargement
 */
exports.loadingSlateStyle = {
    Dimensions: new math_vector_1.Vector2(16, 16),
    TitleBarHeight: 0,
    Scaling: new math_vector_1.Vector3(1, 1, 1),
    ShowGizmos: false,
};
/**
 * Style d'HolographicSlate des boutons "En savoir plus"
 */
exports.poiInfoSlateStyle = {
    Dimensions: new math_vector_1.Vector2(1, 1),
    TitleBarHeight: 0,
    Scaling: new math_vector_1.Vector3(1, 1, 1),
    ShowGizmos: false,
};
/**
 * Style d'HolographicSlate par défaut
 */
exports.menuBtnsSlateStyle = {
    Dimensions: new math_vector_1.Vector2(16, 16),
    TitleBarHeight: 0,
    Scaling: new math_vector_1.Vector3(1, 1, 1),
    ShowGizmos: false,
};
/**
 * Style de grille pour un HolographicSlate
 */
exports.gridSlateStyle = {
    Width: "100%",
    Height: "100%",
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    BackgroundColor: "white",
    Rows: [{ Height: 1, IsPixel: false }],
    Columns: [{ Width: 1, IsPixel: false }],
};
/**
 * Style de Button de fermeture de la carte du monde 3D
 */
exports.worldMap3DCloseButtonStyle = {
    Width: 50,
    Height: 50,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_LEFT,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_TOP,
    FontFamily: roboto22.FontFamily,
    FontWeight: roboto22.FontWeight,
    FontSize: 10,
    FontStyle: roboto22.FontStyle,
    CornerRadius: 5,
    ForegroundColor: "white",
    BackgroundColor: "red",
};
/**
 * Style de Button de sélection de scène 3D
 */
exports.worldMap3DSelectButtonStyle = {
    Width: 50,
    Height: 25,
    HorizontalAlignment: control_1.Control.HORIZONTAL_ALIGNMENT_CENTER,
    VerticalAlignment: control_1.Control.VERTICAL_ALIGNMENT_CENTER,
    FontFamily: roboto22.FontFamily,
    FontWeight: roboto22.FontWeight,
    FontSize: 10,
    FontStyle: roboto22.FontStyle,
    CornerRadius: 5,
    ForegroundColor: "white",
    BackgroundColor: "green",
};
//#endregion


/***/ }),

/***/ 62609:
/*!***************************************!*\
  !*** ./src/models/valueTypes/Pose.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Pose = void 0;
/**
 * Représente la position et rotation d'un objet
 */
class Pose {
    //#endregion
    //#region  Constructeur
    /**
     * Constructeur par défaut
     * @param position La position de l'objet
     * @param rotation La rotation de l'objet
     */
    constructor(position, rotation) {
        this.Position = position;
        this.Rotation = rotation;
    }
}
exports.Pose = Pose;


/***/ }),

/***/ 62906:
/*!************************************************!*\
  !*** ./src/viewModels/factory/AudioBuilder.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateSoundEffect = exports.CreateMusic = void 0;
const sound_1 = __webpack_require__(/*! @babylonjs/core/Audio/sound */ 23938);
__webpack_require__(/*! @babylonjs/core/Audio/audioSceneComponent */ 69440);
/**
 * Crée un objet émettant une musique
 * @param url Le lien vers la fichier source
 * @param loop  TRUE si le son doit se jouer en boucle
 * @param playWhenReady TRUE si le son doit se jouer automatiquement
 * @param volume Le volume du son
 * @param scene La scène
 */
function CreateMusic(url, loop, playWhenReady, volume, scene) {
    const m = new sound_1.Sound("Music", url, scene, function () {
        if (playWhenReady) {
            m.play();
        }
    }, { loop: loop });
    m.setVolume(volume);
    return m;
}
exports.CreateMusic = CreateMusic;
/**
 * Crée un objet émettant un effet sonore
 * @param url Le lien vers la fichier source
 * @param playWhenReady TRUE si le son doit se jouer automatiquement
 * @param volume Le volume du son
 * @param scene La scène
 */
function CreateSoundEffect(url, playWhenReady, volume, scene) {
    const s = new sound_1.Sound("Sfx", url, scene, function () {
        if (playWhenReady) {
            s.play();
        }
    });
    s.setVolume(volume);
    return s;
}
exports.CreateSoundEffect = CreateSoundEffect;


/***/ }),

/***/ 67032:
/*!***************************************************!*\
  !*** ./src/viewModels/factory/BabylonImporter.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


//#region Imports
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoadAssetContainerAsync = exports.LoadBabylonFilesAsync = void 0;
__webpack_require__(/*! @babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent */ 33832);
__webpack_require__(/*! @babylonjs/core/Loading/Plugins/babylonFileLoader */ 97276);
__webpack_require__(/*! @babylonjs/core/Helpers/sceneHelpers */ 28461);
const math_vector_1 = __webpack_require__(/*! @babylonjs/core/Maths/math.vector */ 79923);
const sceneLoader_1 = __webpack_require__(/*! @babylonjs/core/Loading/sceneLoader */ 46632);
const Showrooms_1 = __webpack_require__(/*! ../../models/sceneData/Showrooms */ 86443);
const PerfUtils_1 = __webpack_require__(/*! ../utils/PerfUtils */ 42452);
//#endregion
//#region Fonctions publiques
/**
 * Importe une liste de scènes .babylon ou .glb de manière asynchrone, et prépare les scènes pour leur affichage à l'écran
 * @param scene La scène hôte
 * @param activeSceneIndex L'index de la scène .babylon à importer
 * @param onStartedCallback Appelée quand l'import d'une scène commence
 * @param onProgressCallback Appelée quand l'import d'une scène est en progression
 * @param onSuccessCallback Appelée quand l'import d'une scène est terminé
 * @returns L'AssetContainer contenant toutes les assets de la scène .babylon
 */
function LoadBabylonFilesAsync(scene, activeSceneIndex, onStartedCallback, onProgressCallback, onSuccessCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const roolURL = Showrooms_1.ShowroomRootURLs[activeSceneIndex];
        const skyboxURL = Showrooms_1.SkyboxURLs[activeSceneIndex];
        const offsetPos = Showrooms_1.ShowroomOffsetPositions[activeSceneIndex];
        const staticFileNames = Showrooms_1.ShowroomStaticFileNames[activeSceneIndex];
        const dynamicFileNames = Showrooms_1.ShowroomDynamicFileNames[activeSceneIndex];
        const combinedAssets = [];
        const staticRootMeshes = [];
        const staticShadowReceivers = [];
        const excludedFromDynamicShadows = [];
        const dynamicRootMeshes = [];
        const blockerMeshes = [];
        const floorMeshes = [];
        let poiMeshes = [];
        let giMeshes = [];
        let tpMeshes = [];
        let homeMesh;
        // Importe les scènes statiques
        for (let i = 0; i < staticFileNames.length; ++i) {
            const fileName = staticFileNames[i];
            const started = {
                CurFileID: i + 1,
                NbTotalFiles: staticFileNames.length + dynamicFileNames.length
            };
            onStartedCallback(started);
            // Importe le modèle
            const assets = yield LoadAssetContainerAsync(roolURL, fileName, scene, onProgressCallback);
            if (assets.meshes.length > 0) {
                staticRootMeshes.push(assets.meshes[0]);
            }
            // Edite les Materials
            assets.materials.forEach(mat => {
                if (Showrooms_1.MaterialsNoSpecular.includes(mat.name)) {
                    mat.useSpecularOverAlpha = false;
                }
            });
            // Récupère tous les meshs utilisés pour les collisions
            assets.meshes.forEach(mesh => {
                if (mesh.name == "COL_Murs") {
                    (0, PerfUtils_1.FreezeMesh)(mesh, true, false, false, true);
                    blockerMeshes.push(mesh);
                }
                else if (mesh.name == "COL_Sol") {
                    (0, PerfUtils_1.FreezeMesh)(mesh, true, false, false, true);
                    floorMeshes.push(mesh);
                }
                else if (mesh.name.includes("POI_")) {
                    (0, PerfUtils_1.FreezeMesh)(mesh, false, false, false, true);
                    poiMeshes.push(mesh);
                }
                else if (mesh.name.includes("GI_")) {
                    (0, PerfUtils_1.FreezeMesh)(mesh, false, false, false, true);
                    giMeshes.push(mesh);
                }
                else if (mesh.name.includes("TP_")) {
                    (0, PerfUtils_1.FreezeMesh)(mesh, false, false, false, true);
                    tpMeshes.push(mesh);
                }
                else if (mesh.name.includes("Home_")) {
                    (0, PerfUtils_1.FreezeMesh)(mesh, false, false, false, true);
                    homeMesh = mesh;
                }
                else {
                    (0, PerfUtils_1.FreezeMesh)(mesh, false, true, true, false);
                }
                // On ignore le sol pour qu'il puisse recevoir des ombres.
                for (let j = 0; j < Showrooms_1.StaticMeshesReceivers.length; ++j) {
                    const element = Showrooms_1.StaticMeshesReceivers[j];
                    if (mesh.name.includes(element)) {
                        staticShadowReceivers.push(mesh);
                    }
                }
            });
            if (assets.meshes.length > 0) {
                // Applique le décalage dans l'espace aux meshs si besoin
                assets.meshes[0].position = offsetPos;
            }
            // Ajoute les assets au container
            combinedAssets.push(assets);
        }
        // Importe les scènes dynamiques
        for (let i = 0; i < dynamicFileNames.length; ++i) {
            const fileName = dynamicFileNames[i];
            const started = {
                CurFileID: staticFileNames.length + i + 1,
                NbTotalFiles: staticFileNames.length + dynamicFileNames.length
            };
            onStartedCallback(started);
            // Importe le modèle
            const assets = yield LoadAssetContainerAsync(roolURL, fileName, scene, onProgressCallback);
            if (assets.meshes.length > 0) {
                dynamicRootMeshes.push(assets.meshes[0]);
            }
            assets.meshes.forEach(mesh => {
                mesh.receiveShadows = true;
                mesh.isPickable = false;
                // Indique quels meshs dynamiques ne doivent pas projeter d'ombres
                if (Showrooms_1.ExcludeFromDynamicShadows.includes(mesh.name)) {
                    excludedFromDynamicShadows.push(mesh);
                }
            });
            if (assets.meshes.length > 0) {
                // Applique le décalage dans l'espace aux meshs si besoin
                assets.meshes[0].position = offsetPos;
            }
            // Ajoute les assets au container
            combinedAssets.push(assets);
        }
        //#region Setup les assets complémentaires
        // La 1è scène contient les lights
        const staticDirLight = combinedAssets[0].lights[0];
        const dynamicDirLight = staticDirLight.clone("dynamicDirLight", staticDirLight.parent);
        const oppositeDirLight = staticDirLight.clone("oppositeDirLight", staticDirLight.parent);
        const lDir = staticDirLight.direction;
        const opDir = new math_vector_1.Vector3(-lDir.x, -lDir.y, -lDir.z);
        oppositeDirLight.direction = opDir;
        oppositeDirLight.intensity = 0.3;
        combinedAssets[0].lights.push(oppositeDirLight, dynamicDirLight);
        // Trie les POIs par nom
        poiMeshes = poiMeshes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        const poiPositions = [];
        for (let i = 0; i < poiMeshes.length; ++i) {
            const element = poiMeshes[i];
            poiPositions.push(element.absolutePosition);
        }
        // Trie les GIs par nom
        giMeshes = giMeshes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        const giPositions = [];
        for (let i = 0; i < giMeshes.length; ++i) {
            const element = giMeshes[i];
            giPositions.push(element.absolutePosition);
        }
        // Trie les TPs par nom
        tpMeshes = tpMeshes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        //#endregion
        //#region Ajoute les assets au container
        Showrooms_1.AssetContainers[activeSceneIndex] = combinedAssets;
        const success = {
            SceneDataIndex: activeSceneIndex,
            SkyboxUrl: skyboxURL,
            BlockerMeshes: blockerMeshes,
            FloorMeshes: floorMeshes,
            TPMeshes: tpMeshes,
            POIPositions: poiPositions,
            GIPositions: giPositions,
            HomePosition: homeMesh.absolutePosition,
            StaticLight: staticDirLight,
            DynamicLight: dynamicDirLight,
            StaticRootMeshes: staticRootMeshes,
            StaticShadowReceivers: staticShadowReceivers,
            ExcludedFromDynamicShadows: excludedFromDynamicShadows,
            DynamicRootMeshes: dynamicRootMeshes
        };
        onSuccessCallback(success);
        //#endregion
        return combinedAssets;
    });
}
exports.LoadBabylonFilesAsync = LoadBabylonFilesAsync;
//#endregion
//#region Fonctions privées
/**
 *
 * @param rootUrl Importe une scène .babylon ou .glb de manière asynchrone et la stocke dans un AssetContainer
 * @param fileName Nom du fichier
 * @param scene La scène hôte
 * @param onProgressCallback Appelée quand l'import est en progression
 * @returns Un AssetContainer contenant toutes les assets du fichier
 */
function LoadAssetContainerAsync(rootUrl, fileName, scene, onProgressCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            sceneLoader_1.SceneLoader.LoadAssetContainer(rootUrl, fileName, scene, function (container) { res(container); }, onProgressCallback);
        });
    });
}
exports.LoadAssetContainerAsync = LoadAssetContainerAsync;
//#endregion


/***/ }),

/***/ 11243:
/*!***********************************************!*\
  !*** ./src/viewModels/factory/MeshBuilder.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


//#region Imports
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateTeleporter = exports.CreateVideoLocale = exports.CreateVideo = exports.CreateQuadPlane = exports.CreateGroundPlane = exports.CreateSkybox = exports.CreateCube = exports.CreateStandardMaterial = void 0;
const VideoLocale_1 = __webpack_require__(/*! ../localization/VideoLocale */ 1555);
const Teleporter_1 = __webpack_require__(/*! ../../models/sceneObjs/Teleporter */ 6648);
const math_color_1 = __webpack_require__(/*! @babylonjs/core/Maths/math.color */ 26041);
const standardMaterial_1 = __webpack_require__(/*! @babylonjs/core/Materials/standardMaterial */ 2093);
const texture_1 = __webpack_require__(/*! @babylonjs/core/Materials/Textures/texture */ 7481);
const mesh_1 = __webpack_require__(/*! @babylonjs/core/Meshes/mesh */ 76595);
const boxBuilder_1 = __webpack_require__(/*! @babylonjs/core/Meshes/Builders/boxBuilder */ 96793);
const cubeTexture_1 = __webpack_require__(/*! @babylonjs/core/Materials/Textures/cubeTexture */ 34294);
const groundBuilder_1 = __webpack_require__(/*! @babylonjs/core/Meshes/Builders/groundBuilder */ 66423);
const planeBuilder_1 = __webpack_require__(/*! @babylonjs/core/Meshes/Builders/planeBuilder */ 58144);
const actionManager_1 = __webpack_require__(/*! @babylonjs/core/Actions/actionManager */ 11165);
const directActions_1 = __webpack_require__(/*! @babylonjs/core/Actions/directActions */ 49888);
const videoTexture_1 = __webpack_require__(/*! @babylonjs/core/Materials/Textures/videoTexture */ 94990);
//#endregion
//#region Fonctions publiques
/**
 * Crée un StandardMaterial
 * @param name Le nom du Material
 * @param style Le style du Material
 * @param scene La scène
 * @returns Un StandardMaterial
 */
function CreateStandardMaterial(name, freeze, style, scene, diffuseTexUrl, emissiveTexUrl) {
    const m = new standardMaterial_1.StandardMaterial(name, scene);
    m.disableLighting = style.DisableLighting;
    m.diffuseColor = style.DiffuseColor;
    m.transparencyMode = style.TransparencyMode;
    m.useAlphaFromDiffuseTexture = style.UseAlphaFromDiffuseTexture;
    m.emissiveColor = style.EmissiveColor;
    if (style.SpecularPower < 0) {
        m.specularColor = math_color_1.Color3.Black();
    }
    else {
        m.specularPower = style.SpecularPower;
    }
    if (freeze) {
        m.freeze();
    }
    return m;
}
exports.CreateStandardMaterial = CreateStandardMaterial;
/**
 * Crée une skybox
 * @param rootUrl Chemin d'accès de la texture
 * @param dimensions Dimensions de la skybox
 * @param scene La scène hôte
 * @returns Le mesh de la skybox
 */
function CreateCube(position, size, scene) {
    const box = (0, boxBuilder_1.CreateBox)("", { size: size }, scene);
    box.position = position;
    return box;
}
exports.CreateCube = CreateCube;
/**
 * Crée une skybox
 * @param rootUrl Chemin d'accès de la texture
 * @param dimensions Dimensions de la skybox
 * @param scene La scène hôte
 * @returns Le mesh de la skybox
 */
function CreateSkybox(rootUrl, dimensions, scene) {
    var skybox = (0, boxBuilder_1.CreateBox)("skybox", { size: dimensions }, scene);
    var skyboxMaterial = new standardMaterial_1.StandardMaterial("skybox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new cubeTexture_1.CubeTexture(rootUrl, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = texture_1.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new math_color_1.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new math_color_1.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.isPickable = false;
    skybox.receiveShadows = false;
    return skybox;
}
exports.CreateSkybox = CreateSkybox;
/**
 * Crée un sol
 * @param isVisible TRUE si le sol doit être visible
 * @param enableCollisions TRUE si les collisions sont actives
 * @param scene La scène hôte
 * @returns Le mesh du sol
 */
function CreateGroundPlane(isVisible, enableCollisions, scene) {
    const ground = (0, groundBuilder_1.CreateGround)("plane", { width: 300, height: 300 }, scene);
    const groundMat = new standardMaterial_1.StandardMaterial("mat", scene);
    groundMat.diffuseColor = math_color_1.Color3.Green();
    ground.material = groundMat;
    ground.isVisible = isVisible;
    ground.isPickable = false;
    if (enableCollisions) {
        ground.checkCollisions = true;
    }
    return ground;
}
exports.CreateGroundPlane = CreateGroundPlane;
/**
 * Crée un sol
 * @param position La position dans l'espace 3D
 * @param rotation La rotation dans l'espace 3D
 * @param videoLocaleTag Le tag de traduction
 * @param style Le style de la vidéo
 * @param scene La scène hôte
 * @returns Le mesh du sol
 */
function CreateQuadPlane(position, rotation, material, style, scene, name) {
    const planeOptions = {
        height: style.Dimensions.x,
        width: style.Dimensions.y,
        sideOrientation: style.SideOrientation,
        updatable: false,
    };
    const p = (0, planeBuilder_1.CreatePlane)(name, planeOptions, scene);
    p.position = position;
    p.rotation = rotation;
    p.material = material;
    if (style.AlwaysFacesPlayer) {
        p.billboardMode = mesh_1.Mesh.BILLBOARDMODE_ALL;
    }
    return p;
}
exports.CreateQuadPlane = CreateQuadPlane;
/**
 * Crée un sol
 * @param position La position dans l'espace 3D
 * @param rotation La rotation dans l'espace 3D
 * @param videoLocaleTag Le tag de traduction
 * @param style Le style de la vidéo
 * @param scene La scène hôte
 * @returns Le mesh du sol
 */
function CreateVideo(name, url, position, rotation, style, scene) {
    const planeOptions = {
        height: style.Dimensions.x,
        width: style.Dimensions.y,
        sideOrientation: style.SideOrientation,
        updatable: false,
    };
    const videoOptions = {
        autoPlay: false,
        autoUpdateTexture: style.AutoUpdateTexture,
    };
    const actionOptions = {
        trigger: actionManager_1.ActionManager.OnPickTrigger,
    };
    const videoMesh = (0, planeBuilder_1.CreatePlane)(name, planeOptions, scene);
    videoMesh.position = position;
    videoMesh.rotation = rotation;
    const vidMat = new standardMaterial_1.StandardMaterial("m", scene);
    vidMat.roughness = 1;
    vidMat.emissiveColor = math_color_1.Color3.White();
    videoMesh.material = vidMat;
    const videoTexture = new videoTexture_1.VideoTexture("vidtex", url, scene, false, false, videoTexture_1.VideoTexture.TRILINEAR_SAMPLINGMODE, videoOptions);
    vidMat.diffuseTexture = videoTexture;
    return videoMesh;
}
exports.CreateVideo = CreateVideo;
/**
 * Crée un sol
 * @param position La position dans l'espace 3D
 * @param rotation La rotation dans l'espace 3D
 * @param videoLocaleTag Le tag de traduction
 * @param style Le style de la vidéo
 * @param scene La scène hôte
 * @returns Le mesh du sol
 */
function CreateVideoLocale(position, rotation, videoLocaleTag, style, scene) {
    const planeOptions = {
        height: style.Dimensions.x,
        width: style.Dimensions.y,
        sideOrientation: style.SideOrientation,
        updatable: false,
    };
    const videoOptions = {
        autoPlay: false,
        autoUpdateTexture: style.AutoUpdateTexture,
    };
    const actionOptions = {
        trigger: actionManager_1.ActionManager.OnPickTrigger,
    };
    const videoMesh = (0, planeBuilder_1.CreatePlane)("plane", planeOptions, scene);
    videoMesh.position = position;
    videoMesh.rotation = rotation;
    videoMesh.actionManager = new actionManager_1.ActionManager(scene);
    videoMesh.actionManager.registerAction(new directActions_1.ExecuteCodeAction(actionOptions, () => {
        if (!videoLocale.Enabled)
            return;
        if (videoLocale.Paused) {
            videoLocale.Play();
        }
        else {
            videoLocale.Pause();
        }
    }));
    const vidMat = new standardMaterial_1.StandardMaterial("m", scene);
    vidMat.roughness = 1;
    vidMat.emissiveColor = math_color_1.Color3.White();
    videoMesh.material = vidMat;
    const videoTexture = new videoTexture_1.VideoTexture("vidtex", "locales/videos/en/video1.mp4", scene, false, false, videoTexture_1.VideoTexture.TRILINEAR_SAMPLINGMODE, videoOptions);
    vidMat.diffuseTexture = videoTexture;
    const videoLocale = new VideoLocale_1.VideoLocale(videoLocaleTag, style.PauseOnLocalize, videoMesh, videoTexture, "VideoLocale");
    return videoLocale;
}
exports.CreateVideoLocale = CreateVideoLocale;
/**
 *
 * @param data Les données d'instantiation du téléporteur
 * @param scene La scène contenant l'objet
 * @returns Le téléporteur
 */
function CreateTeleporter(tpMesh, data, material, scene) {
    tpMesh.material = material;
    const entryBox = (0, boxBuilder_1.CreateBox)("entry", { width: data.Size.x, height: data.Size.y, depth: data.Size.z }, scene);
    entryBox.position = data.EntryPos;
    entryBox.isVisible = false;
    entryBox.isPickable = false;
    entryBox.checkCollisions = false;
    //const mat = new StandardMaterial("mat", scene);
    //mat.diffuseColor = Color3.Green();
    //entryBox.material = mat;
    // Détecte la présence du joueur et le téléporte à sa destination
    entryBox.actionManager = new actionManager_1.ActionManager(scene);
    const onTriggerAction = new directActions_1.ExecuteCodeAction({
        trigger: actionManager_1.ActionManager.OnIntersectionEnterTrigger,
        parameter: scene.activeCamera.getChildMeshes()[0],
    }, () => {
        scene.activeCamera.position.copyFrom(data.DestPos);
        scene.activeCamera.rotation.copyFrom(data.DestRot);
    });
    return new Teleporter_1.Teleporter(entryBox, tpMesh, onTriggerAction);
}
exports.CreateTeleporter = CreateTeleporter;
//#endregion


/***/ }),

/***/ 3292:
/*!************************************************!*\
  !*** ./src/viewModels/factory/SceneBuilder.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


//#region Imports
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateDirectionalLight = exports.CreateHemisphericLight = exports.CreateShadowGenerator = exports.CreateFPSCamera = exports.CreateUniversalCamera = exports.CreateScene = void 0;
const universalCamera_1 = __webpack_require__(/*! @babylonjs/core/Cameras/universalCamera */ 86573);
const math_vector_1 = __webpack_require__(/*! @babylonjs/core/Maths/math.vector */ 79923);
const meshBuilder_1 = __webpack_require__(/*! @babylonjs/core/Meshes/meshBuilder */ 94600);
const collisionCoordinator_1 = __webpack_require__(/*! @babylonjs/core/Collisions/collisionCoordinator */ 19564);
const directionalLight_1 = __webpack_require__(/*! @babylonjs/core/Lights/directionalLight */ 52046);
const shadowGenerator_1 = __webpack_require__(/*! @babylonjs/core/Lights/Shadows/shadowGenerator */ 18595);
const hemisphericLight_1 = __webpack_require__(/*! @babylonjs/core/Lights/hemisphericLight */ 71513);
const PausableScene_1 = __webpack_require__(/*! ../../assets/PausableScene */ 82333);
const dcc = new collisionCoordinator_1.DefaultCollisionCoordinator(); // Nécessaire de l'importer à cause du tree-shaking
//#endregion
//#region Scene
/**
 * Crée une scène vide
 * @param engine Le moteur Babylon
 * @param enablePhysics TRUE pour activer la physique
 * @returns Une scène vide
 */
function CreateScene(engine, enablePhysics) {
    const scene = new PausableScene_1.PausableScene(false, engine, { useGeometryUniqueIdsMap: true, useMaterialMeshMap: true });
    if (enablePhysics) {
        scene.gravity = new math_vector_1.Vector3(0, -1, 0);
        scene.collisionsEnabled = true;
    }
    return scene;
}
exports.CreateScene = CreateScene;
//#endregion
//#region Lighting & Camera
/**
 * Crée une caméra omnidirectionnelle à la 1è personne pouvant se déplacer dans toutes les directions
 * @param scene La scène
 * @param position Position de départ
 * @param rotation Rotation de départ
 * @param canvas Pour activer les inputs
 * @returns Une UniversalCamera
 */
function CreateUniversalCamera(scene, position, rotation, canvas = null) {
    const camera = new universalCamera_1.UniversalCamera("camera", position, scene);
    camera.minZ = 0.5;
    camera.maxZ = 150;
    camera.inertia = .5;
    camera.speed = 2;
    camera.angularSensibility = 2000;
    camera.rotation = rotation;
    // Enable mouse wheel inputs.
    camera.inputs.addMouseWheel();
    // Revese the mouse wheel Y axis direction:
    camera.inputs.attached.mousewheel.wheelPrecisionY = 0.1;
    // Attache la caméra au canvas.
    // Si canvas est null, la caméra doit être attachée manuellement 
    // pour pouvoir utiliser les inputs.
    if (canvas) {
        camera.attachControl(canvas, true);
    }
    // ZQSD & WASD support
    camera.keysUp.push(87); //W
    camera.keysUp.push(90); //Z
    camera.keysDown.push(83); //S
    camera.keysLeft.push(65); //A
    camera.keysLeft.push(81); //Q
    camera.keysRight.push(68); //D
    camera.keysRight.push(69); //E
    return camera;
}
exports.CreateUniversalCamera = CreateUniversalCamera;
/**
 * Crée une caméra en vue à la 1è personne
 * @param scene La scène
 * @param enablePhysics TRUE pour appliquer la gravité et les collisions à cette caméra
 * @param position Position de départ
 * @param rotation Rotation de départ
 * @param maxZ Distance max de rendu
 * @param canvas Pour activer les inputs
 * @returns Une UniversalCamera
 */
function CreateFPSCamera(name, scene, enablePhysics, position, rotation, maxZ, canvas = null) {
    const camera = new universalCamera_1.UniversalCamera(name, position, scene);
    camera.minZ = 0.5;
    camera.maxZ = maxZ;
    camera.inertia = .5;
    camera.speed = 1;
    camera.angularSensibility = 1000;
    camera.rotation = rotation;
    if (enablePhysics) {
        //Set the ellipsoid around the camera (e.g. your player's size)
        camera.ellipsoid = new math_vector_1.Vector3(.5, .8, .5);
        camera.applyGravity = true;
        camera.checkCollisions = true;
        // Ajoute un collider à la caméra pour les triggers des téléporteurs
        const collider = meshBuilder_1.MeshBuilder.CreateBox("cameraCollider", { size: 1 }, scene);
        collider.isPickable = false;
        collider.parent = camera;
    }
    // Attache la caméra au canvas.
    // Si canvas est null, la caméra doit être attachée manuellement 
    // pour pouvoir utiliser les inputs.
    if (canvas) {
        camera.attachControl(canvas, true);
    }
    // ZQSD & WASD support
    camera.keysUp.push(87); //W
    camera.keysUp.push(90); //Z
    camera.keysDown.push(83); //S
    camera.keysLeft.push(65); //A
    camera.keysLeft.push(81); //Q
    camera.keysRight.push(68); //D
    camera.keysRight.push(69); //E
    return camera;
}
exports.CreateFPSCamera = CreateFPSCamera;
/**
 * Crée un générateur d'ombres en cascade
 * @param resolution La résolution de l'ombre
 * @param shadowMaxZ Distance de rendu de l'ombre (identique à celle de la caméra)
 * @param shadowDarkness L'intensité des ombres
 * @param light La lumière depuis laquelle est créée l'ombre
 * @returns Un CascadedShadowGenerator
 */
function CreateShadowGenerator(resolution, shadowDarkness, light) {
    const sg = new shadowGenerator_1.ShadowGenerator(resolution, light);
    sg.usePercentageCloserFiltering = true;
    sg.forceBackFacesOnly = false;
    sg.bias = 0.0005;
    sg.normalBias = 0.1;
    // sg.transparencyShadow = true;
    // sg.enableSoftTransparentShadow = true;
    sg.filteringQuality = shadowGenerator_1.ShadowGenerator.QUALITY_HIGH;
    sg.setDarkness(shadowDarkness);
    return sg;
}
exports.CreateShadowGenerator = CreateShadowGenerator;
/**
 * Crée une lumière hémisphérique affectant toute la scène
 * @param intensity L'intensité de la lumière
 * @param direction La direction de la lumière
 * @param scene La scène contenant cette lumière
 * @returns Une HemisphericLight
 */
const CreateHemisphericLight = (intensity, direction, scene) => {
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new hemisphericLight_1.HemisphericLight("Hemispheric Light", direction, scene);
    light.intensity = intensity;
    return light;
};
exports.CreateHemisphericLight = CreateHemisphericLight;
/**
 * Crée une lumière directionnelle affectant toute la scène
 * @param name Le nom de la lumière
 * @param intensity L'intensité de la lumière
 * @param direction La direction de la lumière
 * @param scene La scène contenant cette lumière
 * @returns Une DirectionalLight
 */
const CreateDirectionalLight = (name, intensity, direction, scene) => {
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new directionalLight_1.DirectionalLight(name, direction, scene);
    light.intensity = intensity;
    light.autoUpdateExtends = false; // Asks the light to not recompute shadow position
    return light;
};
exports.CreateDirectionalLight = CreateDirectionalLight;
//#endregion


/***/ }),

/***/ 33442:
/*!*********************************************!*\
  !*** ./src/viewModels/factory/UIBuilder.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


//#region Imports
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateScrollViewer = exports.CreateGrid = exports.CreateImageLocale = exports.CreateImage = exports.CreateButtonLocale = exports.CreateImageOnlyHyperlinkButton = exports.CreateImageOnlyButton = exports.CreateButton = exports.CreateTextBlockLocale = exports.CreateTextBlock = exports.CreateEllipse = exports.CreateRectangle = exports.CreateStackPanel = exports.CreatePulseAnimation = exports.CreateLoadingRing = exports.CreateContainer = exports.CreateFullscreenUI = void 0;
const TextBlockLocale_1 = __webpack_require__(/*! ../localization/TextBlockLocale */ 80000);
const ImageLocale_1 = __webpack_require__(/*! ../localization/ImageLocale */ 30201);
const ButtonLocale_1 = __webpack_require__(/*! ../localization/ButtonLocale */ 84894);
const i18next_1 = __importDefault(__webpack_require__(/*! i18next */ 35543));
const math_vector_1 = __webpack_require__(/*! @babylonjs/core/Maths/math.vector */ 79923);
const animation_1 = __webpack_require__(/*! @babylonjs/core/Animations/animation */ 7540);
__webpack_require__(/*! @babylonjs/core/Animations/animatable.js */ 27284);
const advancedDynamicTexture_1 = __webpack_require__(/*! @babylonjs/gui/2D/advancedDynamicTexture */ 77179);
const container_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/container */ 81655);
const ellipse_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/ellipse */ 65042);
const stackPanel_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/stackPanel */ 54676);
const rectangle_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/rectangle */ 57553);
const textBlock_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/textBlock */ 63008);
const button_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/button */ 22562);
const image_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/image */ 14861);
const grid_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/grid */ 77386);
const scrollViewer_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/scrollViewers/scrollViewer */ 536);
//#endregion
//#region Fonctions publiques
/**
 * Crée un nouveau canvas 2D en plein écran
 * @returns Un canvas 2D en plein écran
 */
function CreateFullscreenUI() {
    var advancedTexture = advancedDynamicTexture_1.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    return advancedTexture;
}
exports.CreateFullscreenUI = CreateFullscreenUI;
/**
 * Crée un conteneur vide
 * @param name Nom du conteneur
 * @param parent Conteneur
 * @returns Un conteneur vide
 */
function CreateContainer(name, parent) {
    var c = new container_1.Container(name);
    parent.addControl(c);
    return c;
}
exports.CreateContainer = CreateContainer;
/**
 * Crée l'icône de chargement et lance son animation
 * @param nbEllipses Nb de points de l'image
 * @param ellipseDiameter Diamètre des ellipses
 * @param circleRadius Taille de l'icône
 * @param ellipseOffsetY Décalage en Y de l'icône
 * @param container Conteneur
 * @param scene La scène hôte
 */
function CreateLoadingRing(nbEllipses, ellipseDiameter, circleRadius, ellipseOffsetY, container, scene) {
    for (var i = 0; i < nbEllipses; i++) {
        var ellipse = CreateEllipse(ellipseDiameter, "white", container);
        /* Distance around the circle */
        var radians = (2 * Math.PI / nbEllipses) * i + 11;
        /* Get the vector direction */
        var vertical = Math.sin(radians);
        var horizontal = Math.cos(radians);
        var spawnDir = new math_vector_1.Vector3(horizontal, vertical, 0);
        /* Get the spawn position */
        var spawnPos = new math_vector_1.Vector3(spawnDir.x * circleRadius, spawnDir.y * circleRadius - ellipseOffsetY, 0); // Radius is just the distance away from the point
        ellipse.left = spawnPos.x;
        ellipse.top = spawnPos.y;
        const delayBetweenDots = 50;
        const frameRate = 600 + delayBetweenDots * nbEllipses;
        CreatePulseAnimation(ellipse, frameRate, delayBetweenDots, i, nbEllipses);
        scene.beginAnimation(ellipse, 0, frameRate, true);
    }
}
exports.CreateLoadingRing = CreateLoadingRing;
/**
 * Crée une animation pour les ellipses de l'écran de chargement
 * @param ellipse L'ellipse à animer
 * @param frameRate Echantillonage de l'animation
 * @param delayBetweenDots Délai de lancement entre chaque ellipse
 * @param ellipseIndex La position de l'ellipse dans la liste
 * @param nbEllipses Nombre d'ellipses à animer
 */
function CreatePulseAnimation(ellipse, frameRate, delayBetweenDots, ellipseIndex, nbEllipses) {
    const xPulseAnim = new animation_1.Animation("xPulseAnim", "scaleX", frameRate, animation_1.Animation.ANIMATIONTYPE_FLOAT, animation_1.Animation.ANIMATIONLOOPMODE_CYCLE);
    const yPulseAnim = new animation_1.Animation("yPulseAnim", "scaleY", frameRate, animation_1.Animation.ANIMATIONTYPE_FLOAT, animation_1.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keyFrames = [];
    const scale = ellipse.scaleX;
    const plus = delayBetweenDots * ellipseIndex;
    const minus = delayBetweenDots * nbEllipses - plus;
    keyFrames.push({
        frame: 0,
        value: scale,
    });
    keyFrames.push({
        frame: plus,
        value: scale,
    });
    keyFrames.push({
        frame: plus + 300,
        value: scale * 1.5,
    });
    keyFrames.push({
        frame: plus + 600,
        value: scale,
    });
    keyFrames.push({
        frame: plus + 600 + minus,
        value: scale,
    });
    xPulseAnim.setKeys(keyFrames);
    yPulseAnim.setKeys(keyFrames);
    ellipse.animations = [xPulseAnim, yPulseAnim];
}
exports.CreatePulseAnimation = CreatePulseAnimation;
/**
 * Crée un StackPanel
 * @param posInPixels La position sur le canvas
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @returns Un StackPanel
 */
function CreateStackPanel(posInPixels, style, parent) {
    var s = new stackPanel_1.StackPanel();
    s.leftInPixels = posInPixels.x;
    s.topInPixels = posInPixels.y;
    if (typeof style.Width === 'number') {
        s.widthInPixels = style.Width;
    }
    else {
        s.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        s.heightInPixels = style.Height;
    }
    else {
        s.height = style.Width;
    }
    s.horizontalAlignment = style.HorizontalAlignment;
    s.verticalAlignment = style.VerticalAlignment;
    s.isVertical = style.IsVertical;
    s.spacing = style.Spacing;
    parent.addControl(s);
    return s;
}
exports.CreateStackPanel = CreateStackPanel;
/**
 * Crée un Rectangle
 * @param posInPixels La position sur le canvas
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @returns Un Rectangle
 */
function CreateRectangle(posInPixels, style, parent) {
    var r = new rectangle_1.Rectangle("Rectangle");
    r.leftInPixels = posInPixels.x;
    r.topInPixels = posInPixels.y;
    if (typeof style.Width === 'number') {
        r.widthInPixels = style.Width;
    }
    else {
        r.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        r.heightInPixels = style.Height;
    }
    else {
        r.height = style.Width;
    }
    r.thickness = style.Thickness;
    r.color = style.ForegroundColor;
    r.background = style.BackgroundColor;
    r.cornerRadius = style.CornerRadius;
    r.clipChildren = style.ClipChildren;
    r.horizontalAlignment = style.HorizontalAlignment;
    r.verticalAlignment = style.VerticalAlignment;
    parent.addControl(r);
    return r;
}
exports.CreateRectangle = CreateRectangle;
/**
 * Crée une ellipse
 * @param sizeInPixels La taille de l'ellipse en pixels
 * @param color La couleur de l'ellipse
 * @param parent Conteneur
 * @returns Une ellipse
 */
function CreateEllipse(sizeInPixels, color, parent) {
    var e = new ellipse_1.Ellipse("Ellipse");
    e.widthInPixels = sizeInPixels;
    e.heightInPixels = sizeInPixels;
    e.color = color;
    e.background = color;
    e.thickness = 0;
    parent.addControl(e);
    return e;
}
exports.CreateEllipse = CreateEllipse;
/**
 * Crée un TextBlock
 * @param posInPixels La position sur le canvas
 * @param text Le texte à afficher
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @returns Un TextBlock
 */
function CreateTextBlock(posInPixels, text, style, parent, name) {
    var t = new textBlock_1.TextBlock(name, text);
    t.leftInPixels = posInPixels.x;
    t.topInPixels = posInPixels.y;
    t.color = style.Color;
    if (typeof style.Width === 'number') {
        t.widthInPixels = style.Width;
    }
    else {
        t.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        t.heightInPixels = style.Height;
    }
    else {
        t.height = style.Width;
    }
    t.fontFamily = style.FontFamily;
    t.fontWeight = style.FontWeight;
    t.fontSize = style.FontSize;
    t.fontStyle = style.FontStyle;
    t.textWrapping = style.TextWrapping;
    t.horizontalAlignment = style.HorizontalAlignment;
    t.verticalAlignment = style.VerticalAlignment;
    t.resizeToFit = !style.TextWrapping;
    t.underline = style.Underline;
    parent.addControl(t);
    return t;
}
exports.CreateTextBlock = CreateTextBlock;
/**
 * Crée un TextBlockLocale
 * @param posInPixels La position sur le canvas
 * @param localeTag Le tag permettant de retrouver la traduction du texte dans le fichier json
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @returns Un TextBlockLocale
 */
function CreateTextBlockLocale(posInPixels, localeTag, style, parent, name) {
    var t = new TextBlockLocale_1.TextBlockLocale(localeTag, name, i18next_1.default.t(localeTag));
    t.leftInPixels = posInPixels.x;
    t.topInPixels = posInPixels.y;
    t.color = style.Color;
    if (typeof style.Width === 'number') {
        t.widthInPixels = style.Width;
    }
    else {
        t.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        t.heightInPixels = style.Height;
    }
    else {
        t.height = style.Width;
    }
    t.fontFamily = style.FontFamily;
    t.fontWeight = style.FontWeight;
    t.fontSize = style.FontSize;
    t.fontStyle = style.FontStyle;
    t.textWrapping = style.TextWrapping;
    t.horizontalAlignment = style.HorizontalAlignment;
    t.verticalAlignment = style.VerticalAlignment;
    t.resizeToFit = !style.TextWrapping;
    t.underline = style.Underline;
    parent.addControl(t);
    return t;
}
exports.CreateTextBlockLocale = CreateTextBlockLocale;
/**
 * Crée un Button
 * @param position La position sur le canvas
 * @param text Le texte à afficher
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @param name Le nom de l'élément
 * @returns Un Button
 */
function CreateButton(position, text, style, parent, onClick, name) {
    var b = button_1.Button.CreateSimpleButton(name, text);
    if (typeof position.x === 'number') {
        b.leftInPixels = position.x;
    }
    else {
        b.left = position.x;
    }
    if (typeof position.y === 'number') {
        b.topInPixels = position.y;
    }
    else {
        b.top = position.y;
    }
    if (typeof style.Width === 'number') {
        b.widthInPixels = style.Width;
    }
    else {
        b.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        b.heightInPixels = style.Height;
    }
    else {
        b.height = style.Width;
    }
    b.cornerRadius = style.CornerRadius;
    b.color = style.ForegroundColor;
    b.background = style.BackgroundColor;
    b.horizontalAlignment = style.HorizontalAlignment;
    b.verticalAlignment = style.VerticalAlignment;
    b.textBlock.fontFamily = style.FontFamily;
    b.textBlock.fontWeight = style.FontWeight;
    b.textBlock.fontSize = style.FontSize;
    b.textBlock.fontStyle = style.FontStyle;
    b.onPointerClickObservable.add(() => onClick());
    parent.addControl(b);
    return b;
}
exports.CreateButton = CreateButton;
/**
 * Crée un Button avec uniquement une image
 * @param position La position sur le canvas
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @param onClick L'action quand cliqué
 * @param imgUrl Le lien vers l'image
 * @param name Le nom de l'élément
 * @returns Un Button
 */
function CreateImageOnlyButton(position, style, parent, onClick, imgUrl, name) {
    var b = button_1.Button.CreateImageOnlyButton(name, imgUrl);
    if (typeof position.x === 'number') {
        b.leftInPixels = position.x;
    }
    else {
        b.left = position.x;
    }
    if (typeof position.y === 'number') {
        b.topInPixels = position.y;
    }
    else {
        b.top = position.y;
    }
    if (typeof style.Width === 'number') {
        b.widthInPixels = style.Width;
    }
    else {
        b.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        b.heightInPixels = style.Height;
    }
    else {
        b.height = style.Width;
    }
    b.thickness = 0;
    b.color = "transparent";
    b.background = "transparent";
    b.horizontalAlignment = style.HorizontalAlignment;
    b.verticalAlignment = style.VerticalAlignment;
    if (onClick !== null) {
        b.onPointerClickObservable.add(() => onClick());
    }
    parent.addControl(b);
    return b;
}
exports.CreateImageOnlyButton = CreateImageOnlyButton;
/**
 * Crée un Button avec uniquement une image et un hyperlien
 * @param position La position sur le canvas
 * @param hyperlink Le lien à atteindre
 * @param openMode Le mode d'ouverture du lien ("_other" ou "_self")
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @param imgUrl Le lien vers l'image
 * @param name Le nom de l'élément
 * @returns Un Button
 */
function CreateImageOnlyHyperlinkButton(position, hyperlink, openMode, style, parent, imgUrl, name) {
    var b = button_1.Button.CreateImageOnlyButton(name, imgUrl);
    if (typeof position.x === 'number') {
        b.leftInPixels = position.x;
    }
    else {
        b.left = position.x;
    }
    if (typeof position.y === 'number') {
        b.topInPixels = position.y;
    }
    else {
        b.top = position.y;
    }
    if (typeof style.Width === 'number') {
        b.widthInPixels = style.Width;
    }
    else {
        b.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        b.heightInPixels = style.Height;
    }
    else {
        b.height = style.Width;
    }
    b.thickness = 0;
    b.color = "transparent";
    b.background = "transparent";
    b.horizontalAlignment = style.HorizontalAlignment;
    b.verticalAlignment = style.VerticalAlignment;
    b.onPointerClickObservable.add(() => window.open(hyperlink, openMode));
    parent.addControl(b);
    return b;
}
exports.CreateImageOnlyHyperlinkButton = CreateImageOnlyHyperlinkButton;
/**
 * Crée un ButtonLocale
 * @param position La position sur le canvas
 * @param localeTag Le tag de traduction
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @param name Le nom de l'élément
 * @returns Un Button
 */
function CreateButtonLocale(position, localeTag, style, parent, onClick, name) {
    var b = button_1.Button.CreateSimpleButton(name, i18next_1.default.t(localeTag));
    if (typeof position.x === 'number') {
        b.leftInPixels = position.x;
    }
    else {
        b.left = position.x;
    }
    if (typeof position.y === 'number') {
        b.topInPixels = position.y;
    }
    else {
        b.top = position.y;
    }
    if (typeof style.Width === 'number') {
        b.widthInPixels = style.Width;
    }
    else {
        b.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        b.heightInPixels = style.Height;
    }
    else {
        b.height = style.Width;
    }
    b.cornerRadius = style.CornerRadius;
    b.color = style.ForegroundColor;
    b.background = style.BackgroundColor;
    b.horizontalAlignment = style.HorizontalAlignment;
    b.verticalAlignment = style.VerticalAlignment;
    b.textBlock.fontFamily = style.FontFamily;
    b.textBlock.fontWeight = style.FontWeight;
    b.textBlock.fontSize = style.FontSize;
    b.textBlock.fontStyle = style.FontStyle;
    b.onPointerClickObservable.add(() => onClick());
    parent.addControl(b);
    return new ButtonLocale_1.ButtonLocale(localeTag, b);
}
exports.CreateButtonLocale = CreateButtonLocale;
/**
 * Crée une ImageLocale
 * @param posInPixels La position sur le canvas
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @returns Une ImageLocale
 */
function CreateImage(posInPixels, url, style, parent, name) {
    const i = new image_1.Image(name, url);
    i.leftInPixels = posInPixels.x;
    i.topInPixels = posInPixels.y;
    if (typeof style.Width === 'number') {
        i.widthInPixels = style.Width;
    }
    else {
        i.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        i.heightInPixels = style.Height;
    }
    else {
        i.height = style.Height;
    }
    i.horizontalAlignment = style.HorizontalAlignment;
    i.verticalAlignment = style.VerticalAlignment;
    parent.addControl(i);
    return i;
}
exports.CreateImage = CreateImage;
/**
 * Crée une ImageLocale
 * @param posInPixels La position sur le canvas
 * @param localeTag Le tag permettant de retrouver la traduction du texte dans le fichier json
 * @param style Le style de l'élément
 * @param parent Le conteneur
 * @returns Une ImageLocale
 */
function CreateImageLocale(posInPixels, localeTag, style, parent, localeOptions, name) {
    const i = new ImageLocale_1.ImageLocale(localeTag, name, i18next_1.default.t(localeTag));
    i.leftInPixels = posInPixels.x;
    i.topInPixels = posInPixels.y;
    if (typeof style.Width === 'number') {
        i.widthInPixels = style.Width;
    }
    else {
        i.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        i.heightInPixels = style.Height;
    }
    else {
        i.height = style.Height;
    }
    i.horizontalAlignment = style.HorizontalAlignment;
    i.verticalAlignment = style.VerticalAlignment;
    parent.addControl(i);
    return i;
}
exports.CreateImageLocale = CreateImageLocale;
/**
 * Crée une grille
 * @param position La position de la grille
 * @param style Le style de la grille
 * @param parent Le conteneur de la grille
 * @param name Le nom de la grille
 */
function CreateGrid(position, style, parent, name) {
    const g = new grid_1.Grid(name);
    // Position
    if (typeof position.x === 'number') {
        g.leftInPixels = position.x;
    }
    else {
        g.left = position.x;
    }
    if (typeof position.y === 'number') {
        g.topInPixels = position.y;
    }
    else {
        g.top = position.y;
    }
    // Dimensions
    if (typeof style.Width === 'number') {
        g.widthInPixels = style.Width;
    }
    else {
        g.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        g.heightInPixels = style.Height;
    }
    else {
        g.height = style.Width;
    }
    g.background = style.BackgroundColor;
    g.horizontalAlignment = style.HorizontalAlignment;
    g.verticalAlignment = style.VerticalAlignment;
    // Lignes & Colonnes
    if (style.Rows !== undefined) {
        for (let i = 0; i < style.Rows.length; i++) {
            const r = style.Rows[i];
            g.addRowDefinition(r.Height, r.IsPixel);
        }
    }
    if (style.Columns !== undefined) {
        for (let i = 0; i < style.Columns.length; i++) {
            const c = style.Columns[i];
            g.addColumnDefinition(c.Width, c.IsPixel);
        }
    }
    if (parent !== undefined) {
        parent.addControl(g);
    }
    return g;
}
exports.CreateGrid = CreateGrid;
/**
 * Crée une ScrollView
 * @param position La position de la vue
 * @param style Le style de la vue
 * @param parent Le conteneur de la vue
 * @param name Le nom de la vue
 */
function CreateScrollViewer(position, style, parent, name) {
    const sv = new scrollViewer_1.ScrollViewer(name, style.IsImageBased);
    // Position
    if (typeof position.x === 'number') {
        sv.leftInPixels = position.x;
    }
    else {
        sv.left = position.x;
    }
    if (typeof position.y === 'number') {
        sv.topInPixels = position.y;
    }
    else {
        sv.top = position.y;
    }
    // Dimensions
    if (typeof style.Width === 'number') {
        sv.widthInPixels = style.Width;
    }
    else {
        sv.width = style.Width;
    }
    if (typeof style.Height === 'number') {
        sv.heightInPixels = style.Height;
    }
    else {
        sv.height = style.Width;
    }
    sv.thickness = style.Thickness;
    sv.color = style.ForegroundColor;
    sv.background = style.BackgroundColor;
    sv.horizontalAlignment = style.HorizontalAlignment;
    sv.verticalAlignment = style.VerticalAlignment;
    if (parent !== undefined) {
        parent.addControl(sv);
    }
    return sv;
}
exports.CreateScrollViewer = CreateScrollViewer;
//#endregion


/***/ }),

/***/ 68429:
/*!**************************************!*\
  !*** ./src/viewModels/factory/XR.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


//#region Imports
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnableTeleportation = exports.DisableTeleportation = exports.TrySetupXRAsync = void 0;
const webXRFeaturesManager_1 = __webpack_require__(/*! @babylonjs/core/XR/webXRFeaturesManager */ 75441);
const webXRSessionManager_1 = __webpack_require__(/*! @babylonjs/core/XR/webXRSessionManager */ 84824);
const webXRTypes_1 = __webpack_require__(/*! @babylonjs/core/XR/webXRTypes */ 61322);
//#endregion
//#region Fonctions publiques
/**
 * Tente d'établir une session XR
 * @param disableTeleportation TRUE si la téléportation doit être désactivée par défaut
 * @param scene La scène
 * @param onEnteredXRCallback Appelée quand on entre dans la session XR (si créée)
 * @param onExitedXRCallback  Appelée quand quitte la session XR (si créée)
 * @returns TRUE si la session est en place
 */
function TrySetupXRAsync(disableTeleportation, scene, onEnteredXRCallback, onExitedXRCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const xrIsSupported = yield CheckIfXRIsSupportedAsync();
        if (xrIsSupported) {
            const defaultXRExperience = yield scene.createDefaultXRExperienceAsync({
                disableTeleportation: disableTeleportation,
            });
            if (defaultXRExperience !== null) {
                defaultXRExperience.baseExperience.onStateChangedObservable.add((state) => {
                    switch (state) {
                        case webXRTypes_1.WebXRState.IN_XR:
                            onEnteredXRCallback();
                            break;
                        case webXRTypes_1.WebXRState.ENTERING_XR:
                            break;
                        case webXRTypes_1.WebXRState.EXITING_XR:
                            break;
                        case webXRTypes_1.WebXRState.NOT_IN_XR:
                            onExitedXRCallback();
                            break;
                    }
                    ;
                });
                return defaultXRExperience;
            }
        }
        return null;
    });
}
exports.TrySetupXRAsync = TrySetupXRAsync;
/**
 * Désactive la téléporation
 * @param xr L'utilitaire XR
 */
function DisableTeleportation(xr) {
    xr.baseExperience.featuresManager.disableFeature(webXRFeaturesManager_1.WebXRFeatureName.TELEPORTATION);
}
exports.DisableTeleportation = DisableTeleportation;
/**
 * Active la téléporation
 * @param floors Les meshs utilisés comme sols pour la téléportation
 * @param xr L'utilitaire XR
 */
function EnableTeleportation(floors, xr) {
    xr.baseExperience.featuresManager.enableFeature(webXRFeaturesManager_1.WebXRFeatureName.TELEPORTATION, "stable" /* or latest */, {
        xrInput: xr.input,
        floorMeshes: floors,
    });
}
exports.EnableTeleportation = EnableTeleportation;
//#endregion
//#region Fonctions privées
/**
 * Indique si le navigateur prend en charge l'XR
 * @returns TRUE si l'XR est possible sur ce navigateur
 */
function CheckIfXRIsSupportedAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        return webXRSessionManager_1.WebXRSessionManager.IsSessionSupportedAsync("immersive-vr");
    });
}
//#endregion


/***/ }),

/***/ 84894:
/*!*****************************************************!*\
  !*** ./src/viewModels/localization/ButtonLocale.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ButtonLocale = void 0;
const i18next_1 = __importDefault(__webpack_require__(/*! i18next */ 35543));
/**
 * TextBlock prenant en charge la traduction
 */
class ButtonLocale {
    //#endregion
    //#region Constructeur
    /**
     * Constructeur
     * @param localeTag Le tag indiquant quel traduction de quel fichier json obtenir
     * @param btn Le bouton associé
     */
    constructor(localeTag, btn) {
        this.LocaleTag = localeTag;
        this.Button = btn;
    }
    //#endregion
    //#region Fonctions publiques
    /**
     * Traduit le texte
     * @param options Les tags de traduction
     */
    Localize(options) {
        if (i18next_1.default.exists(this.LocaleTag)) {
            this.Button.textBlock.text = i18next_1.default.t(this.LocaleTag, options);
        }
        else {
            this.Button.textBlock.text = `Erreur: Le LocaleTag ${this.LocaleTag} n'a aucune référence pour la langue ${i18next_1.default.language}`;
            console.log(this.Button.textBlock.text);
        }
    }
}
exports.ButtonLocale = ButtonLocale;


/***/ }),

/***/ 30201:
/*!****************************************************!*\
  !*** ./src/viewModels/localization/ImageLocale.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ImageLocale = void 0;
const image_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/image */ 14861);
const i18next_1 = __importDefault(__webpack_require__(/*! i18next */ 35543));
/**
 * Image prenant en charge la traduction
 */
class ImageLocale extends image_1.Image {
    //#endregion
    //#region Constructeur
    /**
     * Constructeur
     * @param localeTag Le tag indiquant quel traduction de quel fichier json obtenir
     * @param name Le nom de l'élément UI
     * @param url L'url du chemin d'accès de l'image
     */
    constructor(localeTag, name, url) {
        super(name, url);
        this.LocaleTag = localeTag;
    }
    //#endregion
    //#region Fonctions publiques
    /**
     * Traduit l'image
     * @param options Les tags de traduction
     */
    Localize(options) {
        if (i18next_1.default.exists(this.LocaleTag)) {
            this.source = i18next_1.default.t(this.LocaleTag, options);
        }
        else {
            console.log(`Erreur: Le LocaleTag ${this.LocaleTag} n'a aucune référence pour la langue ${i18next_1.default.language}`);
        }
    }
}
exports.ImageLocale = ImageLocale;


/***/ }),

/***/ 80000:
/*!********************************************************!*\
  !*** ./src/viewModels/localization/TextBlockLocale.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextBlockLocale = void 0;
const textBlock_1 = __webpack_require__(/*! @babylonjs/gui/2D/controls/textBlock */ 63008);
const i18next_1 = __importDefault(__webpack_require__(/*! i18next */ 35543));
/**
 * TextBlock prenant en charge la traduction
 */
class TextBlockLocale extends textBlock_1.TextBlock {
    //#endregion
    //#region Constructeur
    /**
     * Constructeur
     * @param localeTag Le tag indiquant quel traduction de quel fichier json obtenir
     * @param name Le nom de l'élément UI
     * @param text Le texte affiché à l'écran
     */
    constructor(localeTag, name, text) {
        super(name, text);
        this.LocaleTag = localeTag;
    }
    //#endregion
    //#region Fonctions publiques
    /**
     * Traduit le texte
     * @param options Les tags de traduction
     */
    Localize(options) {
        if (i18next_1.default.exists(this.LocaleTag)) {
            this.text = i18next_1.default.t(this.LocaleTag, options);
        }
        else {
            this.text = `Erreur: Le LocaleTag ${this.LocaleTag} n'a aucune référence pour la langue ${i18next_1.default.language}`;
            console.log(this.text);
        }
    }
}
exports.TextBlockLocale = TextBlockLocale;


/***/ }),

/***/ 1555:
/*!****************************************************!*\
  !*** ./src/viewModels/localization/VideoLocale.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoLocale = void 0;
const i18next_1 = __importDefault(__webpack_require__(/*! i18next */ 35543));
class VideoLocale {
    //#endregion
    //#region Constructeur
    /**
     * Constructeur
     * @param localeTag Le tag indiquant quel traduction de quel fichier json obtenir
     * @param pauseOnLocalize TRUE si la vidéo doit être mise en pause lors de la traduction
     * @param mesh Le Mesh affichant la vidéo
     * @param videoTexture La texture affichant la vidéo
     * @param name Le nom de l'objet
     */
    constructor(localeTag, pauseOnLocalize, mesh, videoTexture, name) {
        this.LocaleTag = localeTag;
        this.Mesh = mesh;
        this.VideoTexture = videoTexture;
        this.Name = name;
        this.PauseOnLocalize = pauseOnLocalize;
        this.Disable();
    }
    //#endregion
    //#region Fonctions publiques
    /**
     * Traduit la vidéo
     * @param options Les tags de traduction
     */
    Localize(options) {
        if (i18next_1.default.exists(this.LocaleTag)) {
            const url = i18next_1.default.t(this.LocaleTag, options);
            if (url !== this.VideoTexture.url) {
                this.VideoTexture.updateURL(url);
                if (this.Enabled && !this.PauseOnLocalize) {
                    this.Play();
                }
            }
        }
        else {
            this.Pause();
            console.log(`Erreur: Le LocaleTag ${this.LocaleTag} n'a aucune référence pour la langue ${i18next_1.default.language}`);
        }
    }
    /**
     * Active l'objet et le rend visible
     */
    Enable() {
        this.Enabled = true;
        this.Mesh.isVisible = true;
    }
    /**
     * Désactive l'objet et le rend invisible
     */
    Disable() {
        this.Mesh.isVisible = false;
        this.VideoTexture.video.pause();
        this.Enabled = false;
        this.Paused = true;
    }
    /**
     * Pause la vidéo
     */
    Pause() {
        if (this.Enabled) {
            this.VideoTexture.video.pause();
            this.Paused = true;
        }
    }
    /**
     * Lance la vidéo
     */
    Play() {
        if (this.Enabled) {
            this.VideoTexture.video.play();
            this.Paused = false;
        }
    }
}
exports.VideoLocale = VideoLocale;


/***/ }),

/***/ 94140:
/*!*********************************************!*\
  !*** ./src/viewModels/localization/i18n.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetGIDescriptions = exports.GetPOIDescriptions = exports.SetBrowserLanguage = exports.locales = exports.defaultNS = void 0;
// i18n.ts
const i18next_1 = __importDefault(__webpack_require__(/*! i18next */ 35543));
const enCommon = __importStar(__webpack_require__(/*! ../../../locales/en/common.json */ 89851));
const esCommon = __importStar(__webpack_require__(/*! ../../../locales/es/common.json */ 31450));
const frCommon = __importStar(__webpack_require__(/*! ../../../locales/fr/common.json */ 40994));
const enPOIDesc = __importStar(__webpack_require__(/*! ../../../locales/en/poiDescriptions.json */ 42805));
const esPOIDesc = __importStar(__webpack_require__(/*! ../../../locales/es/poiDescriptions.json */ 18554));
const frPOIDesc = __importStar(__webpack_require__(/*! ../../../locales/fr/poiDescriptions.json */ 32066));
const enGIDesc = __importStar(__webpack_require__(/*! ../../../locales/en/giDescriptions.json */ 40041));
const esGIDesc = __importStar(__webpack_require__(/*! ../../../locales/es/giDescriptions.json */ 41780));
const frGIDesc = __importStar(__webpack_require__(/*! ../../../locales/fr/giDescriptions.json */ 49948));
const enImages = __importStar(__webpack_require__(/*! ../../../locales/en/images.json */ 71108));
const esImages = __importStar(__webpack_require__(/*! ../../../locales/es/images.json */ 60937));
const frImages = __importStar(__webpack_require__(/*! ../../../locales/fr/images.json */ 45281));
const enVideos = __importStar(__webpack_require__(/*! ../../../locales/en/videos.json */ 34930));
const esVideos = __importStar(__webpack_require__(/*! ../../../locales/es/videos.json */ 41571));
const frVideos = __importStar(__webpack_require__(/*! ../../../locales/fr/videos.json */ 92123));
const enAudios = __importStar(__webpack_require__(/*! ../../../locales/en/audio.json */ 27964));
const esAudios = __importStar(__webpack_require__(/*! ../../../locales/es/audio.json */ 87147));
const frAudios = __importStar(__webpack_require__(/*! ../../../locales/fr/audio.json */ 22995));
const POIDescription_1 = __webpack_require__(/*! ../../models/sceneData/POIDescription */ 20484);
const GIDescription_1 = __webpack_require__(/*! ../../models/sceneData/GIDescription */ 31202);
exports.defaultNS = 'common'; // Default name space
exports.locales = ['fr', 'en', 'es'];
i18next_1.default.init({
    lng: 'fr', // Default language
    fallbackLng: 'fr', // Fallback language
    debug: false, // Enable debug mode (optional)
    resources: {
        en: {
            common: enCommon,
            desc: enPOIDesc,
            images: enImages,
            videos: enVideos,
            audios: enAudios,
        },
        es: {
            common: esCommon,
            desc: esPOIDesc,
            images: esImages,
            videos: esVideos,
            audios: esAudios,
        },
        fr: {
            common: frCommon,
            desc: frPOIDesc,
            images: frImages,
            videos: frVideos,
            audios: frAudios,
        },
    },
});
/**
 * Récupère la langue par défaut du navigateur
 */
function SetBrowserLanguage(navigatorLanguage) {
    for (let i = 0; i < exports.locales.length; ++i) {
        if (navigatorLanguage.includes(exports.locales[i])) {
            i18next_1.default.changeLanguage(exports.locales[i]);
        }
    }
}
exports.SetBrowserLanguage = SetBrowserLanguage;
/**
 * Récupère les descriptions pour chaque scène
 * @param language La langue active
 * @param sceneIndex L'ID de la scène active
 * @param poiIndex L'ID du POI en cours d'inspection
 * @returns La description d'un POI de la scène renseignée
 */
function GetPOIDescriptions(language, sceneIndex, poiIndex) {
    switch (language) {
        case "fr":
            if (sceneIndex < frPOIDesc.DescriptionsPerScene.length) {
                const descsPerScene = frPOIDesc.DescriptionsPerScene[sceneIndex].Descriptions;
                if (poiIndex < descsPerScene.length) {
                    const desc = descsPerScene[poiIndex];
                    return new POIDescription_1.POIDescription(desc.Title, desc.Header, desc.Subtitle1, desc.Subtitle2, desc.Footnote, desc.ImageSourceAndSize, desc.Images2, desc.VideoInfo, desc.Texts1, desc.Texts2);
                }
            }
            return null;
        case "en":
            if (sceneIndex < enPOIDesc.DescriptionsPerScene.length) {
                const descsPerScene = enPOIDesc.DescriptionsPerScene[sceneIndex].Descriptions;
                if (poiIndex < descsPerScene.length) {
                    const desc = descsPerScene[poiIndex];
                    return new POIDescription_1.POIDescription(desc.Title, desc.Header, desc.Subtitle1, desc.Subtitle2, desc.Footnote, desc.ImageSourceAndSize, desc.Images2, desc.VideoInfo, desc.Texts1, desc.Texts2);
                }
            }
            return null;
        case "es":
            if (sceneIndex < esPOIDesc.DescriptionsPerScene.length) {
                const descsPerScene = esPOIDesc.DescriptionsPerScene[sceneIndex].Descriptions;
                if (poiIndex < descsPerScene.length) {
                    const desc = descsPerScene[poiIndex];
                    return new POIDescription_1.POIDescription(desc.Title, desc.Header, desc.Subtitle1, desc.Subtitle2, desc.Footnote, desc.ImageSourceAndSize, desc.Images2, desc.VideoInfo, desc.Texts1, desc.Texts2);
                }
            }
    }
}
exports.GetPOIDescriptions = GetPOIDescriptions;
/**
 * Récupère les descriptions pour chaque scène
 * @param language La langue active
 * @param sceneIndex L'ID de la scène active
 * @param giIndex L'ID du GI en cours d'inspection
 * @returns La description d'un GI de la scène renseignée
 */
function GetGIDescriptions(language, sceneIndex, giIndex) {
    switch (language) {
        case "fr":
            if (sceneIndex < frGIDesc.DescriptionsPerScene.length) {
                const descsPerScene = frGIDesc.DescriptionsPerScene[sceneIndex].Descriptions;
                if (giIndex < descsPerScene.length) {
                    const desc = descsPerScene[giIndex];
                    return new GIDescription_1.GIDescription(desc.Title, desc.ImagesSourcesAndSizes, desc.Texts);
                }
            }
            return null;
        case "en":
            if (sceneIndex < enGIDesc.DescriptionsPerScene.length) {
                const descsPerScene = enGIDesc.DescriptionsPerScene[sceneIndex].Descriptions;
                if (giIndex < descsPerScene.length) {
                    const desc = descsPerScene[giIndex];
                    return new GIDescription_1.GIDescription(desc.Title, desc.ImagesSourcesAndSizes, desc.Texts);
                }
            }
            return null;
        case "es":
            if (sceneIndex < esGIDesc.DescriptionsPerScene.length) {
                const descsPerScene = esGIDesc.DescriptionsPerScene[sceneIndex].Descriptions;
                if (giIndex < descsPerScene.length) {
                    const desc = descsPerScene[giIndex];
                    return new GIDescription_1.GIDescription(desc.Title, desc.ImagesSourcesAndSizes, desc.Texts);
                }
            }
    }
}
exports.GetGIDescriptions = GetGIDescriptions;
exports["default"] = i18next_1.default;


/***/ }),

/***/ 81525:
/*!******************************************!*\
  !*** ./src/viewModels/main/MainScene.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


//#region  Imports
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateShowroomsScene = void 0;
const SceneBuilder_1 = __webpack_require__(/*! ../factory/SceneBuilder */ 3292);
const UIBuilder_1 = __webpack_require__(/*! ../factory/UIBuilder */ 33442);
const MeshBuilder_1 = __webpack_require__(/*! ../factory/MeshBuilder */ 11243);
const XR_1 = __webpack_require__(/*! ../factory/XR */ 68429);
const BabylonImporter_1 = __webpack_require__(/*! ../factory/BabylonImporter */ 67032);
const AudioBuilder_1 = __webpack_require__(/*! ../factory/AudioBuilder */ 62906);
const Showrooms = __importStar(__webpack_require__(/*! ../../models/sceneData/Showrooms */ 86443));
const SceneAssets_1 = __webpack_require__(/*! ../../models/sceneData/SceneAssets */ 68877);
const Styles_1 = __webpack_require__(/*! ../../models/styles/Styles */ 97174);
const PerfUtils_1 = __webpack_require__(/*! ../utils/PerfUtils */ 42452);
const log_1 = __webpack_require__(/*! ../utils/log */ 71438);
const i18n_1 = __importStar(__webpack_require__(/*! ../localization/i18n */ 94140));
const Dictionary_1 = __webpack_require__(/*! ../../models/refTypes/Dictionary */ 38056);
const engine_1 = __webpack_require__(/*! @babylonjs/core/Engines/engine */ 93856);
const math_vector_1 = __webpack_require__(/*! @babylonjs/core/Maths/math.vector */ 79923);
const webXRFeaturesManager_1 = __webpack_require__(/*! @babylonjs/core/XR/webXRFeaturesManager */ 75441);
const actionManager_1 = __webpack_require__(/*! @babylonjs/core/Actions/actionManager */ 11165);
const directActions_1 = __webpack_require__(/*! @babylonjs/core/Actions/directActions */ 49888);
const animatedGifTexture_1 = __webpack_require__(/*! ../../assets/animatedGifTexture */ 63458);
const math_color_1 = __webpack_require__(/*! @babylonjs/core/Maths/math.color */ 26041);
//#endregion
//#region Variables d'instance
/**
 * TRUE si la musique est coupée
 */
let musicIsMute = false;
/**
 * TRUE si la voix est coupée
 */
let voiceIsMute = false;
/**
 * Le volume global
 */
let defaultGlobalVolume = 0.5;
/**
 * Garde en mémoire l'ID de la dernière scène chargée
 */
let previousSceneIndex = -1;
/**
 * TRUE si une scène babylon est en cours d'importation
 */
let isImporting = false;
/**
 * TRUE si une scène babylon est active
 */
let isInScene = false;
/**
 * Les paramètres de la XR
 */
let xrExp = null;
/**
 * TRUE si la XR est active
 */
let isInXR = false;
/**
 * TRUE si la description d'un POI est ouverte
 */
let isInfoDescriptionOpen = false;
/**
 * TRUE si la page de bienvenue est ouverte
 */
let isWelcomeOpen = false;
/**
 * L'ID de la langue actuellement utilisée
 */
let curLocaleID = 0;
/**
 * La description du POI actuellement affichée à l'écran
 */
let curPOIDescription = null;
/**
 * La description du GI actuellement affichée à l'écran
 */
let curGIDescription = null;
/**
 * L'ID de la scène en cours
 */
let curSceneIndex = -1;
/**
 * L'ID du point d'intérêt en cours
 */
let curPOIIndex = -1;
/**
 * L'ID de l'info générale en cours
 */
let curGIIndex = -1;
/**
 * Le dictionnaire contenant toutes les voix pour la scène actuelle
 */
let voicesDict = new Dictionary_1.Dictionary([]);
/**
 * Le doublage en cours de lecture
 */
let curVoice;
// UIs
// let worldMapUI3D: GUI3DManager;
// let loadingUI3D: GUI3DManager;
// let handMenuBtnsUI3D: GUI3DManager;
// let importText3D: TextBlockLocale;
// let progressText3D: TextBlock;
//#endregion
/**
 * Crée la scène des Showrooms
 * @param engine Le moteur de rendu Babylon
 * @returns la scène des Showrooms
 */
function CreateShowroomsScene(engine) {
    //#region HTML
    const canvas = document.getElementById("renderCanvas");
    const poiVideoPlayer = document.getElementById("poiVideoPlayer");
    //const poiVideoPlayer = document.getElementById("poiVideoPlayer") as HTMLIFrameElement;
    const videoCloseBtn = document.getElementById("videoCloseBtn");
    videoCloseBtn.addEventListener("click", function HideVideo() {
        if (engine_1.Engine.audioEngine.unlocked) {
            if (!musicIsMute) {
                bgm.play();
            }
            if (!voiceIsMute && curVoice !== null && curVoice !== undefined) {
                curVoice.play();
            }
        }
        scene.IsPaused = false;
        //poiVideoPlayer.src = "";
        poiVideoPlayer.pause();
        poiVideoPlayer.currentTime = 0;
        poiVideoPlayer.style.display = 'none';
        videoCloseBtn.style.display = 'none';
    });
    //#endregion
    //#region Localization
    curLocaleID = i18n_1.locales.indexOf(i18n_1.default.language);
    //#endregion
    //#region Scene
    let scene = (0, SceneBuilder_1.CreateScene)(engine, true);
    const mainCam = (0, SceneBuilder_1.CreateFPSCamera)("fpsCam", scene, true, math_vector_1.Vector3.Zero(), math_vector_1.Vector3.Zero(), 175, canvas);
    (0, MeshBuilder_1.CreateGroundPlane)(false, true, scene); // Sol temporaire le temps qu'on importe une scène
    (0, SceneBuilder_1.CreateHemisphericLight)(.3, new math_vector_1.Vector3(0, 1, 0), scene); // Lumière hémisphérique douce pour compenser les lights de chaque scène
    scene.activeCamera = mainCam;
    const optimizer = (0, PerfUtils_1.CreateSceneOptimizer)(scene);
    optimizer.start();
    //#endregion
    //#region Gifs
    const gifBtnTextures = [];
    let gifTeleporterTextures = [];
    const poiInfoMat = (0, MeshBuilder_1.CreateStandardMaterial)("poiInfoMat", true, Styles_1.Styles.poiInfoMaterialStyle, scene);
    const giInfoMat = (0, MeshBuilder_1.CreateStandardMaterial)("giInfoMat", true, Styles_1.Styles.generalInfoMaterialStyle, scene);
    const homeInfoMat = (0, MeshBuilder_1.CreateStandardMaterial)("homeInfoMat", true, Styles_1.Styles.homeInfoMaterialStyle, scene);
    //#endregion
    //#region Audio
    engine_1.Engine.audioEngine.setGlobalVolume(defaultGlobalVolume);
    // Disable the default audio unlock button
    engine_1.Engine.audioEngine.useCustomUnlockedButton = true;
    // Crée la musique de fond et la voix de doublage
    const bgm = (0, AudioBuilder_1.CreateMusic)("audio/bgm/Son Microélectronique.mp3", true, true, 0.15, scene);
    // Unlock audio on first user interaction.
    window.addEventListener("click", () => {
        if (!engine_1.Engine.audioEngine.unlocked) {
            engine_1.Engine.audioEngine.unlock();
            if (!musicIsMute) {
                bgm.play();
                muteUI2D.getControlByName("muteMusicBtnImg").source = "textures/ui/musicOn.png";
                menuBtnsUI2D.getControlByName("muteMusicBtnImg").source = "textures/ui/musicOn.png";
            }
        }
    }, { once: true });
    //#endregion
    //#region XR
    (0, XR_1.TrySetupXRAsync)(false, scene, OnEnteredXRCallback, OnExitedXRCallback).then((xrExperience) => {
        xrExp = xrExperience;
        if (xrExperience !== null) {
            //EnableTeleportation([ground], xrExperience);
            try {
                xrExperience.baseExperience.featuresManager.enableFeature(webXRFeaturesManager_1.WebXRFeatureName.HAND_TRACKING, "latest", { xrInput: xrExperience.input });
            }
            catch (err) {
                console.log("Articulated hand tracking not supported in this browser.");
            }
            ;
        }
    });
    //#endregion
    //#region UI 2D
    const worldMapUI2D = CreateWorldMapUI2D(OnLoadSceneDataBtnClick, OnCloseWorldMapBtnClick);
    const loadingUI2D = CreateLoadingUI2D(scene);
    const muteUI2D = CreateMuteUI2D(voiceIsMute, OnMuteMusicBtnClick, OnMuteVoiceBtnClick);
    const menuBtnsUI2D = CreateMenuButtonsUI2D(musicIsMute, Oni18nBtnClick, OnOpenWorldMapBtnClick, OnMuteMusicBtnClick, OnMuteVoiceBtnClick);
    const welcomeUI2D = CreateWelcomeUI2D(OnWelcomeCloseBtnClick);
    const poiDescriptionsUI2D = CreatePOIDescriptionPanel2D(OnPOIDescriptionCloseBtnClick, OnPOIDescriptionPlayVideoBtnClick);
    const giDescriptionsUI2D = CreateGIDescriptionPanel2D(OnGIDescriptionCloseBtnClick);
    const importText2D = loadingUI2D.getControlByName("importText");
    const progressText2D = loadingUI2D.getControlByName("progressText");
    loadingUI2D.rootContainer.isVisible = false;
    welcomeUI2D.rootContainer.isVisible = false;
    //#endregion
    //#region UI 3D
    // worldMapUI3D = CreateWorldMapUI3D(scene, OnLoadSceneDataBtnClick, OnCloseWorldMapBtnClick);
    // loadingUI3D = CreateLoadingUI3D(scene);
    // menuBtnsUI3D = CreateMenuButtonsUI3D(scene, OnSetLocaleBtnClick, OnOpenWorldMapBtnClick);
    // importText3D = GetControl2DInSlate<TextBlockLocale>(loadingUI3D, "loadingSlate", "importText");
    // progressText3D = GetControl2DInSlate<TextBlock>(loadingUI3D, "loadingSlate", "progressText");
    // const poiInfoBtnsUI3D = new GUI3DManager(scene);
    // const poiDescriptionsUI3D = new GUI3DManager(scene);
    //#endregion
    //#region Fonctions privées
    /**
     * Appelée quand la session XR est activée
     */
    function OnEnteredXRCallback() {
        isInXR = true;
        worldMapUI2D.rootContainer.isVisible = false;
        loadingUI2D.rootContainer.isVisible = false;
        menuBtnsUI2D.rootContainer.isVisible = false;
    }
    /**
     * Appelée quand la session XR est désactivée
     */
    function OnExitedXRCallback() {
        isInXR = false;
        worldMapUI2D.rootContainer.isVisible = !isInScene;
        loadingUI2D.rootContainer.isVisible = isImporting;
        menuBtnsUI2D.rootContainer.isVisible = isInScene;
    }
    /**
     * Appelée quand on clique sur le bouton pour couper la musique
     */
    function OnMuteMusicBtnClick() {
        musicIsMute = !musicIsMute;
        if (musicIsMute) {
            //Engine.audioEngine.setGlobalVolume(0);
            bgm.pause();
            muteUI2D.getControlByName("muteMusicBtnImg").source = "textures/ui/musicOff.png";
            menuBtnsUI2D.getControlByName("muteMusicBtnImg").source = "textures/ui/musicOff.png";
        }
        else {
            if (!engine_1.Engine.audioEngine.unlocked) {
                engine_1.Engine.audioEngine.unlock();
            }
            if (!bgm.isPlaying) {
                bgm.play();
            }
            //Engine.audioEngine.setGlobalVolume(defaultGlobalVolume);
            muteUI2D.getControlByName("muteMusicBtnImg").source = "textures/ui/musicOn.png";
            menuBtnsUI2D.getControlByName("muteMusicBtnImg").source = "textures/ui/musicOn.png";
        }
    }
    /**
     * Appelée quand on clique sur le bouton pour couper la musique
     */
    function OnMuteVoiceBtnClick() {
        voiceIsMute = !voiceIsMute;
        if (voiceIsMute) {
            //Engine.audioEngine.setGlobalVolume(0);
            if (curVoice !== null && curVoice !== undefined) {
                curVoice.stop();
            }
            muteUI2D.getControlByName("muteVoiceBtnImg").source = "textures/ui/Voice_OFF.png";
            menuBtnsUI2D.getControlByName("muteVoiceBtnImg").source = "textures/ui/Voice_OFF.png";
        }
        else {
            if (!engine_1.Engine.audioEngine.unlocked) {
                engine_1.Engine.audioEngine.unlock();
            }
            if (curVoice !== null && curVoice !== undefined && !curVoice.isPlaying && (isInfoDescriptionOpen || isWelcomeOpen)) {
                curVoice.play();
            }
            //Engine.audioEngine.setGlobalVolume(defaultGlobalVolume);
            muteUI2D.getControlByName("muteVoiceBtnImg").source = "textures/ui/Voice_ON.png";
            menuBtnsUI2D.getControlByName("muteVoiceBtnImg").source = "textures/ui/Voice_ON.png";
        }
    }
    /**
     * Appelée quand on clique sur le bouton de fermeture de la carte
     */
    function OnOpenWorldMapBtnClick() {
        isInScene = false;
        isWelcomeOpen = false;
        isInfoDescriptionOpen = false;
        curPOIIndex = -1;
        curGIIndex = -1;
        //Affiche la carte
        welcomeUI2D.rootContainer.isVisible = false;
        menuBtnsUI2D.rootContainer.isVisible = false;
        muteUI2D.rootContainer.isVisible = true;
        worldMapUI2D.rootContainer.isVisible = !isInXR;
        worldMapUI2D.rootContainer.getChildByName("rect close ui").isVisible = true;
        poiDescriptionsUI2D.rootContainer.isVisible = false;
        giDescriptionsUI2D.rootContainer.isVisible = false;
        menuBtnsUI2D.getControlByName("rect i18n btns").leftInPixels = -500;
        menuBtnsUI2D.getControlByName("rect bas droite").leftInPixels = -40;
        if (curVoice !== null && curVoice !== undefined) {
            curVoice.stop();
        }
    }
    /**
     * Appelée quand on clique sur le bouton de fermeture de la carte
     */
    function OnCloseWorldMapBtnClick() {
        worldMapUI2D.rootContainer.isVisible = false;
        muteUI2D.rootContainer.isVisible = false;
        menuBtnsUI2D.rootContainer.isVisible = !isInXR;
    }
    /**
     * Appelée quand on clique sur un des boutons de la carte du monde
     * @param activeSceneIndex La position de la scène active dans la liste
     */
    function OnLoadSceneDataBtnClick(activeSceneIndex) {
        // Charge les gifs
        if (gifBtnTextures.length == 0) {
            gifBtnTextures.push(new animatedGifTexture_1.AnimatedGifTexture("textures/ui/POI.gif", engine), new animatedGifTexture_1.AnimatedGifTexture("textures/ui/GI.gif", engine), new animatedGifTexture_1.AnimatedGifTexture("textures/ui/Home.gif", engine));
        }
        worldMapUI2D.rootContainer.isVisible = false;
        // Si un assetContainer a déjà été chargé
        if (previousSceneIndex > -1 && previousSceneIndex != activeSceneIndex) {
            // Désactive l'optimisation le temps de changer les assets de la scène
            (0, PerfUtils_1.UnfreezeScene)(scene);
            // Décharge la scène
            UnloadScene(previousSceneIndex);
        }
        // Si l'AssetContainer pour la scène active n'a pas été chargé, 
        // on le charge avant de l'ouvrir
        if (Showrooms.AssetContainers[activeSceneIndex] === undefined) {
            gifTeleporterTextures = [];
            for (let i = 0; i < Showrooms.TeleportersGifsURLs[activeSceneIndex].length; ++i) {
                const url = Showrooms.TeleportersGifsURLs[activeSceneIndex][i];
                gifTeleporterTextures.push(new animatedGifTexture_1.AnimatedGifTexture(url, engine));
            }
            scene.onBeforeRenderObservable.addOnce(() => {
                (0, BabylonImporter_1.LoadBabylonFilesAsync)(scene, activeSceneIndex, OnSceneDataLoadStartedCallback, OnSceneDataLoadProgressCallback, OnSceneDataLoadSuccessCallback);
            });
            return;
        }
        // Sinon, on l'ouvre normalement
        menuBtnsUI2D.rootContainer.isVisible = !isInXR;
        muteUI2D.rootContainer.isVisible = false;
        if (previousSceneIndex != activeSceneIndex) {
            LoadScene(activeSceneIndex);
            previousSceneIndex = activeSceneIndex;
            // Optimise la scène
            (0, PerfUtils_1.FreezeScene)(scene);
        }
    }
    /**
     * Appelée au début de l'import d'une scène .babylon
     * @param sceneData Les données de la scène à charger
     */
    function OnSceneDataLoadStartedCallback(started) {
        // Affiche l'ui de chargement
        isImporting = true;
        loadingUI2D.rootContainer.isVisible = !isInXR;
        const txt = {
            arg0: `${started.CurFileID}`,
            arg1: `${started.NbTotalFiles}`,
        };
        importText2D.Localize(txt);
    }
    /**
     * Appelée lors de la progression de l'import d'une scène .babylon
     * @param progress Etat de la progression
     */
    function OnSceneDataLoadProgressCallback(progress) {
        const progressText = Math.trunc(progress.loaded / progress.total * 100) + "%";
        progressText2D.text = progressText;
    }
    /**
     * Appelée à la fin de l'import d'une scène .babylon
     * @param succes Les données de l'import
     */
    function OnSceneDataLoadSuccessCallback(success) {
        // Ajoute les meshs de collision à la simulation XR (si elle existe)
        if (xrExp !== null) {
            for (let i = 0; i < success.BlockerMeshes.length; ++i) {
                xrExp.teleportation.addBlockerMesh(success.BlockerMeshes[i]);
            }
            for (let i = 0; i < success.FloorMeshes.length; ++i) {
                xrExp.teleportation.addFloorMesh(success.FloorMeshes[i]);
            }
        }
        //Crée les assets nécessaires pour chaque scène
        CreateSceneAssets(success);
        // Charge la scène
        curSceneIndex = success.SceneDataIndex;
        LoadScene(curSceneIndex);
        previousSceneIndex = curSceneIndex;
        // Place la caméra à son point de départ
        SetCameraPose(curSceneIndex);
        // Optimise la scène
        (0, PerfUtils_1.FreezeScene)(scene);
        // UIs
        isImporting = false;
        isInScene = true;
        isWelcomeOpen = true;
        loadingUI2D.rootContainer.isVisible = false;
        muteUI2D.rootContainer.isVisible = false;
        menuBtnsUI2D.rootContainer.isVisible = true;
        welcomeUI2D.rootContainer.isVisible = true;
        // Besoin d'un délai car le son ne se joue pas tt seul après le chargement de la scène
        setTimeout(function callbackFunction() { PlayWelcomeVoice(); }, 1000);
    }
    /**
     * Crée les assets complémentaires
     * @param succes Les données de l'import
     */
    function CreateSceneAssets(success) {
        //#region Skybox
        const skybox = (0, MeshBuilder_1.CreateSkybox)(success.SkyboxUrl, 200, scene);
        scene.ambientColor = new math_color_1.Color3(0.3, 0.3, 0.3);
        //scene.environmentTexture = CubeTexture.CreateFromPrefilteredData("textures/skybox/environment.env", scene);
        //#endregion
        //#region Ombres
        for (let i = 0; i < success.StaticRootMeshes.length; ++i) {
            const root = success.StaticRootMeshes[i];
            const children = root.getChildMeshes(false);
            success.DynamicLight.excludedMeshes.push(root);
            for (let j = 0; j < children.length; ++j) {
                const child = children[j];
                if (!success.StaticShadowReceivers.includes(child)) {
                    success.DynamicLight.excludedMeshes.push(child);
                }
            }
        }
        for (let i = 0; i < success.DynamicRootMeshes.length; ++i) {
            const root = success.DynamicRootMeshes[i];
            const children = root.getChildMeshes(false);
            success.StaticLight.excludedMeshes.push(root);
            for (let j = 0; j < children.length; ++j) {
                const child = children[j];
                success.StaticLight.excludedMeshes.push(child);
            }
        }
        for (let i = 0; i < success.ExcludedFromDynamicShadows.length; ++i) {
            success.DynamicLight.excludedMeshes.push(success.ExcludedFromDynamicShadows[i]);
        }
        const staticCSG = (0, SceneBuilder_1.CreateShadowGenerator)(2048, 0.2, success.StaticLight);
        const dynamicCSG = (0, SceneBuilder_1.CreateShadowGenerator)(1024, 0.7, success.DynamicLight);
        //#endregion
        //#region Téléporteurs
        const teleporterMeshes = [];
        for (let i = 0; i < success.TPMeshes.length; ++i) {
            const teleporterMat = (0, MeshBuilder_1.CreateStandardMaterial)("teleporterMat", true, Styles_1.Styles.teleportIconMaterialStyle, scene);
            teleporterMat.diffuseTexture = gifTeleporterTextures[i];
            teleporterMat.diffuseTexture.hasAlpha = true;
            const tp = (0, MeshBuilder_1.CreateTeleporter)(success.TPMeshes[i], Showrooms.TeleportersDatas[success.SceneDataIndex][i], teleporterMat, scene);
            teleporterMeshes.push(tp);
        }
        //#endregion
        //#region POI Info Buttons
        poiInfoMat.diffuseTexture = gifBtnTextures[0];
        poiInfoMat.diffuseTexture.hasAlpha = true;
        const poiPoses = success.POIPositions;
        Showrooms.POIPositions[success.SceneDataIndex] = poiPoses;
        const poiBtns = CreatePOIInfoButtons(success.SceneDataIndex, poiInfoMat, scene, OnPOIInfoBtnClick);
        //#endregion
        //#region GI Info Buttons
        giInfoMat.diffuseTexture = gifBtnTextures[1];
        giInfoMat.diffuseTexture.hasAlpha = true;
        const giPoses = success.GIPositions;
        Showrooms.GIPositions[success.SceneDataIndex] = giPoses;
        const giBtns = CreateGIInfoButtons(success.SceneDataIndex, giInfoMat, scene, OnGIInfoBtnClick);
        //#endregion
        //#region Autres boutons
        homeInfoMat.diffuseTexture = gifBtnTextures[2];
        homeInfoMat.diffuseTexture.hasAlpha = true;
        const homeBtn = CreateHomeButton(success.HomePosition, homeInfoMat, scene, OnWelcomeOpenBtnClick);
        //#endregion
        //#region Doublages
        const newVoices = GetVoicesForScene(success.SceneDataIndex, poiBtns.length, giBtns.length);
        voicesDict.add(newVoices);
        //#endregion
        //#region Enregistre les assets
        const newSceneAssets = new SceneAssets_1.SceneAssets(skybox, staticCSG, dynamicCSG, success.StaticRootMeshes, success.DynamicRootMeshes, success.ExcludedFromDynamicShadows, teleporterMeshes, poiBtns, giBtns, homeBtn);
        newSceneAssets.Disable();
        Showrooms.ScenesAssets[success.SceneDataIndex] = newSceneAssets;
        //#endregion
    }
    /**
     * Charge les voix des doublages des points d'information
     * @param sceneIndex La scène en cours de chargement
     * @param nbPOIs Le nombre de POIs à charger
     * @param nbGIs Le nombre de GIs à charger
     * @returns La liste des doublages et leurs IDs pour cette scène
     */
    function GetVoicesForScene(sceneIndex, nbPOIs, nbGIs) {
        const values = [];
        for (let i = 0; i < i18n_1.locales.length; i++) {
            const language = i18n_1.locales[i];
            // Ecran d'accueil
            let source = `audio/voices/Scene${sceneIndex}/Voice-EcranAcceuil-${language.toUpperCase()}.mp3`;
            let voice = (0, AudioBuilder_1.CreateSoundEffect)(source, false, 1, scene);
            values.push({ key: source, value: voice });
            // POIs et GIs
            for (let j = 0; j < nbPOIs; j++) {
                source = `audio/voices/Scene${sceneIndex}/poi/${language}/Voice-POI${j + 1}-${language.toUpperCase()}.mp3`;
                voice = (0, AudioBuilder_1.CreateSoundEffect)(source, false, 1, scene);
                values.push({ key: source, value: voice });
            }
            for (let j = 0; j < nbGIs; j++) {
                source = `audio/voices/Scene${sceneIndex}/gi/${language}/Voice-GI${j + 1}-${language.toUpperCase()}.mp3`;
                voice = (0, AudioBuilder_1.CreateSoundEffect)(source, false, 1, scene);
                values.push({ key: source, value: voice });
            }
        }
        return values;
    }
    /**
     * Ouvre la scène à l'index indiqué
     * @param sceneIndex L'index de la scène .babylon dans la liste
     */
    function LoadScene(sceneIndex) {
        for (let i = 0; i < Showrooms.AssetContainers[sceneIndex].length; ++i) {
            Showrooms.AssetContainers[sceneIndex][i].addAllToScene();
        }
        Showrooms.ScenesAssets[sceneIndex].Enable();
    }
    /**
     * Décharge la scène
     * @param sceneIndex L'ID de la scène renseignée
     */
    function UnloadScene(sceneIndex) {
        // Décharge la scène précédente
        Showrooms.ScenesAssets[sceneIndex].Disable();
        for (let i = 0; i < Showrooms.AssetContainers[sceneIndex].length; ++i) {
            Showrooms.AssetContainers[sceneIndex][i].removeAllFromScene();
        }
    }
    /**
     * Place la caméra à son point de départ
     * @param sceneIndex L'ID de la scène active
     */
    function SetCameraPose(sceneIndex) {
        mainCam.position.copyFrom(Showrooms.CameraOffsets[sceneIndex].Position);
        mainCam.rotation.copyFrom(Showrooms.CameraOffsets[sceneIndex].Rotation);
    }
    /**
     * Appelée quand on clique sur un des boutons de traduction
     * @param newLocale L'ID de la nouvelle langue
     */
    function Oni18nBtnClick(newLocale) {
        i18n_1.default.changeLanguage(newLocale);
        curLocaleID = i18n_1.locales.indexOf(i18n_1.default.language);
        // Traduction de tous les locales
        LocalizeI18nBtns(menuBtnsUI2D, Oni18nBtnClick);
        if (isWelcomeOpen) {
            LocalizeWelcomeUI2D(welcomeUI2D);
            PlayWelcomeVoice();
        }
        if (curPOIIndex >= 0) {
            DisplayCurPOIDescription(curSceneIndex, curPOIIndex, i18n_1.locales[curLocaleID], poiDescriptionsUI2D);
            PlayPOIVoice();
        }
        if (curGIIndex >= 0) {
            DisplayCurGIDescription(curSceneIndex, curGIIndex, i18n_1.locales[curLocaleID], giDescriptionsUI2D);
            PlayGIVoice();
        }
    }
    /**
     * Appelée quand on clique sur un des boutons d'info de POI "En savoir plus"
     * @param sceneIndex L'ID de la scène contenant le POI
     * @param poiIndex l'ID du point d'intérêt
     */
    function OnPOIInfoBtnClick(sceneIndex, poiIndex) {
        if (isWelcomeOpen || curPOIIndex == poiIndex) {
            return;
        }
        curGIIndex = -1;
        curPOIIndex = poiIndex;
        isInfoDescriptionOpen = true;
        poiDescriptionsUI2D.rootContainer.isVisible = true;
        giDescriptionsUI2D.rootContainer.isVisible = false;
        DisplayCurPOIDescription(sceneIndex, poiIndex, i18n_1.locales[curLocaleID], poiDescriptionsUI2D);
        PlayPOIVoice();
        menuBtnsUI2D.getControlByName("rect i18n btns").left = "-48.5%";
        menuBtnsUI2D.getControlByName("rect bas droite").left = "-38.5%";
    }
    /**
     * Appelée quand on clique sur un des boutons d'info de GI "Info générale"
     * @param sceneIndex L'ID de la scène contenant le GI
     * @param giIndex l'ID de l'info générale
     */
    function OnGIInfoBtnClick(sceneIndex, giIndex) {
        if (isWelcomeOpen || curGIIndex == giIndex) {
            return;
        }
        curPOIIndex = 1;
        curGIIndex = giIndex;
        isInfoDescriptionOpen = true;
        poiDescriptionsUI2D.rootContainer.isVisible = false;
        giDescriptionsUI2D.rootContainer.isVisible = true;
        DisplayCurGIDescription(sceneIndex, giIndex, i18n_1.locales[curLocaleID], giDescriptionsUI2D);
        PlayGIVoice();
        menuBtnsUI2D.getControlByName("rect i18n btns").left = "-48.5%";
        menuBtnsUI2D.getControlByName("rect bas droite").left = "-38.5%";
    }
    /**
     * Appelée quand on clique sur le bouton Fermer du panel de description d'un POI
     */
    function OnPOIDescriptionCloseBtnClick() {
        curPOIIndex = -1;
        isInfoDescriptionOpen = false;
        poiDescriptionsUI2D.rootContainer.isVisible = false;
        if (curVoice !== null && curVoice !== undefined) {
            curVoice.stop();
        }
        menuBtnsUI2D.getControlByName("rect i18n btns").leftInPixels = -500;
        menuBtnsUI2D.getControlByName("rect bas droite").leftInPixels = -40;
    }
    /**
     * Appelée quand on clique sur le bouton Fermer du panel de description d'un GI
     */
    function OnGIDescriptionCloseBtnClick() {
        curGIIndex = -1;
        isInfoDescriptionOpen = false;
        giDescriptionsUI2D.rootContainer.isVisible = false;
        if (curVoice !== null && curVoice !== undefined) {
            curVoice.stop();
        }
        menuBtnsUI2D.getControlByName("rect i18n btns").leftInPixels = -500;
        menuBtnsUI2D.getControlByName("rect bas droite").leftInPixels = -40;
    }
    /**
     * Appelée par le bouton de lecture de vidéo d'une POIDescription
     */
    function OnPOIDescriptionPlayVideoBtnClick() {
        bgm.stop();
        if (curVoice !== null && curVoice !== undefined) {
            curVoice.stop();
        }
        poiVideoPlayer.src = curPOIDescription.VideoInfo.VideoUrl;
        poiVideoPlayer.load();
        poiVideoPlayer.style.display = 'block';
        videoCloseBtn.style.display = 'block';
        scene.IsPaused = true;
    }
    /**
     * Appelée par le bouton d'ouverture de l'ui d'accueil
     */
    function OnWelcomeOpenBtnClick() {
        if (isWelcomeOpen || isInfoDescriptionOpen) {
            return;
        }
        isWelcomeOpen = true;
        welcomeUI2D.rootContainer.isVisible = true;
        // Joue le doublage de l'écran d'accueil
        PlayWelcomeVoice();
    }
    /**
     * Appelée par le bouton de fermeture de l'ui d'accueil
     */
    function OnWelcomeCloseBtnClick() {
        isWelcomeOpen = false;
        welcomeUI2D.rootContainer.isVisible = false;
        if (curVoice !== null && curVoice !== undefined) {
            curVoice.stop();
        }
    }
    /**
     * Arrête la voix actuelle de l'écran d'accueil et joue la nouvelle
     */
    function PlayWelcomeVoice() {
        if (curVoice !== null && curVoice !== undefined) {
            curVoice.stop();
        }
        const source = `audio/voices/Scene${curSceneIndex}/Voice-EcranAcceuil-${i18n_1.locales[curLocaleID].toUpperCase()}.mp3`;
        curVoice = voicesDict[source];
        if (!voiceIsMute) {
            curVoice.play();
        }
    }
    /**
     * Arrête le doublage du POI actuel et joue le nouveau
     */
    function PlayPOIVoice() {
        if (curVoice !== null && curVoice !== undefined) {
            curVoice.stop();
        }
        const language = i18n_1.locales[curLocaleID];
        const source = `audio/voices/Scene${curSceneIndex}/poi/${language}/Voice-POI${curPOIIndex + 1}-${language.toUpperCase()}.mp3`;
        curVoice = voicesDict[source];
        if (!voiceIsMute) {
            curVoice.play();
        }
    }
    /**
     * Arrête le doublage du GI actuel et joue le nouveau
     */
    function PlayGIVoice() {
        if (curVoice !== null && curVoice !== undefined) {
            curVoice.stop();
        }
        const language = i18n_1.locales[curLocaleID];
        const source = `audio/voices/Scene${curSceneIndex}/gi/${language}/Voice-GI${curGIIndex + 1}-${language.toUpperCase()}.mp3`;
        curVoice = voicesDict[source];
        if (!voiceIsMute) {
            curVoice.play();
        }
    }
    //#endregion
    //#region Tests
    //#endregion
    return scene;
}
exports.CreateShowroomsScene = CreateShowroomsScene;
//#region UI 2D
/**
 * Crée l'UI 2D pour couper la musique
 * @param scene La scène hôte
 * @param onMuteMusicBtnClick Appelée quand on clique sur le bouton
 * @returns L'interface 2D pour couper la musique
 */
function CreateMuteUI2D(isMuteByDefault, onMuteMusicBtnClick, onMuteVoiceBtnClick) {
    const parent = (0, UIBuilder_1.CreateFullscreenUI)();
    parent.idealWidth = 3840;
    parent.idealHeight = 2160;
    parent.useSmallestIdeal = true;
    parent.renderAtIdealSize = true;
    parent.parseFromURLAsync("textures/layouts/muteUI.json").then(() => {
        const muteMusicBtn = parent.getControlByName("muteMusicBtn");
        const muteMusicBtnImg = parent.getControlByName("muteMusicBtnImg");
        const muteVoiceBtn = parent.getControlByName("muteVoiceBtn");
        const muteVoiceBtnImg = parent.getControlByName("muteVoiceBtnImg");
        muteMusicBtn.onPointerClickObservable.add(() => onMuteMusicBtnClick());
        muteMusicBtnImg.source = isMuteByDefault ? "textures/ui/musicOff.png" : "textures/ui/musicOn.png";
        muteVoiceBtn.onPointerClickObservable.add(() => onMuteVoiceBtnClick());
        muteVoiceBtnImg.source = isMuteByDefault ? "textures/ui/Voice_OFF.png" : "textures/ui/Voice_ON.png";
    });
    return parent;
}
/**
 * Crée l'UI 2D de la carte du monde
 * @param scene La scène hôte
 * @param onLoadSceneDataBtnClick Appelée quand on clique sur le bouton de la carte du monde
 * @returns L'interface 2D de la carte du monde
 */
function CreateWorldMapUI2D(onLoadSceneDataBtnClick, onCloseBtnClick) {
    const parent = (0, UIBuilder_1.CreateFullscreenUI)();
    parent.idealWidth = 3840;
    parent.idealHeight = 2160;
    parent.useSmallestIdeal = true;
    parent.renderAtIdealSize = true;
    parent.parseFromURLAsync("textures/layouts/worldMapUI.json").then(() => {
        const logo = parent.getControlByName("logo");
        const map = parent.getControlByName("map");
        const rectCloseBtn = parent.getControlByName("rect close ui");
        const closeBtn = parent.getControlByName("closeBtn");
        const closeBtnImg = parent.getControlByName("closeBtnImg");
        const btns = parent.getControlByName("grid").getDescendants(true);
        logo.source = "textures/ui/logo_noir.png";
        map.source = "textures/ui/Carte.png";
        rectCloseBtn.isVisible = false;
        closeBtn.onPointerClickObservable.add(() => onCloseBtnClick());
        closeBtnImg.source = "textures/ui/Quit.png";
        for (let i = 0; i < btns.length; ++i) {
            const btn = btns[i];
            const text = btn.getChildByName("text");
            const rect = btn.getChildByName("rect");
            const ellipse = btn.getChildByName("ellipse");
            btn.onPointerClickObservable.add(() => onLoadSceneDataBtnClick(i));
            btn.shadowColor = "#00000029";
            rect.shadowColor = "#00000029";
            ellipse.shadowColor = "#00000029";
            // Button state animations
            btn.pointerEnterAnimation = (() => {
                btn.alpha = 1;
            });
            text.text = Showrooms.ShowroomNames[i];
            text.fontFamily = Styles_1.Styles.worldMap2DButtonTextBlockStyle.FontFamily;
            text.fontStyle = Styles_1.Styles.worldMap2DButtonTextBlockStyle.FontStyle;
            text.fontSize = Styles_1.Styles.worldMap2DButtonTextBlockStyle.FontSize;
            text.fontWeight = Styles_1.Styles.worldMap2DButtonTextBlockStyle.FontWeight;
            text.textHorizontalAlignment = Styles_1.Styles.worldMap2DButtonTextBlockStyle.TextHorizontalAlignment;
            text.textVerticalAlignment = Styles_1.Styles.worldMap2DButtonTextBlockStyle.TextVerticalAlignment;
        }
    });
    return parent;
}
/**
 * Crée l'UI 2D de l'écran de chargement
 * @param scene La scène hôte
 * @returns L'interface 2D ppale de la scène
 */
function CreateLoadingUI2D(scene) {
    const parent = (0, UIBuilder_1.CreateFullscreenUI)();
    parent.idealWidth = 3840;
    parent.idealHeight = 2160;
    parent.useSmallestIdeal = true;
    parent.renderAtIdealSize = false;
    parent.rootContainer.scaleX = 2.5;
    parent.rootContainer.scaleY = 2.5;
    (0, UIBuilder_1.CreateRectangle)(math_vector_1.Vector2.Zero(), Styles_1.Styles.loadingBackgroundRectangleStyle, parent.rootContainer);
    (0, UIBuilder_1.CreateTextBlockLocale)(new math_vector_1.Vector2(0, -75), 'common:importText', Styles_1.Styles.loadingTextBlockStyle, parent.rootContainer, "importText");
    (0, UIBuilder_1.CreateTextBlock)(math_vector_1.Vector2.Zero(), "", Styles_1.Styles.loadingTextBlockStyle, parent.rootContainer, "progressText");
    (0, UIBuilder_1.CreateLoadingRing)(8, 20, 50, 200, parent.rootContainer, scene);
    return parent;
}
/**
 * Crée l'UI 2D du menu de traduction
 * @param scene La scène hôte
 * @param onSetLocaleBtnClick Appelée quand on clique sur les boutons de traduction
 * @returns L'interface 2D ppale de la scène
 */
function CreateMenuButtonsUI2D(isMuteByDefault, onSetLocaleBtnClick, onOpenWorldMapBtnClick, onMuteMusicBtnClick, onMuteVoiceBtnClick) {
    const parent = (0, UIBuilder_1.CreateFullscreenUI)();
    parent.idealWidth = 3840;
    parent.idealHeight = 2160;
    parent.useSmallestIdeal = true;
    parent.renderAtIdealSize = true;
    parent.parseFromURLAsync("textures/layouts/menuBtnsUI.json").then(() => {
        //#region Components
        const logo = parent.getControlByName("logo");
        const openMapBtn = parent.getControlByName("openMapBtn");
        const openMapBtnImg = parent.getControlByName("openMapBtnImg");
        const muteMusicBtn = parent.getControlByName("muteMusicBtn");
        const muteMusicBtnImg = parent.getControlByName("muteMusicBtnImg");
        const muteVoiceBtn = parent.getControlByName("muteVoiceBtn");
        const muteVoiceBtnImg = parent.getControlByName("muteVoiceBtnImg");
        const inBtn = parent.getControlByName("inBtn");
        const inBtnImg = parent.getControlByName("inBtnImg");
        const ytBtn = parent.getControlByName("ytBtn");
        const ytBtnImg = parent.getControlByName("ytBtnImg");
        const contactBtn = parent.getControlByName("contactBtn");
        const contactBtnImg = parent.getControlByName("contactBtnImg");
        const rectLanguages = parent.getControlByName("rect i18n btns");
        const stackPanelLanguesV = rectLanguages.getChildByName("stackPanelLanguesV");
        //#endregion
        //#region Init
        // Logo
        logo.source = "textures/ui/logo_couleur.png";
        // Boutons rect bas droite
        openMapBtn.onPointerClickObservable.add(() => onOpenWorldMapBtnClick());
        openMapBtnImg.source = "textures/ui/Map.png";
        openMapBtnImg.shadowColor = "#00000029";
        muteMusicBtn.onPointerClickObservable.add(() => onMuteMusicBtnClick());
        muteMusicBtnImg.source = isMuteByDefault ? "textures/ui/musicOff.png" : "textures/ui/musicOn.png";
        muteMusicBtnImg.shadowColor = "#00000029";
        muteVoiceBtn.onPointerClickObservable.add(() => onMuteVoiceBtnClick());
        muteVoiceBtnImg.source = isMuteByDefault ? "textures/ui/Voice_OFF.png" : "textures/ui/Voice_ON.png";
        muteVoiceBtnImg.shadowColor = "#00000029";
        // Hyperliens
        inBtn.onPointerClickObservable.add(() => window.open("https://www.linkedin.com/company/equans-digital/posts/?feedView=all", "_other"));
        inBtnImg.source = "textures/ui/LinkedIn.png";
        inBtnImg.shadowColor = "#00000029";
        ytBtn.onPointerClickObservable.add(() => window.open("https://www.youtube.com/@equansdigital495", "_other"));
        ytBtnImg.source = "textures/ui/Youtube.png";
        ytBtnImg.shadowColor = "#00000029";
        contactBtn.onPointerClickObservable.add(() => window.open("https://www.equans-digital.com/contact", "_other"));
        contactBtnImg.source = "textures/ui/Contact.png";
        contactBtnImg.shadowColor = "#00000029";
        //#endregion
        //#region Boutons traduction
        LocalizeI18nBtns(parent, onSetLocaleBtnClick);
        // Le dernier bouton doit seulement afficher/masquer les autres boutons
        const btns = stackPanelLanguesV.getDescendants(true);
        const lastBtn = btns[btns.length - 1];
        const lastBtnImg = lastBtn.getChildByName("img");
        lastBtnImg.source = `textures/ui/${i18n_1.locales[curLocaleID]}.png`;
        lastBtn.onPointerClickObservable.add(() => {
            for (let i = 0; i < btns.length - 1; ++i) {
                const btn = btns[i];
                btn.isVisible = !btn.isVisible;
            }
        });
        for (let i = 0; i < btns.length; ++i) {
            const btn = btns[i];
            const btnImg = btn.getChildByName("img");
            btnImg.shadowColor = "#00000029";
        }
        //#endregion
        parent.rootContainer.isVisible = false;
    });
    return parent;
}
/**
 * Crée l'UI d'accueil au chargement d'une scène babylon
 * @param scene
 */
function CreateWelcomeUI2D(onWelcomeCloseBtnClick) {
    const parent = (0, UIBuilder_1.CreateFullscreenUI)();
    parent.idealWidth = 3840;
    parent.idealHeight = 2160;
    parent.useSmallestIdeal = true;
    parent.renderAtIdealSize = true;
    parent.parseFromURLAsync("textures/layouts/welcomeUI.json").then(() => {
        const closeBtn = parent.getControlByName("closeBtn");
        const closeBtnImg = parent.getControlByName("closeBtnImg");
        const icon = parent.getControlByName("icon");
        const textBlock0 = parent.getControlByName("textBlock0");
        const textBlock1 = parent.getControlByName("textBlock1");
        const textBlock2 = parent.getControlByName("textBlock2");
        const textBlock3 = parent.getControlByName("textBlock3");
        const textBlock4 = parent.getControlByName("textBlock4");
        const textBlock5 = parent.getControlByName("textBlock5");
        const textBlock6 = parent.getControlByName("textBlock6");
        const textBlock7 = parent.getControlByName("textBlock7");
        textBlock0.fontFamily = Styles_1.Styles.welcomeTitleBoldStyle.FontFamily;
        textBlock0.fontStyle = Styles_1.Styles.welcomeTitleBoldStyle.FontStyle;
        textBlock0.fontSize = Styles_1.Styles.welcomeTitleBoldStyle.FontSize;
        textBlock0.fontWeight = Styles_1.Styles.welcomeTitleBoldStyle.FontWeight;
        textBlock0.textHorizontalAlignment = Styles_1.Styles.welcomeTitleBoldStyle.TextHorizontalAlignment;
        textBlock0.textVerticalAlignment = Styles_1.Styles.welcomeTitleBoldStyle.TextVerticalAlignment;
        textBlock2.fontFamily = Styles_1.Styles.welcomeTextRegularUnderlineGreenStyle.FontFamily;
        textBlock2.fontStyle = Styles_1.Styles.welcomeTextRegularUnderlineGreenStyle.FontStyle;
        textBlock2.fontSize = Styles_1.Styles.welcomeTextRegularUnderlineGreenStyle.FontSize;
        textBlock2.fontWeight = Styles_1.Styles.welcomeTextRegularUnderlineGreenStyle.FontWeight;
        textBlock2.textHorizontalAlignment = Styles_1.Styles.welcomeTextRegularUnderlineGreenStyle.TextHorizontalAlignment;
        textBlock2.textVerticalAlignment = Styles_1.Styles.welcomeTextRegularUnderlineGreenStyle.TextVerticalAlignment;
        textBlock1.fontFamily = textBlock6.fontFamily = textBlock7.fontFamily = Styles_1.Styles.welcomeTextRegularGreenStyle.FontFamily;
        textBlock1.fontStyle = textBlock6.fontStyle = textBlock7.fontStyle = Styles_1.Styles.welcomeTextRegularGreenStyle.FontStyle;
        textBlock1.fontSize = textBlock6.fontSize = textBlock7.fontSize = Styles_1.Styles.welcomeTextRegularGreenStyle.FontSize;
        textBlock1.fontWeight = textBlock6.fontWeight = textBlock7.fontWeight = Styles_1.Styles.welcomeTextRegularGreenStyle.FontWeight;
        textBlock1.textHorizontalAlignment = textBlock6.textHorizontalAlignment = textBlock7.textHorizontalAlignment = Styles_1.Styles.welcomeTextRegularGreenStyle.TextHorizontalAlignment;
        textBlock1.textVerticalAlignment = textBlock6.textVerticalAlignment = textBlock7.textVerticalAlignment = Styles_1.Styles.welcomeTextRegularGreenStyle.TextVerticalAlignment;
        textBlock3.fontFamily = textBlock4.fontFamily = textBlock5.fontFamily = Styles_1.Styles.welcomeTextRegularGreenStyle.FontFamily;
        textBlock3.fontStyle = textBlock4.fontStyle = textBlock5.fontStyle = Styles_1.Styles.welcomeTextRegularGreenStyle.FontStyle;
        textBlock3.fontSize = textBlock4.fontSize = textBlock5.fontSize = Styles_1.Styles.welcomeTextRegularGreenStyle.FontSize;
        textBlock3.fontWeight = textBlock4.fontWeight = textBlock5.fontWeight = Styles_1.Styles.welcomeTextRegularGreenStyle.FontWeight;
        textBlock3.textHorizontalAlignment = textBlock4.textHorizontalAlignment = textBlock5.textHorizontalAlignment = Styles_1.Styles.welcomeTextRegularGreenStyle.TextHorizontalAlignment;
        textBlock3.textVerticalAlignment = textBlock4.textVerticalAlignment = textBlock5.textVerticalAlignment = Styles_1.Styles.welcomeTextRegularGreenStyle.TextVerticalAlignment;
        closeBtn.onPointerClickObservable.add(() => onWelcomeCloseBtnClick());
        closeBtnImg.source = "textures/ui/Quit.png";
        icon.source = "textures/ui/triptyque3.png";
        parent.rootContainer.isVisible = false;
    });
    return parent;
}
/**
 * Crée les boutons flottants de chaque POI pour chaque scène.
 * @param activeSceneIndex L'ID de la scène active
 * @param scene  La scène
 * @param onPOIInfoBtnClick L'action quand on clique sur le bouton
 */
function CreatePOIInfoButtons(activeSceneIndex, poiInfoMat, scene, onPOIInfoBtnClick) {
    const poiBtns = [];
    for (let i = 0; i < Showrooms.POIPositions[activeSceneIndex].length; ++i) {
        const pos = Showrooms.POIPositions[activeSceneIndex][i];
        const plane = (0, MeshBuilder_1.CreateQuadPlane)(pos, math_vector_1.Vector3.Zero(), poiInfoMat, Styles_1.Styles.poiInfoPlaneStyle, scene, `poiInfoPlane${i}`);
        plane.isPickable = true;
        plane.actionManager = new actionManager_1.ActionManager(scene);
        plane.actionManager.registerAction(new directActions_1.ExecuteCodeAction(actionManager_1.ActionManager.OnPickTrigger, function (e) {
            onPOIInfoBtnClick(activeSceneIndex, i);
        }));
        poiBtns.push(plane);
    }
    return poiBtns;
}
/**
 * Crée les boutons flottants de chaque GI pour chaque scène.
 * @param activeSceneIndex L'ID de la scène active
 * @param scene  La scène
 * @param onGIInfoBtnClick L'action quand on clique sur le bouton
 */
function CreateGIInfoButtons(activeSceneIndex, giInfoMat, scene, onGIInfoBtnClick) {
    const giBtns = [];
    for (let i = 0; i < Showrooms.GIPositions[activeSceneIndex].length; ++i) {
        const pos = Showrooms.GIPositions[activeSceneIndex][i];
        const plane = (0, MeshBuilder_1.CreateQuadPlane)(pos, math_vector_1.Vector3.Zero(), giInfoMat, Styles_1.Styles.poiInfoPlaneStyle, scene, `giInfoPlane${i}`);
        plane.isPickable = true;
        plane.actionManager = new actionManager_1.ActionManager(scene);
        plane.actionManager.registerAction(new directActions_1.ExecuteCodeAction(actionManager_1.ActionManager.OnPickTrigger, function (e) {
            onGIInfoBtnClick(activeSceneIndex, i);
        }));
        giBtns.push(plane);
    }
    return giBtns;
}
/**
 * Crée le bouton flottant d'accueil
 * @param activeSceneIndex L'ID de la scène active
 * @param scene  La scène
 * @param onGIInfoBtnClick L'action quand on clique sur le bouton
 */
function CreateHomeButton(pos, homeInfoMat, scene, onWelcomeOpenBtnClick) {
    const plane = (0, MeshBuilder_1.CreateQuadPlane)(pos, math_vector_1.Vector3.Zero(), homeInfoMat, Styles_1.Styles.poiInfoPlaneStyle, scene, 'homeInfoPlane');
    plane.isPickable = true;
    plane.actionManager = new actionManager_1.ActionManager(scene);
    plane.actionManager.registerAction(new directActions_1.ExecuteCodeAction(actionManager_1.ActionManager.OnPickTrigger, function (e) {
        onWelcomeOpenBtnClick();
    }));
    return plane;
}
/**
* Crée les panels flottants de l'intro et des descriptions de chaque POI.
* Celui des POI sera recyclé au lieu d'en créer un nouveau à chaque fois
* @param parent Le conteneur
* @param onCloseBtnClick L'action quand on clique sur le bouton Fermer
* @param onPlayVideoBtnClick L'action quand on clique sur le bouton Jouer
*/
function CreatePOIDescriptionPanel2D(onCloseBtnClick, onPlayVideoBtnClick) {
    const parent = (0, UIBuilder_1.CreateFullscreenUI)();
    parent.idealWidth = 3840;
    parent.idealHeight = 2160;
    parent.useSmallestIdeal = true;
    parent.renderAtIdealSize = true;
    parent.parseFromURLAsync("textures/layouts/poiDescUI.json").then(() => {
        const closeBtn = parent.getControlByName("closeBtn");
        const playVideoBtn = parent.getControlByName("playVideoBtn");
        const playBtnImg = parent.getControlByName("playBtnImg");
        const closeBtnImg = parent.getControlByName("closeBtnImg");
        const title = parent.getControlByName("title");
        const header = parent.getControlByName("header");
        const subTitle1 = parent.getControlByName("subTitle1");
        const subTitle2 = parent.getControlByName("subTitle2");
        const footNote = parent.getControlByName("footNote");
        const texts1 = parent.getControlByName("texts1").getDescendants();
        const texts2 = parent.getControlByName("texts2").getDescendants();
        // Première section
        for (let i = 0; i < texts1.length; ++i) {
            const t = texts1[i];
            if (i % 2 == 0) {
                t.fontFamily = Styles_1.Styles.poiTextItalicWhiteStyle.FontFamily;
                t.fontStyle = Styles_1.Styles.poiTextItalicWhiteStyle.FontStyle;
                t.fontSize = Styles_1.Styles.poiTextItalicWhiteStyle.FontSize;
                t.fontWeight = Styles_1.Styles.poiTextItalicWhiteStyle.FontWeight;
                t.textHorizontalAlignment = Styles_1.Styles.poiTextItalicWhiteStyle.TextHorizontalAlignment;
                t.textVerticalAlignment = Styles_1.Styles.poiTextItalicWhiteStyle.TextVerticalAlignment;
            }
            else {
                t.fontFamily = Styles_1.Styles.poiTextItalicGreyStyle.FontFamily;
                t.fontStyle = Styles_1.Styles.poiTextItalicGreyStyle.FontStyle;
                t.fontSize = Styles_1.Styles.poiTextItalicGreyStyle.FontSize;
                t.fontWeight = Styles_1.Styles.poiTextItalicGreyStyle.FontWeight;
                t.textHorizontalAlignment = Styles_1.Styles.poiTextItalicGreyStyle.TextHorizontalAlignment;
                t.textVerticalAlignment = Styles_1.Styles.poiTextItalicGreyStyle.TextVerticalAlignment;
            }
        }
        // Seconde section
        for (let i = 0; i < texts2.length; ++i) {
            const t = texts2[i];
            if (i % 2 == 0) {
                t.fontFamily = Styles_1.Styles.poiTextItalicWhiteStyle.FontFamily;
                t.fontStyle = Styles_1.Styles.poiTextItalicWhiteStyle.FontStyle;
                t.fontSize = Styles_1.Styles.poiTextItalicWhiteStyle.FontSize;
                t.fontWeight = Styles_1.Styles.poiTextItalicWhiteStyle.FontWeight;
                t.textHorizontalAlignment = Styles_1.Styles.poiTextItalicWhiteStyle.TextHorizontalAlignment;
                t.textVerticalAlignment = Styles_1.Styles.poiTextItalicWhiteStyle.TextVerticalAlignment;
            }
            else {
                t.fontFamily = Styles_1.Styles.poiTextItalicGreyStyle.FontFamily;
                t.fontStyle = Styles_1.Styles.poiTextItalicGreyStyle.FontStyle;
                t.fontSize = Styles_1.Styles.poiTextItalicGreyStyle.FontSize;
                t.fontWeight = Styles_1.Styles.poiTextItalicGreyStyle.FontWeight;
                t.textHorizontalAlignment = Styles_1.Styles.poiTextItalicGreyStyle.TextHorizontalAlignment;
                t.textVerticalAlignment = Styles_1.Styles.poiTextItalicGreyStyle.TextVerticalAlignment;
            }
        }
        playVideoBtn.onPointerClickObservable.add(() => onPlayVideoBtnClick());
        closeBtn.onPointerClickObservable.add(() => onCloseBtnClick());
        closeBtnImg.source = "textures/ui/Quit.png";
        playBtnImg.source = "textures/ui/Play.png";
        title.fontFamily = Styles_1.Styles.poiTitleBoldStyle.FontFamily;
        title.fontStyle = Styles_1.Styles.poiTitleBoldStyle.FontStyle;
        title.fontSize = Styles_1.Styles.poiTitleBoldStyle.FontSize;
        title.fontWeight = Styles_1.Styles.poiTitleBoldStyle.FontWeight;
        title.textHorizontalAlignment = Styles_1.Styles.poiTitleBoldStyle.TextHorizontalAlignment;
        title.textVerticalAlignment = Styles_1.Styles.poiTitleBoldStyle.TextVerticalAlignment;
        header.fontFamily = Styles_1.Styles.poiTextRegularGreenStyle.FontFamily;
        header.fontStyle = Styles_1.Styles.poiTextRegularGreenStyle.FontStyle;
        header.fontSize = Styles_1.Styles.poiTextRegularGreenStyle.FontSize;
        header.fontWeight = Styles_1.Styles.poiTextRegularGreenStyle.FontWeight;
        header.textHorizontalAlignment = Styles_1.Styles.poiTextRegularGreenStyle.TextHorizontalAlignment;
        header.textVerticalAlignment = Styles_1.Styles.poiTextRegularGreenStyle.TextVerticalAlignment;
        subTitle1.fontFamily = subTitle2.fontFamily = Styles_1.Styles.poiTextRegularUnderlineGreenStyle.FontFamily;
        subTitle1.fontStyle = subTitle2.fontStyle = Styles_1.Styles.poiTextRegularUnderlineGreenStyle.FontStyle;
        subTitle1.fontSize = subTitle2.fontSize = Styles_1.Styles.poiTextRegularUnderlineGreenStyle.FontSize;
        subTitle1.fontWeight = subTitle2.fontWeight = Styles_1.Styles.poiTextRegularUnderlineGreenStyle.FontWeight;
        subTitle1.textHorizontalAlignment = subTitle2.textHorizontalAlignment = Styles_1.Styles.poiTextRegularUnderlineGreenStyle.TextHorizontalAlignment;
        subTitle1.textVerticalAlignment = subTitle2.textVerticalAlignment = Styles_1.Styles.poiTextRegularUnderlineGreenStyle.TextVerticalAlignment;
        subTitle1.underline = subTitle2.underline = true;
        footNote.fontFamily = Styles_1.Styles.poiTextBoldItalicStyle.FontFamily;
        footNote.fontStyle = Styles_1.Styles.poiTextBoldItalicStyle.FontStyle;
        footNote.fontSize = Styles_1.Styles.poiTextBoldItalicStyle.FontSize;
        footNote.fontWeight = Styles_1.Styles.poiTextBoldItalicStyle.FontWeight;
        footNote.textHorizontalAlignment = Styles_1.Styles.poiTextBoldItalicStyle.TextHorizontalAlignment;
        footNote.textVerticalAlignment = Styles_1.Styles.poiTextBoldItalicStyle.TextVerticalAlignment;
        parent.rootContainer.isVisible = false;
    });
    return parent;
}
/**
* Crée les panels flottants de l'intro et des descriptions de chaque GI.
* Celui des GI sera recyclé au lieu d'en créer un nouveau à chaque fois
* @param parent Le conteneur
* @param onCloseBtnClick L'action quand on clique sur le bouton Fermer
*/
function CreateGIDescriptionPanel2D(onCloseBtnClick) {
    const parent = (0, UIBuilder_1.CreateFullscreenUI)();
    parent.idealWidth = 3840;
    parent.idealHeight = 2160;
    parent.useSmallestIdeal = true;
    parent.renderAtIdealSize = true;
    parent.parseFromURLAsync("textures/layouts/giDescUI.json").then(() => {
        const closeBtn = parent.getControlByName("closeBtn");
        const closeBtnImg = parent.getControlByName("closeBtnImg");
        const title = parent.getControlByName("title");
        const texts = parent.getControlByName("texts").getDescendants();
        // Première section
        for (let i = 0; i < texts.length; ++i) {
            const t = texts[i];
            if (i % 2 == 0) {
                t.fontFamily = Styles_1.Styles.poiTextItalicWhiteStyle.FontFamily;
                t.fontStyle = Styles_1.Styles.poiTextItalicWhiteStyle.FontStyle;
                t.fontSize = Styles_1.Styles.poiTextItalicWhiteStyle.FontSize;
                t.fontWeight = Styles_1.Styles.poiTextItalicWhiteStyle.FontWeight;
                t.textHorizontalAlignment = Styles_1.Styles.poiTextItalicWhiteStyle.TextHorizontalAlignment;
                t.textVerticalAlignment = Styles_1.Styles.poiTextItalicWhiteStyle.TextVerticalAlignment;
            }
            else {
                t.fontFamily = Styles_1.Styles.poiTextItalicGreyStyle.FontFamily;
                t.fontStyle = Styles_1.Styles.poiTextItalicGreyStyle.FontStyle;
                t.fontSize = Styles_1.Styles.poiTextItalicGreyStyle.FontSize;
                t.fontWeight = Styles_1.Styles.poiTextItalicGreyStyle.FontWeight;
                t.textHorizontalAlignment = Styles_1.Styles.poiTextItalicGreyStyle.TextHorizontalAlignment;
                t.textVerticalAlignment = Styles_1.Styles.poiTextItalicGreyStyle.TextVerticalAlignment;
            }
        }
        closeBtn.onPointerClickObservable.add(() => onCloseBtnClick());
        closeBtnImg.source = "textures/ui/Quit.png";
        title.fontFamily = Styles_1.Styles.poiTitleBoldStyle.FontFamily;
        title.fontStyle = Styles_1.Styles.poiTitleBoldStyle.FontStyle;
        title.fontSize = Styles_1.Styles.poiTitleBoldStyle.FontSize;
        title.fontWeight = Styles_1.Styles.poiTitleBoldStyle.FontWeight;
        title.textHorizontalAlignment = Styles_1.Styles.poiTitleBoldStyle.TextHorizontalAlignment;
        title.textVerticalAlignment = Styles_1.Styles.poiTitleBoldStyle.TextVerticalAlignment;
        parent.rootContainer.isVisible = false;
    });
    return parent;
}
/**
* Affiche la description du POI actif
* @param activeSceneIndex L'ID de la scène active
* @param poiIndex L'ID du point d'intérêt inspecté
* @param curLocaleID L'ID de la langue active
* @param parent Le conteneur
*/
function DisplayCurPOIDescription(activeSceneIndex, poiIndex, curLocale, parent) {
    curPOIDescription = (0, i18n_1.GetPOIDescriptions)(curLocale, activeSceneIndex, poiIndex);
    if (curPOIDescription === null) {
        (0, log_1.p)(`Erreur : Aucune POIDescription n'existe pour la scène ${activeSceneIndex}, POI n°${poiIndex}`);
        return;
    }
    const scrollViewer = parent.getControlByName("scrollViewer");
    const icon = parent.getControlByName("icon");
    const poiImg = parent.getControlByName("poiImg");
    const title = parent.getControlByName("title");
    const header = parent.getControlByName("header");
    const subTitle1 = parent.getControlByName("subTitle1");
    const subTitle2 = parent.getControlByName("subTitle2");
    const footNote = parent.getControlByName("footNote");
    const playVideoBtn = parent.getControlByName("playVideoBtn");
    const thumbnailImg = parent.getControlByName("thumbnailImg");
    const texts1 = parent.getControlByName("texts1").getDescendants();
    const texts2 = parent.getControlByName("texts2").getDescendants();
    const images2 = parent.getControlByName("images2").getDescendants();
    // Première section
    var length = curPOIDescription.Texts1 === null ? 0 : Math.min(texts1.length, curPOIDescription.Texts1.length);
    for (let i = 0; i < length; ++i) {
        const t = texts1[i];
        t.isVisible = true;
        t.text = curPOIDescription.Texts1[i];
    }
    for (let i = length; i < texts1.length; ++i) {
        const t = texts1[i];
        t.isVisible = false;
    }
    // Seconde section
    length = curPOIDescription.Texts2 === null ? 0 : Math.min(texts2.length, curPOIDescription.Texts2.length);
    for (let i = 0; i < length; ++i) {
        const t = texts2[i];
        t.isVisible = true;
        t.text = curPOIDescription.Texts2[i];
    }
    for (let i = length; i < texts2.length; ++i) {
        const t = texts2[i];
        t.isVisible = false;
    }
    // Images
    length = curPOIDescription.Images2 === null ? 0 : Math.min(images2.length, curPOIDescription.Images2.length);
    for (let i = 0; i < length; ++i) {
        const data = curPOIDescription.Images2[i];
        const img = images2[i];
        img.isVisible = true;
        img.source = data.Source;
        img.widthInPixels = data.WidthInPixels;
        img.heightInPixels = data.HeightInPixels;
    }
    for (let i = length; i < images2.length; ++i) {
        const img = images2[i];
        img.isVisible = false;
    }
    // Autres textes
    scrollViewer.verticalBar.value = 0;
    icon.source = `textures/ui/triptyque${poiIndex}.png`;
    title.text = curPOIDescription.Title;
    header.isVisible = curPOIDescription.Header !== null && curPOIDescription.Header != "";
    header.text = header.isVisible ? curPOIDescription.Header : "";
    subTitle1.isVisible = curPOIDescription.Subtitle1 !== null && curPOIDescription.Subtitle1 != "";
    subTitle1.text = subTitle1.isVisible ? curPOIDescription.Subtitle1 : "";
    subTitle2.isVisible = curPOIDescription.Subtitle2 !== null && curPOIDescription.Subtitle2 != "";
    subTitle2.text = subTitle2.isVisible ? curPOIDescription.Subtitle2 : "";
    footNote.isVisible = curPOIDescription.Footnote !== null && curPOIDescription.Footnote != "";
    footNote.text = footNote.isVisible ? curPOIDescription.Footnote : "";
    // Image
    if (curPOIDescription.ImageSourceAndSize === null) {
        poiImg.isVisible = false;
    }
    else {
        poiImg.isVisible = true;
        poiImg.source = curPOIDescription.ImageSourceAndSize.Source;
        poiImg.widthInPixels = curPOIDescription.ImageSourceAndSize.WidthInPixels;
        poiImg.heightInPixels = curPOIDescription.ImageSourceAndSize.HeightInPixels;
    }
    // Video
    if (curPOIDescription.VideoInfo === null) {
        playVideoBtn.isVisible = false;
    }
    else {
        playVideoBtn.isVisible = true;
        thumbnailImg.source = curPOIDescription.VideoInfo.ThumbnailUrl;
    }
}
/**
* Affiche la description du GI actif
* @param activeSceneIndex L'ID de la scène active
* @param giIndex L'ID de l'information générale inspectéé
* @param curLocaleID L'ID de la langue active
* @param parent Le conteneur
*/
function DisplayCurGIDescription(activeSceneIndex, giIndex, curLocale, parent) {
    curGIDescription = (0, i18n_1.GetGIDescriptions)(curLocale, activeSceneIndex, giIndex);
    if (curGIDescription === null) {
        (0, log_1.p)(`Erreur : Aucune GIDescription n'existe pour la scène ${activeSceneIndex}, GI n°${giIndex}`);
        return;
    }
    const scrollViewer = parent.getControlByName("scrollViewer");
    const icon = parent.getControlByName("icon");
    const title = parent.getControlByName("title");
    const texts = parent.getControlByName("texts").getDescendants();
    const images = parent.getControlByName("images").getDescendants();
    scrollViewer.verticalBar.value = 0;
    icon.source = `textures/ui/triptyque${giIndex}.png`;
    title.text = curGIDescription.Title;
    // Textes
    let length = curGIDescription.Texts === null ? 0 : Math.min(texts.length, curGIDescription.Texts.length);
    for (let i = 0; i < length; ++i) {
        const t = texts[i];
        t.isVisible = true;
        t.text = curGIDescription.Texts[i];
    }
    for (let i = length; i < texts.length; ++i) {
        const t = texts[i];
        t.isVisible = false;
    }
    // Images
    length = curGIDescription.ImagesSourcesAndSizes === null ? 0 : Math.min(images.length, curGIDescription.ImagesSourcesAndSizes.length);
    for (let i = 0; i < length; ++i) {
        const data = curGIDescription.ImagesSourcesAndSizes[i];
        const img = images[i];
        img.isVisible = true;
        img.source = data.Source;
        img.widthInPixels = data.WidthInPixels;
        img.heightInPixels = data.HeightInPixels;
    }
    for (let i = length; i < images.length; ++i) {
        const img = images[i];
        img.isVisible = false;
    }
}
/**
 * Initialise les boutons de traduction pour s'assurer
 * qu'ils aient toujours la bonne icône et fonction
 * @param parent L'UI
 * @param oni18nBtnClick L'action des boutons de traduction
 */
function LocalizeI18nBtns(parent, oni18nBtnClick) {
    const rectLanguages = parent.getControlByName("rect i18n btns");
    const stackPanelLanguesV = rectLanguages.getChildByName("stackPanelLanguesV");
    const btns = stackPanelLanguesV.getDescendants(true);
    const localesCopy = [...i18n_1.locales];
    const curLocale = i18n_1.locales[curLocaleID];
    for (let i = 0; i < btns.length - 1; ++i) {
        const btn = btns[i];
        const btnImg = btn.getChildByName("img");
        btn.isVisible = false;
        btn.onPointerClickObservable.clear();
        // Détermine la langue associée à ce bouton
        for (let j = 0; j < localesCopy.length; ++j) {
            const locale = localesCopy[j];
            if (locale != curLocale) {
                btnImg.source = `textures/ui/${locale}.png`;
                btn.onPointerClickObservable.add(() => {
                    oni18nBtnClick(locale);
                    for (let k = 0; k < btns.length - 1; ++k) {
                        btns[k].isVisible = false;
                    }
                });
                localesCopy.splice(j, 1);
                break;
            }
        }
    }
    // Le dernier bouton affiche la langue actuelle
    const lastBtn = btns[btns.length - 1];
    const lastBtnImg = lastBtn.getChildByName("img");
    lastBtnImg.source = `textures/ui/${curLocale}.png`;
}
/**
 * Traduit l'écran de bienvenue
 * @param parent L'UI
 */
function LocalizeWelcomeUI2D(parent) {
    const textBlock0 = parent.getControlByName("textBlock0");
    const textBlock1 = parent.getControlByName("textBlock1");
    const textBlock2 = parent.getControlByName("textBlock2");
    const textBlock3 = parent.getControlByName("textBlock3");
    const textBlock4 = parent.getControlByName("textBlock4");
    const textBlock5 = parent.getControlByName("textBlock5");
    const textBlock6 = parent.getControlByName("textBlock6");
    const textBlock7 = parent.getControlByName("textBlock7");
    textBlock0.text = i18n_1.default.t('common:welcomeUI0');
    textBlock1.text = i18n_1.default.t('common:welcomeUI1');
    textBlock2.text = i18n_1.default.t('common:welcomeUI2');
    textBlock3.text = i18n_1.default.t('common:welcomeUI3');
    textBlock4.text = i18n_1.default.t('common:welcomeUI4');
    textBlock5.text = i18n_1.default.t('common:welcomeUI5');
    textBlock6.text = i18n_1.default.t('common:welcomeUI6');
    textBlock7.text = i18n_1.default.t('common:welcomeUI7');
}
//#endregion
//#region UI 3D
// /**
//  * Crée l'UI 3D de la carte du monde
//  * @param scene La scène hôte
//  * @param onLoadSceneDataBtnClick Appelée quand on clique sur le bouton de la carte du monde
//  * @returns L'interface 2D de la carte du monde
//  */
// function CreateWorldMapUI3D(scene: Scene,
//     onLoadSceneDataBtnClick: (activeSceneIndex: number) => void, 
//     onCloseBtnClick: Function): GUI3DManager
// {
//     // Crée l'HolographicSlate
//     const manager = GUI3DBuilder.CreateGUI3DManager(scene);
//     const slate = GUI3DBuilder.CreateHolographicSlate(Styles.worldMapSlateStyle, manager.rootContainer, "worldMapSlate");
//     const grid = UIBuilder.CreateGrid(Vector2.Zero(), Styles.gridSlateStyle, undefined, "Grid");
//     slate.content = grid;
//     // Image de la carte du monde
//     UIBuilder.CreateImage(Vector2.Zero(), "textures/ui/worldMap.jpg", Styles.defaultFullscreenImageStyle, grid);
//     //#region Bouton Fermer
//     UIBuilder.CreateImageOnlyButton
//         (
//             Vector2.Zero(), Styles.worldMap3DCloseButtonStyle, grid,
//             function() { onCloseBtnClick(); },
//             "../../../textures/ui/Quit.png", "CloseButton"
//         ).isVisible = false;
//     //#endregion
//     //#region Pour chaque scène .babylon, crée un bouton pour changer de scène
//     for (let index = 0; index < WorldMapButtons.length; index++) 
//     {
//         const sceneData = WorldMapButtons[index];
//         UIBuilder.CreateButton
//         (
//             sceneData.Position, sceneData.SceneName, Styles.worldMap3DSelectButtonStyle, grid,
//             function() 
//             { 
//                 onLoadSceneDataBtnClick(index);
//             }
//         );
//     }
//     //#endregion
//     return manager;
// }
// /**
//  * Crée l'UI 2D de l'écran de chargement
//  * @param scene La scène hôte
//  * @returns L'interface 2D ppale de la scène
//  */
// function CreateLoadingUI3D(scene: Scene): GUI3DManager
// {
//     // Crée l'HolographicSlate
//     const manager = GUI3DBuilder.CreateGUI3DManager(scene);
//     const slate = GUI3DBuilder.CreateHolographicSlate(Styles.loadingSlateStyle, manager.rootContainer, "loadingSlate");
//     const grid = UIBuilder.CreateGrid(Vector2.Zero(), Styles.gridSlateStyle, undefined, "Grid");
//     slate.content = grid;
//     // Crée l'écran de chargement
//     UIBuilder.CreateRectangle(Vector2.Zero(), Styles.loadingBackgroundRectangleStyle, grid);
//     UIBuilder.CreateTextBlockLocale(new Vector2(0, -50), 'common:importText', Styles.loadingTextBlockStyle, grid, "importText");
//     UIBuilder.CreateTextBlock(new Vector2(0, 25), "lol", Styles.loadingTextBlockStyle, grid, "progressText");
//     UIBuilder.CreateLoadingRing(8, 20, 50, 150, grid, scene);
//     return manager;
// }
// /**
//  * Crée l'UI 3D du menu de traduction
//  * @param scene La scène hôte
//  * @param onSetLocaleBtnClick Appelée quand on clique sur les boutons de traduction
//  * @returns L'interface 3D ppale de la scène
//  */
// function CreateMenuButtonsUI3D(scene: Scene, 
//     onSetLocaleBtnClick: (localeID: string) => void,
//     onOpenWorldMapBtnClick: Function): GUI3DManager
// {
//     // Crée le menu main
//     const manager = GUI3DBuilder.CreateGUI3DManager(scene);
//     const handMenu = GUI3DBuilder.CreateHandMenu(xrExp.baseExperience, manager.rootContainer, "menuBtnsHandMenu");
//     //#region Boutons d'hyperlien
//     const b1 = GUI3DBuilder.CreateHyperlinkTouchHoloraphicButton(
//         "https://fr.linkedin.com/company/sxdgroupe", 
//         "_other",
//         "../../../textures/ui/LinkedIn.png");
//     const b2 = GUI3DBuilder.CreateHyperlinkTouchHoloraphicButton(
//         "https://www.youtube.com/@equansdigital495", 
//         "_other",
//         "../../../textures/ui/Youtube.png");
//     const b3 = GUI3DBuilder.CreateHyperlinkTouchHoloraphicButton(
//         "https://www.equans.fr/contact", 
//         "_other",
//         "../../../textures/ui/Contact.png");
//     handMenu.addButton(b1);
//     handMenu.addButton(b2);
//     handMenu.addButton(b3);
//     //#endregion
//     //#region Bouton Ouvrir la carte
//     const b4 = GUI3DBuilder.CreateImageOnlyTouchHoloraphicButton
//         (
//             "../../../textures/ui/Map.png",
//             function() { onOpenWorldMapBtnClick(); },
//         );
//     handMenu.addButton(b4);
//     //#endregion
//     //#region Bouton de traduction
//     const b5 = GUI3DBuilder.CreateImageOnlyTouchHoloraphicButton
//         (
//             `textures/ui/${locales[curLocaleID]}.png`,
//             function() 
//             { 
//                 curLocaleID++;
//                 curLocaleID %= locales.length;
//                 b5.imageUrl = `textures/ui/${locales[curLocaleID]}.png`;
//                 onSetLocaleBtnClick(locales[curLocaleID]);
//             },
//         );
//     handMenu.addButton(b5);
//     //#endregion
//     return manager;
// }
// /**
//  * Récupère un Control2D du type renseigné dans un HolographicSlate
//  * @param gui3DManager Le parent racine
//  * @param slateName Le nom de l'HolographicSlate
//  * @param controlName Le nom du contrôle 2D
//  * @returns Le contrôle 2D
//  */
// function GetControl2DInSlate<T extends Control>(gui3DManager: GUI3DManager, slateName: string, controlName: string): T
// {
//     return (gui3DManager.rootContainer.children.find(obj => obj.name == slateName) as HolographicSlate)
//             .content.getDescendants(false, obj => obj.name == controlName)[0] as T;
// }
//#endregion


/***/ }),

/***/ 42452:
/*!*******************************************!*\
  !*** ./src/viewModels/utils/PerfUtils.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


//#region  Imports
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FreezeMesh = exports.UnfreezeScene = exports.FreezeScene = exports.CreateSceneOptimizer = exports.OptimiseEngine = exports.CreateEngine = void 0;
const engine_1 = __webpack_require__(/*! @babylonjs/core/Engines/engine */ 93856);
const abstractMesh_1 = __webpack_require__(/*! @babylonjs/core/Meshes/abstractMesh */ 35985);
const sceneOptimizer_1 = __webpack_require__(/*! @babylonjs/core/Misc/sceneOptimizer */ 41546);
const scene_1 = __webpack_require__(/*! @babylonjs/core/scene */ 78480);
//#endregion
//#region  Optimization
/**
 * Optimise le moteur
 * @param engine Le moteur de Babylon
 */
function CreateEngine(canvas, antialias, options) {
    const e = new engine_1.Engine(canvas, antialias, options);
    e.enableOfflineSupport = false;
    e.doNotHandleContextLost = true;
    return e;
}
exports.CreateEngine = CreateEngine;
/**
 * Optimise le moteur
 * @param engine Le moteur de Babylon
 */
function OptimiseEngine(engine) {
    engine.enableOfflineSupport = false;
    engine.doNotHandleContextLost = true;
}
exports.OptimiseEngine = OptimiseEngine;
/**
 * Lance un optimiseur en parallèle qui va progressivement diminuer
 * la qualité de rendu de la scène
 * @param scene La scène à optimsier
 * @returns l'optimiseur, à lancer manuellement
 */
function CreateSceneOptimizer(scene) {
    var options = new sceneOptimizer_1.SceneOptimizerOptions(60, 500);
    //options.addOptimization(new HardwareScalingOptimization(0, 1));
    options.addOptimization(new sceneOptimizer_1.MergeMeshesOptimization());
    options.addOptimization(new sceneOptimizer_1.TextureOptimization()); // Fait baver les ombres, apparemment ?
    options.addOptimization(new sceneOptimizer_1.PostProcessesOptimization());
    return new sceneOptimizer_1.SceneOptimizer(scene, options, true, false);
    // return new SceneOptimizer(scene, SceneOptimizerOptions.LowDegradationAllowed(), true, false);
}
exports.CreateSceneOptimizer = CreateSceneOptimizer;
/**
 * Marque la scène comme étant statique
 * pour gagner en performance
 * @param scene La scène à optimiser
 */
function FreezeScene(scene) {
    //scene.clearCachedVertexData();
    scene.cleanCachedTextureBuffer();
    //scene.freezeActiveMeshes();   // Bloque les téléporteurs
    scene.freezeMaterials();
    scene.blockMaterialDirtyMechanism = true;
    scene.autoClearDepthAndStencil = false;
    scene.blockMaterialDirtyMechanism = true;
    scene.performancePriority = scene_1.ScenePerformancePriority.Aggressive; // Si la scène disparaît au chargement d'une nouvelle scène, utiliser Intermediate
    scene.renderingManager.maintainStateBetweenFrames = true; // Pour que les skyboxes puissent à nouveau s'afficher si elles sont masquées
    // Activer manuellement les bools suivants si on remet la performancePriority par défaut
    //scene.skipPointerMovePicking = true;    
    //scene.skipFrustumClipping = true;
    //scene.autoClear = false; //A n'utiliser que si le viewport affiche toujours une géométrie opaque (par ex: si on est dans une skybox)
}
exports.FreezeScene = FreezeScene;
/**
 * Marque la scène comme étant dynamique
 * @param scene La scène à optimiser
 */
function UnfreezeScene(scene) {
    scene.unfreezeActiveMeshes();
    scene.unfreezeMaterials();
}
exports.UnfreezeScene = UnfreezeScene;
/**
 * Marque le Mesh comme étant statique
 * pour gagner en performance
 * @param scene Le mesh à optimiser
 */
function FreezeMesh(mesh, checkCollisions = false, isVisible = true, receiveShadows = true, backFaceCulling = true) {
    mesh.checkCollisions = checkCollisions;
    mesh.receiveShadows = receiveShadows;
    mesh.isVisible = isVisible;
    mesh.alwaysSelectAsActiveMesh = isVisible;
    mesh.isPickable = false;
    mesh.doNotSyncBoundingInfo = !checkCollisions;
    mesh.freezeWorldMatrix();
    mesh.cullingStrategy = abstractMesh_1.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
    if (mesh.material) {
        mesh.material.backFaceCulling = backFaceCulling /*&& (mesh.material.transparencyMode == 0 || mesh.material.transparencyMode == 2)*/;
        mesh.material.freeze();
    }
}
exports.FreezeMesh = FreezeMesh;
//#endregion


/***/ }),

/***/ 71438:
/*!*************************************!*\
  !*** ./src/viewModels/utils/log.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.p = void 0;
/**
 * Raccourcit console.log
 * @param message Le message à afficher dans la console
 */
function p(message) {
    console.log(message);
}
exports.p = p;


/***/ }),

/***/ 27964:
/*!*******************************!*\
  !*** ./locales/en/audio.json ***!
  \*******************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"audio1":"../audio/en/video1.mp3"}');

/***/ }),

/***/ 89851:
/*!********************************!*\
  !*** ./locales/en/common.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"loadingHTML":"Loading...","name":"John","welcome":"Welcome, {{name}}!","importText":"Importing {{arg0}}...","importTextOld":"Importing... ({{arg0}}/{{arg1}})","closeBtnText":"Close","openBtnText":"Open the world map","poiInfoBtnText":"Learn more","welcomeUI0":"Welcome to the Equans Digital Industrie 4.0 showroom!","welcomeUI1":"This showroom is a real place of design, innovation and demonstration of our know-how to our customers, and its aim is to be the focal point of Industry 4.0 in France.","welcomeUI2":"It has several missions:","welcomeUI3":"- Supporting manufacturers by bringing together a wide range of expertise","welcomeUI4":"- Present robotic islands and Industry 4.0 use cases in real-life situations","welcomeUI5":"- Co-constructing with manufacturers and developing tailor-made solutions based on our standard solutions","welcomeUI6":"Equans Digital has created a veritable ecosystem of experts and players to provide the best possible support for the reindustrialisation of France.","welcomeUI7":"Enjoy your discovery!"}');

/***/ }),

/***/ 40041:
/*!****************************************!*\
  !*** ./locales/en/giDescriptions.json ***!
  \****************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"DescriptionsPerScene":[{"Descriptions":[{"Title":"R&D Room","ImagesSourcesAndSizes":[{"Source":"images/Montargis/gi/bureau d\'études.jpg","WidthInPixels":500,"HeightInPixels":300},{"Source":"images/Montargis/gi/ENGIE-contexte-1.jpg","WidthInPixels":450,"HeightInPixels":300}],"Texts":["Through this open space, Equans Digital aims to create a strong ecosystem and a true national community around the theme of Industry 4.0.","   - A place for creation and interactions with industrial players and startups, research centers, and our clients.\\n - A location for applied research to develop innovative solutions in co-development with companies for the design and manufacturing of standard solutions.\\n - A production site to respond to our clients\' requests.\\n - Testing and preparation for commissioning.","By bringing together and facilitating exchanges among various stakeholders, this space encourages co-construction and cross-learning."]}]}]}');

/***/ }),

/***/ 71108:
/*!********************************!*\
  !*** ./locales/en/images.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"image_s1p1":"../../images/Montargis/1.jpg","image_s1p2":"../../images/Montargis/2.jpg","image_s1p3":"../../images/Montargis/3.jpg","image_s1p4":"../../images/Montargis/4.jpg","image_s1p5":"../../images/Montargis/5.jpg","image_s1p6":"../../images/Montargis/6.jpg","image_s1p7":"../../images/Montargis/7.jpg"}');

/***/ }),

/***/ 42805:
/*!*****************************************!*\
  !*** ./locales/en/poiDescriptions.json ***!
  \*****************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"DescriptionsPerScene":[{"Descriptions":[{"Title":"Palet’Ease, palletizing and depalletizing solution","Header":"The solution meets the need to place parcels on a pallet (palletizing) or, conversely, to remove parcels from a pallet (depal letizing).","Subtitle1":"Operating principle:","Subtitle2":"The major benefits of this solution:","Footnote":"From a safety point of view, this solution is certified by an approved inspection body: Bureau Veritas.","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/1 - PALETEASE/paletease en.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Palet\'Ease.jpg"},"Texts1":["In palletizing mode, parcels arrive from a production unit on a conveyor. They must be placed on a pallet according to a pre-established order and position (palletizing plan).","In depalletizing mode, parcels arrive stacked on a pallet. They need to be unpacked and placed onto a conveyor for transfer to a processing line (package opening, placing in stock, etc.). The palletization plan may or may not be pre-defined. Packs are usually of uniform and consistent dimensions. Packaging is generally in closed cardboard boxes, but can also include other types (plastic bags, totes, etc.).\\nThe machine is self-contained.","The machine can be used for palletizing or depalletizing.\\nThe robot and its gripper will be adapted to the type of container, its weight and the sizes of the pallets.\\nWe offer EQUANS software for creating palletizing plans, adaptable to the characteristics of the packages.","For the depalletizing mode, we propose adding a 3D sensor on the gripper to position the handling of packages on the pallet.","The machine is on a mobile chassis that can be moved and transported.\\nVarious standard models are available to meet product, speed and environmental constraints."],"Texts2":["- Reduced operator fatigue and MSDs (Musculoskeletal Disorders): elimination of carrying heavy loads and repetitive body movements.","- Reduced risk of workplace accidents, as the operator no longer has to handle parcels (e.g., hand cuts, risk of weight falling on feet)","- Increased reliability of palletizing/depalletizing operations, leading to better quality and potentially increased line output. (quality) and potential increase in line output."]},{"Title":"Artificial Intelligence - Computer Vision ​","Header":"Detection of pictograms on logistics cartons, in real-time during their movement on a conveyor, in order to categorize them.\\nThe pictograms detected are :\\n-    Fragile cardboard​​,\\n-    Moisture-sensitive carton ​,\\n-    Handle with care carton ​,\\n-    Flammable cardboard​.","Subtitle1":"Operating principle:","Subtitle2":"The major benefits of this solution:","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/6 - Computer vision IA fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Computer vision.jpg"},"Texts1":["The pictograms can be located on the left or right sides, the front or back of the box, at any position. The pictograms can be of different sizes, colors and have a wide range of representations.","The solution is a Computer Vision Artificial Intelligence solution,  with stereo capabilities,  incorporating bi-directional OPC UA communication. It is an End-to-end solution that includes : ","-    Dataset creation​,\\n-    Labelling​,\\n-    Training, testing and performance improvement (detection and recognition)​,\\n-    Stereo synchronization (two cameras)​,\\n-    Industrial communication via OPC UA (client).","Assembled in Python language (ver 3.9) incorporating Open Source components.​"],"Texts2":["-    Provides the capability to detect and recognize any  type of object, defects, features, etc.​","-    Enables the detection and recognition of moving objects while they are moving, in real-time.","-    Increases the efficiency of human-performed inspections (reliability, analysis speed, etc.),​","-    Integration with alert systems, traceability solutions, CMMS, industrial process (command control) and robotics solutions, etc.​","-    Reduces Fatigue removes non-value-added tasks and redirects people to more interesting tasks​","-    The system can be implemented to operate with both visible and invisible wavelengths​","-    Can be ‘generalized’ in terms of appearance, location, size, etc.​"]},{"Title":"Depack’Ease, depacking solution​","Header":"The solution meets the need to open cardboard boxes.","Subtitle1":"Operating principle:","Subtitle2":"The major benefits of this solution:","Footnote":"From a safety point of view, this solution is certified by an approved inspection body: Bureau Veritas.","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/2 - DEPACKEASE/depackease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Depack\'Ease.jpg"},"Texts1":["Parcels arrive on a conveyor, from a depalletising unit for example. They need to be opened from the top to allow the parts inside to be removed.","Packages come in different sizes. Packaging is generally in glued or taped cardboard boxes.​\\nThe machine is self-contained.​","The machine measures each box individually, using 3 sensors (length, width and height). The robot and its gripper are adapted to the type of cartons. The gripper is fitted with a cutting blade that is highly resistant to abrasion. The robot moves around the board to cut it on all 4 sides.","The cutting depth and height in relation to the top of the carton can be adjusted via the HMI (Human-Machine Interface). The solution can be coupled with a parcel code reader,  incorporating a code characterizing these cutting settings.​","Based on the production rate, a second conveyor track can be used to alternate the die-cuts on either side of the robot foot.​\\nUA system for removing the top of the packages is possible by adding a manipulator at the exit of the cutting station.\\nA specific version of this solution is available for opening bottle blisters.​"],"Texts2":["-     Reduction in operator fatigue and MSDs (Musculoskeletal Disorders): elimination of the need to carry heavy loads and repetitive body movements​","-     Reduced risk of workplace accidents, especially those associated with the use of cutters that can cause hand injuries. ","-     Increased reliability of cutting operations to avoid damaging the product inside (quality) and potential increase in line speed.​"]},{"Title":"Heterogeneous palletization​","Header":"The solution meets the need for multi-format parcel pallets.​","Subtitle1":"Operating principle:","Subtitle2":"The major benefits of this solution:","Footnote":"From a safety point of view, this solution is certified by an approved inspection body: Bureau Veritas.","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/4 - Palettisation hétérogène fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Palettisation hétérogène.jpg"},"Texts1":["-    Calculation algorithm for palletizing plan according to customizable criteria (weight, orientation, etc.)​","-    Robot for boxes picking ​","-    Tour de stockage automatisée ​"],"Texts2":["-    Eliminating the need to handle heavy loads and reducing arduousness​","-    Secure flows ​","-    Production optimization​","-    Improved transport carbon footprint​"]},{"Title":"Cobot’Ease Storage, a solution that carries out your storage operations​","Header":"The solution meets a need for automatic parcel storage for order preparation.​","Subtitle1":"Operating principle:","Subtitle2":"The major benefits of this solution:","Footnote":"From a safety point of view, this solution is certified by an approved inspection body: Bureau Veritas.","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/3 - COBOT EASE STORAGE/cobotease-storage fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Cobot\'Ease Storage.jpg"},"Texts1":["The parcels pass through a conveyor and remain in storage until orders are given for their retrieval or palletization​.\\nThis buffer storage method ensures that all cartons for a palletizing order are gathered, enabling optimal arrangement on the final pallet. This approach enables heterogeneous palletizing (with cartons of various sizes).\\nThe machine is self-contained.","Our Cobot\'Ease Storage solution meets these different use cases as standard.\\nThe boxes are handled automatically from the conveyor to the storage area by one or more robots.","Sorting in the storage system is managed by a robot that recognizes the dimensions of the boxes and allocates them to specific drawers to optimize space efficiency.","The storage is provided by a MODULA cabinet, designed to store trays vertically (with a maximum height 15 meters and drawer widths up to 4 meters).​"],"Texts2":["-    Reduced floor space for manufacturers.​","-    Optimization of palletizing plans for homogeneous and heterogeneous palletizing.​","-    Potential optimization of empty space in cartons (adjusting  carton sizes according to their contents).​"]},{"Title":"Manufacturing Execution System","Header":null,"Subtitle1":null,"Subtitle2":"The major benefits of this solution:","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":null,"Texts1":["The MES (Manufacturing Execution System) is a software that orchestrates all production operations. It provides multiple functionalities detailed in the appendices which are explicit in annexes, but within in the framework of Showroom 4.0, four functionalities have been selected:","1.    Manufacturing order management ​\\n2.    Data Acquisition ​\\n3.    OEE calculation : Overall Equipment Efficiency rate ​\\n4.    Production quality monitoring  ​"," The solution adopted for this case of use is the AVEVA MES (Model Driven), which allows the creation of views, MES forms and associated workflows.​","Equans digital is certified ENDORSED, the highest level of partnership for AVEVA products, positioning it as one of the only three certified integrators in France at present. ​","Equans digital is a partner with Ordinal Software to integrate the MES COOX solution.​"],"Texts2":["The MES allows you to pilot the production operations by providing structured and tailored information for the needs of the company’s stakeholders, enabling decision-making based on diverse, accurate and up-to-date data.​"]},{"Title":"Cockpit hypervision","Header":"​The hypervisor provides global supervision of the showroom.","Subtitle1":"Operating principle:","Subtitle2":"The major benefits of this solution:","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/7 - Cockpit hypervision fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Hypervision.jpg"},"Texts1":["Its user interface centralises information from the various critical systems (cyber protection of the installation, AI analysis of packages, device performance indicators, etc.) and production monitoring (production orders executed, event log, overall impact on staff health and safety, on the environment, etc.).​​","The hypervisor offers a cockpit that enables you to:​​","-    Analyse the production chain  (daily anomalies detected by the Computer Vision system, performance history recorded);​\\n-    Control certain equipment or systems (start/stop an OF, acknowledge an alarm, etc.);​​\\n-    Redirect the user to the most efficient system (access all the network intrusion analysis tools <Seckiot>, the MES, the augmented reality device).​​","A centralised authentication system provides access to all available data sources within the factory.  As a result, the user has the necessary information at all times to monitor and manage the installation.​​","Its architecture is based on a decentralised structure using webservices (APIs - Application Programming Interfaces) at its core, to enable data  exchange between systems.​","The information presented and its arrangement can be customised and configured according to the customer’s needs."],"Texts2":["-    Preservation of business tools and supervision for the benefit of business experts.​","-    Creation of a Hypervision/consolidated view:​","        - Gain perspective.\\n        - Situation analysis, multi-factor cross-referencing.\\n        - Understanding malfunctions.\\n        - Identify sources of performance.\\n        - Improve overall performance."]},{"Title":"Cybersecurity","Header":null,"Subtitle1":"Operating principle:","Subtitle2":"The major benefits of this solution:","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/9 - Cybersécurité/Cybersécurité fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Cybersécurité.jpg"},"Texts1":["Together with its partner Seckiot, Equans Digital offers a specialised cybersecurity solution for industrial and XIOT systems, targeting several sectors including manufacturing, energy, transport and critical infrastructure.","It is designed to map and monitor these systems in real time to detect and prevent anomalies and intrusions, ensuring the security and optimised management of critical industria infrastructures.","   -    Securing critical infrastructures\\n -    Optimising infrastructure management\\n -     Detection and prevention of anomalies and intrusions​\\n -    Regulatory compliance","Technical solutions implemented :","   -    Mapping and continuous monitoring​\\n -    Detection of intrusions and anomalies​\\n -   In-depth analysis and risk management​","In short, our partner SECKIOT uses advanced mapping and detection techniques to provide continuous monitoring and proactive protection of industrial and XIOT systems.​"],"Texts2":["-    Increased visibility and control​\\n-    Enhanced security ​\\n-    Operational performance ​","The solution provides complete visibility, better resource management and increased responsiveness to threats, while helping businesses to comply with regulatory requirements.​​"]},{"Title":"Cobot (Collaborative robot​)","Header":"This solution allows the robot to work alongside humans in a shared environment.​","Subtitle1":"Operating principle:","Subtitle2":"The major benefits of this solution:","Footnote":"From a safety point of view, this solution is certified by an approved inspection body: Bureau Veritas.","ImageSourceAndSize":null,"Images2":[{"Source":"images/Montargis/poi/cobot/cobot 1.jpg","WidthInPixels":450,"HeightInPixels":300}],"VideoInfo":null,"Texts1":["The machine can perform palletizing or depalletizing tasks. The robot and its gripper will be adapted to the type of container, its weight, and the sizes of pallets. The packages are generally of identical and repeatable dimensions.","The machine is portable and transportable. The integrated camera enables visual inspection and measurement operations.","Depending on the tasks to be performed, the cycle time may vary. The maximum rate is 3 placements per minute (excluding pallet loading), and the loads that can be handled can reach up to 12 kg (with gripper).","Safety sensors and emergency stop devices are integrated into the solution to prevent accidents with operators, as well as speed reduction functions in the presence of humans.","An Equans software for creating palletizing plans is integrated.​"],"Texts2":["-    Secure and possible interactions with operators\\n-    ​Reduction of operator strain and musculoskeletal disorders (MSDs)\\n-    Easy integration with existing systems\\n-    Simple adaptation and reconfiguration for different production lines"]},{"Title":"Mobil’Ease, a solution that automates your transfers​","Header":"This solution meets a need for assistance in moving heavy loads.​\\nThe robots are AMRs (autonomous mobile robots), also known as AIVs (autonomous intelligent vehicles). ","Subtitle1":"Operating principle:","Subtitle2":"The major benefits of this solution:","Footnote":"From a safety point of view, this solution is certified by an approved inspection body: Bureau Veritas.","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/5 - MOBILEASE/mobilease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Mobil\'Ease.jpg"},"Texts1":["In automatic mode, the robots respond to loading or unloading tasks communicated by the fleet manager. They are free to move within learned and authorized following the defined navigation parameters (speed, acceleration, signals, traffic direction, etc.).​","In ‘Follow-Me’ mode, the operator can take control of a robot, pausing its the automatic mission, so the robot follows the operator’s movements, assisting with his picking tasks.\\n"],"Texts2":["-    Reduced operator fatigue and MSDs (Musculoskeletal Disorders) elimination of heavy lifting and repetitive body movements. ​","-    Reduced risk of workplace accidents, by no longer requiring package handling (e.g., hand cuts, risk of weight falling on feet).​","-    Automatic unloading and loading of machines (parcels and pallets).","-    Optimization of movements​","-    Adaptation to different environments ​","-    Possible interaction with operators"]}]}]}');

/***/ }),

/***/ 34930:
/*!********************************!*\
  !*** ./locales/en/videos.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"video_s1p1":"../../videos/Montargis/1 - PALETEASE/paletease en.mp4","video_s1p2":"../../videos/Montargis/2 - DEPACKEASE/depackease en.mp4","video_s1p3":"../../videos/Montargis/3 - COBOT EASE STORAGE/cobotease-storage en.mp4","video_s1p4":"../../videos/Montargis/4 - Palettisation hétérogène fr en es","video_s1p5":"../../videos/Montargis/5 - MOBILEASE/mobilease en.mp4","video_s1p6":"../../videos/Montargis/6 - Computer vision  IA fr en es.mp4","video_s1p7":"../../videos/Montargis/7 - Cockpit hypervision fr en es.mp4","video_s1p9":"../../videos/Montargis/9 - Cybersécurité/Cybersecurity en es.mp4"}');

/***/ }),

/***/ 87147:
/*!*******************************!*\
  !*** ./locales/es/audio.json ***!
  \*******************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"audio1":"../audio/es/video1.mp3"}');

/***/ }),

/***/ 31450:
/*!********************************!*\
  !*** ./locales/es/common.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"loadingHTML":"Cargando...","name":"Juan","welcome":"¡Bienvenido a nuestra aplicación!","importText":"Importación... ({{arg0}}/{{arg1}})","closeBtnText":"Cerrar","openBtnText":"Abrir la mapa del mundo","poiInfoBtnText":"Más información","welcomeUI0":"Bienvenido a la sala de exposiciones de Equans Digital Industrie 4.0.","welcomeUI1":"Esta sala de exposiciones es un verdadero lugar de diseño, innovación y demostración de nuestro saber hacer a nuestros clientes, y su objetivo es ser el centro neurálgico de la Industria 4.0 en Francia.","welcomeUI2":"Tiene varias misiones:","welcomeUI3":"- Apoyar a los fabricantes reuniendo una amplia gama de conocimientos técnicos","welcomeUI4":"- Presentar islas robóticas y casos de uso de Industria 4.0 en situaciones reales","welcomeUI5":"- Co-construcción con fabricantes y desarrollo de soluciones a medida basadas en nuestras soluciones estándar.","welcomeUI6":"Equans Digital ha creado un verdadero ecosistema de expertos y agentes para prestar el mejor apoyo posible a la reindustrialización de Francia.","welcomeUI7":"¡Disfrute de su descubrimiento!"}');

/***/ }),

/***/ 41780:
/*!****************************************!*\
  !*** ./locales/es/giDescriptions.json ***!
  \****************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"DescriptionsPerScene":[{"Descriptions":[{"Title":"Sala de I+D","ImagesSourcesAndSizes":[{"Source":"images/Montargis/gi/bureau d\'études.jpg","WidthInPixels":500,"HeightInPixels":300},{"Source":"images/Montargis/gi/ENGIE-contexte-1.jpg","WidthInPixels":450,"HeightInPixels":300}],"Texts":["A través de este espacio abierto, Equans Digital busca crear un ecosistema sólido y una verdadera comunidad nacional en torno a la temática de la Industria 4.0.","   - Un lugar para la creación y las interacciones con actores industriales y startups, centros de investigación y nuestros clientes.\\n - Un sitio para la investigación aplicada para desarrollar soluciones innovadoras en co-desarrollo con empresas para el diseño y fabricación de soluciones estándar.\\n - Un lugar de producción para responder a las solicitudes de nuestros clientes.\\n - Pruebas y preparación para la puesta en marcha.","Al reunir y facilitar el intercambio entre los diferentes actores del sector, este espacio fomenta la co-construcción y el aprendizaje cruzado."]}]}]}');

/***/ }),

/***/ 60937:
/*!********************************!*\
  !*** ./locales/es/images.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"image_s1p1":"../../images/Montargis/1.jpg","image_s1p2":"../../images/Montargis/2.jpg","image_s1p3":"../../images/Montargis/3.jpg","image_s1p4":"../../images/Montargis/4.jpg","image_s1p5":"../../images/Montargis/5.jpg","image_s1p6":"../../images/Montargis/6.jpg","image_s1p7":"../../images/Montargis/7.jpg"}');

/***/ }),

/***/ 18554:
/*!*****************************************!*\
  !*** ./locales/es/poiDescriptions.json ***!
  \*****************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"DescriptionsPerScene":[{"Descriptions":[{"Title":"Palet’Ease, solución de paletización y despaletización ​","Header":"La solución responde a la necesidad de colocar paquetes en un palé (paletización) o, a la inversa, de retirar paquetes de un palé (despaletización).","Subtitle1":"Principio de funcionamiento :","Subtitle2":"Las principales ventajas de esta solución :","Footnote":"Esta solución está certificada desde el punto de vista de la seguridad por un organismo de control autorizado: Bureau Veritas. ​","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/1 - PALETEASE/paletease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Palet\'Ease.jpg"},"Texts1":["En modo paletización, los paquetes llegan de una unidad de producción a través de un transportador. Deben ser colocados en un palé siguiendo un orden y una posición preestablecidos (plan de paletización).​","En modo despaletización, los paquetes llegan apilados en un palé. Deben ser desembalados y puestos en una cinta transportadora para transferirlos a una línea de tratamiento (apertura de paquetes, almacenamiento etc.). El plan de paletización puede estar definido con antelación o no. Los paquetes suelen tener dimensiones idénticas y repetibles. Los embalajes suelen ser cajas de cartón cerradas, pero también pueden ser de otro tipo (bolsas de plástico, contenedores, etc.).​","La máquina es autónoma y puede utilizarse para paletizar o despaletizar.","El robot y su pinza serán adaptados al tipo de contenedor, a su peso y a las dimensiones del palé. Ofrecemos el software EQUANS para crear planos de paletización, adaptables a las características de los embalajes.","Para el modo de despaletización, proponemos añadir un sensor 3D en la pinza para posicionar los paquetes en el palé.","La máquina está sobre un chasis móvil que puede desplazarse y transportarse. Existen varios modelos estándar para responder a los requisitos del producto, la cadencia y el entorno."],"Texts2":["-    Reducción de la carga física para el operario y de los TME (trastornos musculoesqueléticos): eliminación del levantamiento de cargas pesadas y de los movimientos corporales repetitivos.​","-    Reducción del riesgo de accidentes laborales, puesto que el operario ya no tiene que manipular paquetes (cortes en las manos, riesgo de caída del peso sobre los pies).​","-    Aumento de la fiabilidad de las operaciones de paletización/despaletización (calidad) y aumento potencial de la cadencia en la línea.​"]},{"Title":"Inteligencia artificial - Visión por ordenador ​","Header":"Detección de pictogramas en cajas logísticas, en tiempo real durante su desplazamiento en una cinta transportadora, con el fin de caracterizarlas.\\nLos pictogramas detectados son :\\n-   Cartón frágil​,\\n-    Cartón sensible a la humedad​\\n-    Cartón que debe manipularse con cuidado​\\n-    Cartón inflamable","Subtitle1":"Principio de funcionamiento :","Subtitle2":"Las principales ventajas de esta solución : ","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/6 - Computer vision IA fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Computer vision.jpg"},"Texts1":["Los pictogramas pueden estar localizados en los lados izquierdo o derecho, delante o detrás de la caja. Los pictogramas pueden ser de diferentes tamaños, colores y tener una gran variedad de representaciones diferentes.","La solución, es una solución de visión por ordenador estereoscópica con comunicación bidireccional OPC UA. La solución integral incluye : ","-    Creación de conjuntos de datos\\n-     Etiquetado,\\n-    Entrenamiento, pruebas y mejora del rendimiento (detección y reconocimiento),\\n-    Sincronización estéreo (dos cámaras),\\n-    Comunicación industrial mediante OPC UA (cliente)","Paquete de lenguaje Python (ver 3.9) basado en componentes Open Source. "],"Texts2":["-    Permite la detección y el reconocimiento de cualquier clase de objeto, defecto, característica, etc.","-    Permite la detección y el reconocimiento de objetos en movimiento, en tiempo real","-    Mejora el rendimiento de los controles que pueden realizarse manualmente (fiabilidad, rapidez de análisis, etc.),","-    Acoplamiento con soluciones de alerta, trazabilidad, GMAO, proceso industrial (control de mando), robótica, etc.","-    Disminución de la fatiga, eliminación de tareas sin valor añadido y reorientación de las personas hacia tareas más interesantes","-    Puede aplicarse en longitudes de onda visibles o invisibles","-    Puede «generalizarse» en cuanto a su apariencia, ubicación, tamaño, etc."]},{"Title":"​Depack’Ease, solución depacking","Header":"La solución responde a la necesidad de abrir cajas de cartón. ​","Subtitle1":"Principio de funcionamiento :","Subtitle2":"Las principales ventajas de esta solución : ","Footnote":"Esta solución está certificada desde el punto de vista de la seguridad por un organismo de control autorizado: Bureau Veritas. ​","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/2 - DEPACKEASE/depackease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Depack\'Ease.jpg"},"Texts1":["Los paquetes llegan a una cinta transportadora, por ejemplo, desde una unidad de despaletización. Es necesario abrirlos p;or la parte superior para extraer las piezas que contienen.​","Los embalajes son de diferentes tamaños. El embalaje suele ser en cajas de cartón encoladas o selladas con cinta adhesiva\\nLa máquina es autónoma.","La máquina mide cada caja individualmente, utilizando 3 sensores (longitud, ancho  y altura). El robot y su pinza se adaptan al tipo de cartón. La pinza está equipada con una cuchilla de corte muy resistente a la abrasión. El robot se desplaza alrededor del cartón para cortarlo por los 4 lados.","La profundidad y la altura de corte en relación con la parte superior del cartón pueden ajustarse a través de la IHM (Interfaz Hombre- Máquina). La solución puede acoplarse a un lector de códigos de paquetes, que incorpora un código que caracteriza estos ajustes de corte.​","Según la cadencia es posible añadir una segunda pista de transporte para alternar los cortes a ambos lados del pie del robot.\\nSe puede implementar un sistema para retirar la parte superior de los paquetes añadiendo un manipulador en a la salida del puesto de corte.","Existe una versión específica de esta solución para la apertura de blísteres de botellas."],"Texts2":["-    Reducción de la carga física para el operario y de los TME (trastornos musculoesqueléticos): eliminación de la necesidad de transportar cargas pesadas y de realizar movimientos corporales repetitivos.​","-    Reducción del riesgo de accidentes laborales, especialmente cuando se utilizan cortadoras que pueden provocar cortes en las manos.​","-    Mayor fiabilidad de las operaciones de corte para evitar dañar el producto en su interior (calidad) y aumento potencial de la cadencia en velocidad de la línea. ​"]},{"Title":"​Paletización heterogénea","Header":"La solución responde a la necesidad de paquetes multiformato.","Subtitle1":"Principio de funcionamiento :","Subtitle2":"Las principales ventajas de esta solución : ","Footnote":"Esta solución está certificada desde el punto de vista de la seguridad por un organismo de control autorizado: Bureau Veritas. ​","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/4 - Palettisation hétérogène fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Palettisation hétérogène.jpg"},"Texts1":["-    Algoritmo de cálculo del plan de paletización según criterios personalizables (peso, orientación, etc.)​","-    Robot de recogida de cajas ​","-    Torre de almacenamiento automatizada ​"],"Texts2":["-    Eliminación de la necesidad de transportar cargas pesadas y reducción del trabajo arduo​","-    Flujos seguros​","-    Optimización de la producción​","-    Mejora de la huella de carbono del transporte​"]},{"Title":" Cobot’Ease Storage, una solución que realiza sus operaciones de almacenamiento​","Header":"​La solución responde a una necesidad de almacenamiento automático de paquetes para la preparación de pedidos.","Subtitle1":"Principio de funcionamiento :","Subtitle2":"Las principales ventajas de esta solución : ","Footnote":"Esta solución está certificada desde el punto de vista de la seguridad por un organismo de control autorizado: Bureau Veritas. ​","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/3 - COBOT EASE STORAGE/cobotease-storage fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Cobot\'Ease Storage.jpg"},"Texts1":["Los paquetes llegan a una cinta transportadora y se almacenan a la espera de la orden de salida o de paletización.​\\nEste almacenamiento intermedio permite tener todas las cajas de un pedido paletizado y así optimizar al máximo la posición de las cajas en el palé final. Esto permite una paletización heterogénea (con cartones de diferentes dimensiones).​\\nLa máquina es autónoma.","Nuestra solución Cobot\'Ease Storage responde a estos diferentes casos de uso de una manera estándar.​\\nLa manipulación automática de las cajas desde el transportador hasta la zona de almacenamiento es efectuada por uno o varios robots.","La clasificación en el sistema de almacenamiento la realiza un robot que conoce las dimensiones de las cajas y las asigna a cada cajón para optimizar el espacio ocupado.","El almacenamiento se realiza mediante un armario MODULA, que puede almacenar bandejas en vertical (altura máxima de 15 metros, ancho máximo de un cajón de 4 metros).​"],"Texts2":["-    Reducción del espacio ocupado por los fabricantes.​","-    Optimización de los planes de paletización homogénea y heterogénea.​","-    Posibilidad de optimizar el transporte de cajas vacías (adaptación del tamaño de las cajas en función de su contenido).​"]},{"Title":"Sistema de ejecución de fabricación​","Header":null,"Subtitle1":null,"Subtitle2":"Las principales ventajas de esta solución : ","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":null,"Texts1":["El MES (Sistema de ejecución de fabricación) es un software que organiza todas las operaciones de producción. Ofrece varias funciones, que se explicarán en los apéndices, pero como parte de Showroom 4.0, se han conservado cuatro funciones:","1. Gestión de órdenes de fabricación.\\n2. Adquisición de datos ​\\n3. Cálculo de TRS: Tasa de retorno ​\\n4. Calidad en la producción","La solución adoptada para este caso de uso es AVEVA MES (Model Driven), que permite la creación de vistas, formularios MES y flujos de trabajo asociados.","Equans digital cuenta con la certificación ENDORSED, el nivel más alto de asociación para los productos AVEVA, lo que lo convierte en uno de los tres únicos integradores certificados en Francia hasta el momento.","Equans digital también se asocia con Ordinal Software para integrar la solución MES COOX.\\n"],"Texts2":["El MES permite gestionar las operaciones productivas proporcionando información estructurada y adaptada a las necesidades de los responsables de la empresa, y permitiendo la toma de decisiones a partir de datos variados, precisos y actualizados."]},{"Title":"Cockpit hipervisión","Header":"El hipervisor proporciona una supervisión global de la sala de exposición.","Subtitle1":"Principio de funcionamiento :","Subtitle2":"Las principales ventajas de esta solución : ","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/7 - Cockpit hypervision fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Hypervision.jpg"},"Texts1":["Su interfaz de usuario centraliza la información de los distintos sistemas críticos (ciber protección de la instalación, análisis de paquetes por IA, indicadores de rendimiento de los dispositivos, etc.) y del seguimiento de la producción (órdenes de producción ejecutadas, registro de eventos, impacto global en la seguridad y salud del personal, en el medio ambiente, etcétera).​","El hipervisor ofrece un panel de control que le permite:","-    Analizar la línea de producción (anomalías detectadas cada día por el sistema de Visión por Computador, historial de rendimiento registrado);\\n-    Controlar determinados equipos o sistemas (iniciar/parar una OF (orden de fabricación), reconocer una alarma, etc.);​\\n-    Redirigir al usuario al sistema más eficiente (acceder a todas las herramientas de análisis de intrusiones en la red <Seckiot>, el MES, el dispositivo de realidad aumentada).​","La autenticación centralizada da acceso a todas las fuentes de datos disponibles en la fábrica. Esto significa que los usuarios  disponen de la información necesaria para monitorear y controlar la planta en cualquier momento.​","Su arquitectura se basa en una arquitectura descentralizada, con servicios web (API - Interfaz de Programación de Aplicaciones) en su núcleo, que permiten el intercambio de datos entre sistemas.​","La información presentada y la forma en que está organizada se pueden configurar y personalizar para adaptarse a las necesidades de cada cliente."],"Texts2":["-     Preservación de herramientas comerciales y supervisión de expertos comerciales.​","-     Creación de una Hipervisión/vista consolidada:","        - Ganar perspectiva.\\n        - Análisis de situación, cruce multifactorial.\\n        - Comprender las anomalías.\\n        - Identificar las fuentes de desempeño.\\n        - Mejorar el rendimiento general."]},{"Title":"Cyberseguridad","Header":null,"Subtitle1":"Solutions techniques mises en oeuvre :","Subtitle2":"Las principales ventajas de esta solución : ","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/9 - Cybersécurité/Cybersécurité fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Cybersécurité.jpg"},"Texts1":["Junto con su socio Seckiot, Equans Digital ofrece una solución de ciberseguridad especializada para sistemas industriales y XIOT, dirigida a varios sectores, como la fabricación, la energía, el transporte y las infraestructuras críticas.","Está diseñada para mapear y monitorizar estos sistemas en tiempo real para detectar y prevenir anomalías e intrusiones, garantizando la seguridad y la gestión optimizada de infraestructuras industriales críticas.","   - Garantizar la seguridad de las infraestructuras críticas\\n - Optimizar la gestión de las infraestructuras\\n - Detección y prevención de anomalías e intrusiones\\n - Cumplimiento de la normativa","Soluciones técnicas aplicadas : ​","   - Cartografía y supervisión continua\\n - Detección de intrusiones y anomalías\\n - Análisis en profundidad y gestión de riesgos","En resumen, nuestro socio SECKIOT utiliza técnicas avanzadas de cartografía y detección para proporcionar una supervisión continua y una protección proactiva de los sistemas industriales y XIOT."],"Texts2":["- Mayor visibilidad y control\\n- Mayor seguridad\\n- Rendimiento operativo","La solución proporciona una visibilidad completa, una mejor gestión de los recursos y una mayor capacidad de reacción ante las amenazas, al tiempo que ayuda a las empresas a cumplir los requisitos normativos."]},{"Title":"Cobot (robot colaborativo​​)","Header":"​Esta solución permite que el robot trabaje junto a los humanos en un entorno compartido.​","Subtitle1":"Principio de funcionamiento :","Subtitle2":"Las principales ventajas de esta solución : ","Footnote":"Esta solución está certificada desde el punto de vista de la seguridad por un organismo de control autorizado: Bureau Veritas. ​","ImageSourceAndSize":null,"Images2":[{"Source":"images/Montargis/poi/cobot/cobot 1.jpg","WidthInPixels":450,"HeightInPixels":300}],"VideoInfo":null,"Texts1":["La máquina puede realizar tareas de paletizado o despaletizado. El robot y su garra se adaptarán al tipo de contenedor, su peso y las dimensiones de los palets. Los paquetes son generalmente de dimensiones idénticas y repetibles.","La máquina es portátil y transportable. La cámara integrada permite realizar operaciones de inspección visual y medición.","Dependiendo de las tareas a realizar, el tiempo de ciclo puede variar. La tasa máxima es de 3 colocaciones por minuto (sin incluir la carga de palets), y las cargas que se pueden manejar pueden alcanzar hasta 12 kg (con garra).","Se integran sensores de seguridad y dispositivos de parada de emergencia en la solución para prevenir accidentes con los operadores, así como funciones de reducción de velocidad en presencia de humanos.","Se integra un software de Equans para la creación de planes de paletizado.​​"],"Texts2":["-    Interacciones seguras y posibles con los operadores\\n-   Reducción de la carga del operador y de los trastornos musculoesqueléticos (TME)\\n-    Fácil integración con sistemas existentes​\\n-        Adaptación y reconfiguración sencilla para diferentes líneas de producción​"]},{"Title":"Mobil’Ease, una solución que automatiza sus transferencias​","Header":"Esta solución responde a una necesidad de asistencia para mover cargas pesadas.​\\nLos robots son AMR (robots móviles autónomos), también conocidos como AIV (vehículos autónomos inteligentes).","Subtitle1":"Principio de funcionamiento :","Subtitle2":"Las principales ventajas de esta solución : ","Footnote":"Esta solución está certificada desde el punto de vista de la seguridad por un organismo de control autorizado: Bureau Veritas. ​","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/5 - MOBILEASE/mobilease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Mobil\'Ease.jpg"},"Texts1":["En modo automático, los robots responden a las misiones de carga o descarga comunicadas por el gestor de la flota. Son libres de moverse dentro de las zonas que han aprendidas y autorizadas, siguiendo los parámetros de navegación definidos (velocidad, aceleración, señalización, sentido de la circulación, etc.).​","En modo «Follow-Me», el operario puede tomar el control del robot, deteniendo la misión automática, para que le siga y le ayude en sus misiones de picking. ​"],"Texts2":["-    Reducción de la carga física para el operario y de los TME (trastornos musculoesqueléticos): eliminación del levantamiento de cargas pesadas y de los movimientos corporales repetitivos.​","-    Reducción del riesgo de accidentes laborales, al evitar la manipulación de paquetes (cortes en las manos, riesgo de caída del peso sobre los pies).","-    Descarga y carga automatizadas  de las máquinas (paquetes y palés).​","-    Optimización de los movimientos.","-    Adaptación a diferentes entornos ​.","-    Posible interacción con los operarios."]}]}]}');

/***/ }),

/***/ 41571:
/*!********************************!*\
  !*** ./locales/es/videos.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"video_s1p1":"../../videos/Montargis/1 - PALETEASE/paletease es.mp4","video_s1p2":"../../videos/Montargis/2 - DEPACKEASE/depackease es.mp4","video_s1p3":"../../videos/Montargis/3 - COBOT EASE STORAGE/cobotease-storage es.mp4","video_s1p4":"../../videos/Montargis/4 - Palettisation hétérogène fr en es","video_s1p5":"../../videos/Montargis/5 - MOBILEASE/mobilease es.mp4","video_s1p6":"../../videos/Montargis/6 - Computer vision  IA fr en es.mp4","video_s1p7":"../../videos/Montargis/7 - Cockpit hypervision fr en es.mp4","video_s1p9":"../../videos/Montargis/9 - Cybersécurité/Cybersecurity en es.mp4"}');

/***/ }),

/***/ 22995:
/*!*******************************!*\
  !*** ./locales/fr/audio.json ***!
  \*******************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"audio1":"../audio/fr/video1.mp3"}');

/***/ }),

/***/ 40994:
/*!********************************!*\
  !*** ./locales/fr/common.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"loadingHTML":"Chargement...","name":"Jean","welcome":"Bienvenue, {{name}} !","importText":"Importation en cours... ({{arg0}}/{{arg1}})","closeBtnText":"Fermer","openBtnText":"Ouvrir la carte du monde","poiInfoBtnText":"En savoir plus","welcomeUI0":"Bienvenue au showroom Industrie 4.0 Equans Digital !","welcomeUI1":"Véritable lieu de conception, d’innovation et de démonstration de nos savoir-faire à nos clients, ce showroom a pour vocation d’être le lieu de concentration de l’industrie 4.0 en France.","welcomeUI2":"Il porte plusieurs missions :","welcomeUI3":"- Accompagner les industriels en réunissant de multiples expertises","welcomeUI4":"- Présenter des ilots robotisés et cas d’usages Industrie 4.0 en situation","welcomeUI5":"- Coconstruire avec les industriels et développer des réponses sur mesure à partir de nos solutions standard","welcomeUI6":"À travers ce lieu, Equans Digital a créé un véritable écosystème d’experts et d’acteurs afin d’accompagner au mieux la réindustrialisation de la France.","welcomeUI7":"Bonne découverte !"}');

/***/ }),

/***/ 49948:
/*!****************************************!*\
  !*** ./locales/fr/giDescriptions.json ***!
  \****************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"DescriptionsPerScene":[{"Descriptions":[{"Title":"Salle R&D","ImagesSourcesAndSizes":[{"Source":"images/Montargis/gi/bureau d\'études.jpg","WidthInPixels":500,"HeightInPixels":300},{"Source":"images/Montargis/gi/ENGIE-contexte-1.jpg","WidthInPixels":450,"HeightInPixels":300}],"Texts":["Au travers de cet espace ouvert, Equans Digital souhaite créer un écosystème fort et une véritable communauté nationale autour de la thématique de l\'industrie 4.0.","   - Lieu de création et d\'interaction avec les industriels et start-ups, avec les centres de recherche, avec nos clients ;\\n  - Lieu de recherche appliquée pour l\'élaboration de solutions innovantes en collaboration avec des entreprises pour la conception et fabrication de solutions standard ;\\n  - Lieu de production pour réponses aux demandes de nos clients ;\\n  - Essais et préparation mise en service.","En faisant se rencontrer et échanger les différents acteurs du milieu, ce lieu encourage la co-construction et l\'apprentissage croisé."]}]}]}');

/***/ }),

/***/ 45281:
/*!********************************!*\
  !*** ./locales/fr/images.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"image_s1p1":"../../images/Montargis/1.jpg","image_s1p2":"../../images/Montargis/2.jpg","image_s1p3":"../../images/Montargis/3.jpg","image_s1p4":"../../images/Montargis/4.jpg","image_s1p5":"../../images/Montargis/5.jpg","image_s1p6":"../../images/Montargis/6.jpg","image_s1p7":"../../images/Montargis/7.jpg"}');

/***/ }),

/***/ 32066:
/*!*****************************************!*\
  !*** ./locales/fr/poiDescriptions.json ***!
  \*****************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"DescriptionsPerScene":[{"Descriptions":[{"Title":"Palet’Ease, solution de palettisation et dépalettisation","Header":"La solution répond à un besoin de dépose colis sur une palette (palettisation) ou à l’inverse de retrait de colis d’une palette (dépalettisation).","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/1 - PALETEASE/paletease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Palet\'Ease.jpg"},"Texts1":["En mode palettisation, des colis arrivent d\'une unité de production par un convoyeur. Ils doivent être déposés sur une palette suivant un ordre et une position connue à l\'avance (plan de palettisation).","En mode dépalettisation, des colis arrivent empilés sur une palette. Ils doivent être dépilés et déposés sur un convoyeur pour transfert sur une chaine de traitement (ouverture colis, mise en stock, etc.). Le plan de palettisation peut être connu à l\'avance ou non. Les colis sont généralement de dimensions identiques et répétables. Le conditionnement est généralement sous format cartons fermés, mais peut être également d\'autres types (sacs plastiques, bacs, etc.).\\nLa machine est autonome.","La machine peut réaliser de la palettisation ou de la dépalettisation.\\nLe robot et son préhenseur seront adaptés au type de contenant, à son poids et aux tailles de palettes.\\nNous proposons un logiciel EQUANS de création des plans de palettisation, adaptable aux caractéristiques des colis.","Pour le mode dépalettisation, nous proposons l\'ajout d\'un capteur 3D sur le préhenseur pour positionner la prise des colis sur la palette.","La machine est sur châssis mobile, déplaçable et transportable.\\nDifférents modèles standards sont proposés pour répondre aux contraintes produit, cadence et environnement."],"Texts2":["- Réduction de la pénibilité opérateur et des TMS (Troubles Musculo Squelettiques) : élimination du port de charges lourdes et des mouvements répétés du corps.","- Réduction des risques d\'accidents du travail, du fait de ne plus à avoir à manipuler les colis (coupure aux mains, risque chute de poids sur les pieds).","- Fiabilisation des opérations de palettisation/dépalettisation (qualité) et potentielle augmentation de la cadence ligne."]},{"Title":"Intelligence Artificielle - Computer Vision","Header":"Détection de pictogrammes sur des cartons logistiques, à la volée lors de leur déplacement sur un convoyeur afin de les caractériser .\\nLes pictogrammes détectés sont :\\n-     Carton fragile,\\n-  Carton sensible à l’humidité,\\n-    Carton à manipuler avec soin,\\n-    Carton inflammable.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/6 - Computer vision IA fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Computer vision.jpg"},"Texts1":["Les pictogrammes peuvent être localisés sur les faces gauche ou droite, avant ou arrière du carton à n’importe quel endroit. Les pictogrammes peuvent être de différentes dimensions, de différentes couleurs et les pictogrammes eux même peuvent avoir une grande variété de représentations différentes.","La solution est une solution d’Intelligence Artificielle de Computer Vision, stéréo, intégrant la communication OPC UA bidirectionnelle. Solution de bout en bout comprenant : ","-  Création du Dataset,\\n-     Labélisation,\\n-   Entraînements, tests et amélioration des performances (détection et reconnaissance),\\n-  Synchronisation stéréo (deux caméras),\\n-   Communication industrielle par OPC UA (client)."," Ensemble en langage python (ver 3.9) à partir de briques Open Source."],"Texts2":["- Permet de détecter et reconnaître n’importe quelle classe d’objet, défauts, caractéristiques…","- Permet de réaliser les détections et la reconnaissance sur des objets se déplaçant, à la volée,","- Améliore la performance des contrôles pouvant être faits par des personnes (fiabilité, vitesse d’analyse…),","- Couplage avec des solution d’alertes, de traçabilité, de GMAO, de process industriel (contrôle commande), de robotique…","- Sans fatigue, supprime les tâches sans valeur ajoutée, redirige les personnes vers des tâches plus intéressantes,","- Possibilité de mise en place sur des longueurs d’onde visibles ou invisibles,","- Capacité de « généralisation » en apparence, emplacement, taille…"]},{"Title":"Depack’Ease, solution de découpe de vos emballages","Header":"La solution répond à un besoin d\'ouverture de colis cartons.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/2 - DEPACKEASE/depackease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Depack\'Ease.jpg"},"Texts1":["Les colis arrivent sur un convoyeur, d\'une unité de dépalettisation par exemple. Ils doivent être ouverts par le dessus pour permettre le prélèvement des pièces contenues à l\'intérieur.","Les colis sont de dimensions différentes. Le conditionnement est généralement sous format cartons collés ou scotchés.\\nLa machine est autonome.","La machine mesure chaque carton individuellement, à l\'aide de 3 capteurs (longueur, largeur et hauteur). Le robot et son préhenseur seront adaptés au type de cartons. Le préhenseur est pourvu d\'une lame de découpe, d\'une bonne résistance à l\'abrasion. Le robot fait un mouvement tout autour du carton pour le découper sur les 4 faces.","Il est possible de régler par l\'IHM la profondeur de découpe et sa hauteur par rapport au-dessus du carton. La solution peut être couplée à une lecture de code colis, intégrant un code caractérisant ces paramétrages de découpe.","Suivant la cadence, une deuxième piste de convoyage est possible pour alterner les découpes de chaque côté du pied robot.\\nUn système de retrait du dessus des colis est possible par l\'ajout d\'un manipulateur en sortie de poste de découpe.\\nCette solution est déclinée en une version spécifique pour l\'ouverture de blister de flacons."],"Texts2":["- Réduction de la pénibilité opérateur et des TMS (Troubles Musculo Squelettiques) : élimination du port de charges lourdes et des mouvements répétés du corps.","- Réduction des risques d\'accident du travail, surtout liés à l\'utilisation de cutter pouvant provoquer des coupures aux mains.","- Fiabilisation des opérations de découpe pour ne pas endommager le produit contenu à l\'intérieur (qualité) et potentielle augmentation de la cadence ligne."]},{"Title":"Palettisation hétérogène","Header":"La solution répond à un besoin de constitution de palettes de colis multiformats.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/4 - Palettisation hétérogène fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Palettisation hétérogène.jpg"},"Texts1":["- Algorithme de calcul pour plan de palettisation selon des critères personnalisables (poids, orientation,…),","- Robot de picking des cartons,","- Tour de stockage automatisée."],"Texts2":["- Suppression des ports de charges lourdes et diminution de la pénibilité.","- Sécurisation des flux.","- Optimisation de la production.","- Amélioration de l’empreinte carbone transport."]},{"Title":"Cobot’Ease Storage, solution qui exécute vos opérations de stockage","Header":"La solution répond à un besoin de stockage de colis en automatique, pour réaliser de la préparation de commande.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/3 - COBOT EASE STORAGE/cobotease-storage fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Cobot\'Ease Storage.jpg"},"Texts1":["Les colis arrivent par un convoyeur et sont stockés en attendant l\'ordre de sortie ou de palettisation.\\nCette mise en stock tampon permet d’attendre d\'avoir l\'ensemble des cartons d\'un ordre de palettisation et ainsi d\'optimiser au maximum la position des cartons sur la palette finale. Cela pour permettre une palettisation hétérogène (avec des cartons de différentes dimensions).\\nLa machine est autonome.","Notre solution Cobot’Ease Storage répond à ces différents cas d\'usage en standard.\\nLa manipulation des cartons du convoyeur vers le stockage est réalisée en automatique par un (des) robot(s).","Le tri dans le stockeur est réalisé par un automate qui connait la dimension des colis et réalise l\'affectation des colis dans chaque tiroir pour optimiser l\'espace occupé.","Le stockage est réalisé par une armoire MODULA, permettant de ranger des plateaux à la verticale (hauteur maximum de 15 mètres, largeur d\'un tiroir maximum de 4 mètres)."],"Texts2":["- Réduction de la place au sol pour les industriels.","- Optimisation des plans de palettisation pour de la palettisation homogène et hétérogène.","- Potentielle optimisation du transport de vide dans les cartons (optimisation de la taille des cartons suivant leur contenu)."]},{"Title":"Manufacturing Execution System","Header":null,"Subtitle1":null,"Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":null,"Texts1":["Le MES (Manufacturing Execution System) est un logiciel qui orchestre toutes les opérations de production. Il offre plusieurs fonctionnalités, qui seront explicitées en annexes, mais dans le cadre du Showroom 4.0, quatre fonctionnalités ont été retenues :","1. Gestion des ordres de fabrication \\n2. Acquisition des données \\n3. Calcul du TRS : Le Taux de Rendement \\n4. Qualité en cours de production"," La solution adoptée pour ce cas d\'utilisation est le MES AVEVA (Model Driven), qui permet la création de vues, de formulaires MES et de workflows associés.","Equans digital est certifié ENDORSED, le plus haut niveau de partenariat pour les produits AVEVA, ce qui en fait l\'un des trois seuls intégrateurs certifiés en France jusqu\'à présent.","Equans digital également partenaire avec Ordinal Software pour intégrer la solution MES COOX.\\n"],"Texts2":["Le MES permet de piloter les opérations de production en fournissant des informations structurées et adaptées aux besoins des acteurs de l\'entreprise, et permettant la prise de décision sur la base de données variées, précises et à jour."]},{"Title":"Cockpit hypervision","Header":"L’hyperviseur permet d’assurer une supervision globale du showroom.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/7 - Cockpit hypervision fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Hypervision.jpg"},"Texts1":["Son interface utilisateur permet de centraliser les informations des différents systèmes critiques (Cyber protection de l’installation, analyse IA des colis, indicateur de performance du dispositif…) et de suivi de production (Ordres de Fabrication exécutés, journal des évènements, impact global sur la santé et la sécurité du personnel, sur l’environnement …).​","L’hyperviseur propose un cockpit qui permet :​","-    Analyser la chaine de production (Anomalies détectées chaque jour par le dispositif de Computer Vision, historique de la performance enregistrée) ;\\n-    De piloter certains équipements ou systèmes (Démarrer/arrêter un OF, acquitter une alarme, …) ;​\\n-    De rien rediriger l’utilisateur vers le système le plus efficient (Accéder à l’ensemble des outils d’analyse d’une intrusion réseau <Seckiot>, au MES, au dispositif de réalité augmentée).​","Une authentification centralisée permet d’accéder à l’ensemble des sources de données disponibles dans l’usine. Ainsi, à tout moment, l’utilisateur dispose des informations nécessaires pour surveiller et piloter l’installation.​","Son architecture est basée sur une architecture décentralisée, avec à la base des webservices (API -(Application Programming Interface), permettant l’échange des données entre systèmes.​","Les informations présentées, leur agencement, sont adaptables / configurables de façon personnalisée pour chaque client."],"Texts2":["- Conservation des outils métiers et des supervisions au service des experts métier.","- Création d’une Hypervision / vue consolidée :","        - Prise de hauteur.\\n        - Analyse des situations, croisement multi-facteurs.\\n        - Compréhension des dysfonctionnements.\\n        - Identification des gisements de performance.\\n        - Amélioration de la performance globale."]},{"Title":"Cybersécurité","Header":null,"Subtitle1":"Solutions techniques mises en oeuvre :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/9 - Cybersécurité/Cybersécurité fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Cybersécurité.jpg"},"Texts1":["Equans Digital propose, avec son partenaire Seckiot, une solution de cybersécurité spécialisée pour les systèmes industriels et XIOT, ciblant plusieurs secteurs d\'activité incluant l\'industrie manufacturière, l\'énergie, les transports, et les infrastructures critiques.","Elle est conçue pour cartographier et surveiller en temps réel ces systèmes afin de détecter et de prévenir les anomalies et les intrusions, garantissant ainsi la sécurité et l\'optimisation de la gestion des infrastructures critiques industrielles.","   - Sécurisation des infrastructures critiques \\n - Optimisation de la gestion des infrastructures \\n - Détection et prévention des anomalies et intrusions\\n - Conformité réglementaire ","Solutions techniques mises en œuvre : ","   - Cartographie et surveillance continue​ \\n - Détection d’intrusions et d’anomalies ​ \\n - Analyse approfondie et gestion des risques​","En résumé, notre partenaire SECKIOT utilise des techniques avancées de cartographie et de détection pour offrir une surveillance continue et une protection proactive des systèmes industriels et XIOT. ​"],"Texts2":["- Visibilité et contrôle accrus\\n- Sécurité renforcée \\n- Performance opérationnelle","La solution assure une visibilité complète, une meilleure gestion des ressources, et une réactivité accrue face aux menaces, tout en aidant les entreprises à se conformer aux exigences réglementaires.​"]},{"Title":"Cobot (Robotique collaborative)","Header":"Cette solution permet au robot de travailler aux côtés des humains dans un environnement partagé.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":[{"Source":"images/Montargis/poi/cobot/cobot 1.jpg","WidthInPixels":450,"HeightInPixels":300}],"VideoInfo":null,"Texts1":["La machine peut réaliser de la palettisation ou de la dépalettisation. Le robot et son préhenseur seront adaptés au type de contenant, à son poids et aux tailles de palettes. Les colis sont généralement de dimensions identiques et répétables.","La machine est déplaçable et transportable. La caméra intégrée permet d\'effectuer des opérations visuelles d\'inspection et de mesure.","En fonction des tâches à accomplir, le temps de cycle peut varier. La cadence max est de 3 déposes/min (hors chargement de palette) et les charges manipulées peuvent aller jusqu\'à 12 kg (avec préhenseur).","Des capteurs et des dispositifs de sécurité d\'arrêt d\'urgence sont intégrés à la solution pour éviter tout accident avec les opérateurs ainsi que des fonctions de réduction de la vitesse en cas de présence humaine.","Un logiciel Equans de création de plans de palettisation est intégré."],"Texts2":["-    Interactions possible avec les opérateurs et assistance dans la réalisation de certaines tâches\\n-    Réduction de la pénibilité opérateur et des TMS (Troubles Musculo-Squelettiques)\\n-    Facilité d\'intégration aux systèmes existants\\n-    Adaptation et reconfigration simple dans différentes lignes de production"]},{"Title":"Mobil’Ease, solution qui automatise vos transferts","Header":"Cette solution répond à un besoin d ‘assistance au déplacement de charges lourdes.\\nLes robots sont des AMR (autonomous mobile robots) aussi dits AIV (autonomous intelligent vehicles).","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/5 - MOBILEASE/mobilease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Mobil\'Ease.jpg"},"Texts1":["En mode automatique, les robots répondent à des missions de chargement ou déchargement, communiqué par le gestionnaire de flotte (Fleet Manager). Ils sont libres de se déplacer suivant les zones apprises et autorisées et avec les paramètres de navigation définis (vitesse, accélération, signalisation, sens de circulation, etc.).","En mode \\"Follow-Me\\", l\'opérateur peut prendre la main sur un robot, mettant en pause la mission automatique, pour qu\'il le suive dans ses déplacements et lui permette de l\'aider dans ses missions de picking.\\n"],"Texts2":["- Réduction de la pénibilité opérateur et des TMS (Troubles Musculo Squelettiques) : élimination du port de charges lourdes et des mouvements répétés du corps.","- Réduction des risques d\'accident du travail, du fait de ne plus à avoir à manipuler les colis (coupure aux mains, risque chute de poids sur les pieds).","- Déchargement ou chargement automatique de machines (colis et palettes).","- Optimisation des déplacements.","- Adaptation à différents environnements.","- Intéraction possibles avec les opérateurs."]}]}]}');

/***/ }),

/***/ 92123:
/*!********************************!*\
  !*** ./locales/fr/videos.json ***!
  \********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"video_s1p1":"../../videos/Montargis/1 - PALETEASE/paletease fr.mp4","video_s1p2":"../../videos/Montargis/2 - DEPACKEASE/depackease fr.mp4","video_s1p3":"../../videos/Montargis/3 - COBOT EASE STORAGE/cobotease-storage fr.mp4","video_s1p4":"../../videos/Montargis/4 - Palettisation hétérogène fr en es","video_s1p5":"../../videos/Montargis/5 - MOBILEASE/mobilease fr.mp4","video_s1p6":"../../videos/Montargis/6 - Computer vision  IA fr en es.mp4","video_s1p7":"../../videos/Montargis/7 - Cockpit hypervision fr en es.mp4","video_s1p9":"../../videos/Montargis/9 - Cybersécurité/Cybersécurité fr.mp4"}');

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendors"], () => (__webpack_exec__(28156)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);