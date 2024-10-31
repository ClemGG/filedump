// TODO: enable code in your working projeckt

// import { p } from "./viewModels/utils/log";
// import * as frPOIDesc from '../locales/fr/poiDescriptions.json';
// import * as frGIDesc from '../locales/fr/giDescriptions.json';

// p("test")
// const poiOptNames = GetPOIDescriptionNames();
// const giOptNames = GetGIDescriptionNames();

// for (let i = 0; i < poiOptNames.length; i++) 
// {
//     const optName = poiOptNames[i];
//     AddOptionToDropdown(optName, "Points d'intérêt");
// }

// for (let i = 0; i < giOptNames.length; i++) 
// {
//     const optName = giOptNames[i];
//     AddOptionToDropdown(optName, "Information Générale");
// }

// /**
// * Récupère les titres de chaque point d'intérêt
// */
// function GetPOIDescriptionNames()
// {
//     const titles = [];

//     for (let i = 0; i < frPOIDesc.DescriptionsPerScene.length; i++) 
//     {
//         const descsPerScene = frPOIDesc.DescriptionsPerScene[i];

//         for (let j = 0; j < frPOIDesc.DescriptionsPerScene.length; j++) 
//         {
//             const description = descsPerScene[j];
//             titles.push(description.Title);
//         }
//     }

//     return titles;
// }

// /**
// * Récupère les titres de chaque info générale
// */
// function GetGIDescriptionNames()
// {
//     const titles = [];

//     for (let i = 0; i < frGIDesc.DescriptionsPerScene.length; i++) 
//     {
//         const descsPerScene = frGIDesc.DescriptionsPerScene[i];

//         for (let j = 0; j < frGIDesc.DescriptionsPerScene.length; j++) 
//         {
//             const description = descsPerScene[j];
//             titles.push(description.Title);
//         }
//     }

//     return titles;
// }

// /**
// * Crée une option dans la liste déroulante de sélection de la description à afficher
// * @param optName Le nom de l'option
// * @param optGroupName Le nom du groupe dans lequel mettre l'option
// */
// function AddOptionToDropdown(optName: string, optGroupName: string) 
// {
//     const optGroup: HTMLOptGroupElement = document.getElementById(optGroupName) as HTMLOptGroupElement;
//     const option: HTMLOptionElement = document.createElement("option") as HTMLOptionElement;
//     option.text = optName;
//     optGroup.appendChild(option);
// }

console.log('>> editor.ts');