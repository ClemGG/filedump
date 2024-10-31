//#region Imports

// TODO: enable code in your working projeckt

// import "@babylonjs/core/Debug/debugLayer"; // Augments the scene with the debug methods
// import "@babylonjs/inspector"; // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version
// import '@babylonjs/loaders/glTF/2.0';

// import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
// import { GLTFFileLoader } from "@babylonjs/loaders/glTF/glTFFileLoader";
// import { CreateEngine, OptimiseEngine } from './viewModels/utils/PerfUtils';
// import { CreateShowroomsScene } from "./viewModels/main/MainScene";
// import { LoadAllFontsAsync } from "./models/Fonts";
// import { SetBrowserLanguage } from "./viewModels/localization/i18n";
// import { p } from './viewModels/utils/log';

// //#endregion

// // Initialise la traduction avec la langue du navigateur

// SetBrowserLanguage(window.navigator.language);

// // Récupère les éléments HTML

// const canvas = document.getElementById("renderCanvas") as unknown as HTMLCanvasElement;
// const divFps = document.getElementById("fps");
// divFps.style.display = 'none';


// //Initialise la scène

// const engine = CreateEngine(canvas, true, { powerPreference: 'high-performance' });
// OptimiseEngine(engine);
// const scene = CreateShowroomsScene(engine);
// //scene.debugLayer.show();
// SceneLoader.RegisterPlugin(new GLTFFileLoader());

// // Affiche la scène une fois les polices chargées

// LoadAllFontsAsync().then(() =>
// {
//     // Render every frame

//     engine.runRenderLoop(() => 
//     {
//         if(!scene.IsPaused)
//         {
//             scene.render();
//         }
        
//         divFps.innerHTML = engine.getFps().toFixed() + " fps";
//     });
// });

// // Resize

// window.addEventListener("resize", function ()
// {
//     engine.resize();
// });

// // Commandes

// canvas.onkeydown = (e) => 
//     {
//         switch(e.key)
//         {
//             case "Tab":
//                 divFps.style.display = divFps.style.display == 'none' ? 'block' : 'none';
//                 break;

//             case "Enter":
//                 window.open("editor.html", "_other");
//                 break;
//         }
//     };

console.log('>> index.ts');