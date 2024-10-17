"use strict";
(self["webpackChunkwwwroot"] = self["webpackChunkwwwroot"] || []).push([["editor"],{

/***/ 10043:
/*!***********************!*\
  !*** ./src/editor.ts ***!
  \***********************/
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
const log_1 = __webpack_require__(/*! ./viewModels/utils/log */ 71438);
const frPOIDesc = __importStar(__webpack_require__(/*! ../locales/fr/poiDescriptions.json */ 32066));
const frGIDesc = __importStar(__webpack_require__(/*! ../locales/fr/giDescriptions.json */ 49948));
(0, log_1.p)("test");
const poiOptNames = GetPOIDescriptionNames();
const giOptNames = GetGIDescriptionNames();
for (let i = 0; i < poiOptNames.length; i++) {
    const optName = poiOptNames[i];
    AddOptionToDropdown(optName, "Points d'intérêt");
}
for (let i = 0; i < giOptNames.length; i++) {
    const optName = giOptNames[i];
    AddOptionToDropdown(optName, "Information Générale");
}
/**
* Récupère les titres de chaque point d'intérêt
*/
function GetPOIDescriptionNames() {
    const titles = [];
    for (let i = 0; i < frPOIDesc.DescriptionsPerScene.length; i++) {
        const descsPerScene = frPOIDesc.DescriptionsPerScene[i];
        for (let j = 0; j < frPOIDesc.DescriptionsPerScene.length; j++) {
            const description = descsPerScene[j];
            titles.push(description.Title);
        }
    }
    return titles;
}
/**
* Récupère les titres de chaque info générale
*/
function GetGIDescriptionNames() {
    const titles = [];
    for (let i = 0; i < frGIDesc.DescriptionsPerScene.length; i++) {
        const descsPerScene = frGIDesc.DescriptionsPerScene[i];
        for (let j = 0; j < frGIDesc.DescriptionsPerScene.length; j++) {
            const description = descsPerScene[j];
            titles.push(description.Title);
        }
    }
    return titles;
}
/**
* Crée une option dans la liste déroulante de sélection de la description à afficher
* @param optName Le nom de l'option
* @param optGroupName Le nom du groupe dans lequel mettre l'option
*/
function AddOptionToDropdown(optName, optGroupName) {
    const optGroup = document.getElementById(optGroupName);
    const option = document.createElement("option");
    option.text = optName;
    optGroup.appendChild(option);
}


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

/***/ 49948:
/*!****************************************!*\
  !*** ./locales/fr/giDescriptions.json ***!
  \****************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"DescriptionsPerScene":[{"Descriptions":[{"Title":"Salle R&D","ImagesSourcesAndSizes":[{"Source":"images/Montargis/gi/bureau d\'études.jpg","WidthInPixels":500,"HeightInPixels":300},{"Source":"images/Montargis/gi/ENGIE-contexte-1.jpg","WidthInPixels":450,"HeightInPixels":300}],"Texts":["Au travers de cet espace ouvert, Equans Digital souhaite créer un écosystème fort et une véritable communauté nationale autour de la thématique de l\'industrie 4.0.","   - Lieu de création et d\'interaction avec les industriels et start-ups, avec les centres de recherche, avec nos clients ;\\n  - Lieu de recherche appliquée pour l\'élaboration de solutions innovantes en collaboration avec des entreprises pour la conception et fabrication de solutions standard ;\\n  - Lieu de production pour réponses aux demandes de nos clients ;\\n  - Essais et préparation mise en service.","En faisant se rencontrer et échanger les différents acteurs du milieu, ce lieu encourage la co-construction et l\'apprentissage croisé."]}]}]}');

/***/ }),

/***/ 32066:
/*!*****************************************!*\
  !*** ./locales/fr/poiDescriptions.json ***!
  \*****************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"DescriptionsPerScene":[{"Descriptions":[{"Title":"Palet’Ease, solution de palettisation et dépalettisation","Header":"La solution répond à un besoin de dépose colis sur une palette (palettisation) ou à l’inverse de retrait de colis d’une palette (dépalettisation).","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/1 - PALETEASE/paletease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Palet\'Ease.jpg"},"Texts1":["En mode palettisation, des colis arrivent d\'une unité de production par un convoyeur. Ils doivent être déposés sur une palette suivant un ordre et une position connue à l\'avance (plan de palettisation).","En mode dépalettisation, des colis arrivent empilés sur une palette. Ils doivent être dépilés et déposés sur un convoyeur pour transfert sur une chaine de traitement (ouverture colis, mise en stock, etc.). Le plan de palettisation peut être connu à l\'avance ou non. Les colis sont généralement de dimensions identiques et répétables. Le conditionnement est généralement sous format cartons fermés, mais peut être également d\'autres types (sacs plastiques, bacs, etc.).\\nLa machine est autonome.","La machine peut réaliser de la palettisation ou de la dépalettisation.\\nLe robot et son préhenseur seront adaptés au type de contenant, à son poids et aux tailles de palettes.\\nNous proposons un logiciel EQUANS de création des plans de palettisation, adaptable aux caractéristiques des colis.","Pour le mode dépalettisation, nous proposons l\'ajout d\'un capteur 3D sur le préhenseur pour positionner la prise des colis sur la palette.","La machine est sur châssis mobile, déplaçable et transportable.\\nDifférents modèles standards sont proposés pour répondre aux contraintes produit, cadence et environnement."],"Texts2":["- Réduction de la pénibilité opérateur et des TMS (Troubles Musculo Squelettiques) : élimination du port de charges lourdes et des mouvements répétés du corps.","- Réduction des risques d\'accidents du travail, du fait de ne plus à avoir à manipuler les colis (coupure aux mains, risque chute de poids sur les pieds).","- Fiabilisation des opérations de palettisation/dépalettisation (qualité) et potentielle augmentation de la cadence ligne."]},{"Title":"Intelligence Artificielle - Computer Vision","Header":"Détection de pictogrammes sur des cartons logistiques, à la volée lors de leur déplacement sur un convoyeur afin de les caractériser .\\nLes pictogrammes détectés sont :\\n-     Carton fragile,\\n-  Carton sensible à l’humidité,\\n-    Carton à manipuler avec soin,\\n-    Carton inflammable.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/6 - Computer vision IA fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Computer vision.jpg"},"Texts1":["Les pictogrammes peuvent être localisés sur les faces gauche ou droite, avant ou arrière du carton à n’importe quel endroit. Les pictogrammes peuvent être de différentes dimensions, de différentes couleurs et les pictogrammes eux même peuvent avoir une grande variété de représentations différentes.","La solution est une solution d’Intelligence Artificielle de Computer Vision, stéréo, intégrant la communication OPC UA bidirectionnelle. Solution de bout en bout comprenant : ","-  Création du Dataset,\\n-     Labélisation,\\n-   Entraînements, tests et amélioration des performances (détection et reconnaissance),\\n-  Synchronisation stéréo (deux caméras),\\n-   Communication industrielle par OPC UA (client)."," Ensemble en langage python (ver 3.9) à partir de briques Open Source."],"Texts2":["- Permet de détecter et reconnaître n’importe quelle classe d’objet, défauts, caractéristiques…","- Permet de réaliser les détections et la reconnaissance sur des objets se déplaçant, à la volée,","- Améliore la performance des contrôles pouvant être faits par des personnes (fiabilité, vitesse d’analyse…),","- Couplage avec des solution d’alertes, de traçabilité, de GMAO, de process industriel (contrôle commande), de robotique…","- Sans fatigue, supprime les tâches sans valeur ajoutée, redirige les personnes vers des tâches plus intéressantes,","- Possibilité de mise en place sur des longueurs d’onde visibles ou invisibles,","- Capacité de « généralisation » en apparence, emplacement, taille…"]},{"Title":"Depack’Ease, solution de découpe de vos emballages","Header":"La solution répond à un besoin d\'ouverture de colis cartons.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/2 - DEPACKEASE/depackease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Depack\'Ease.jpg"},"Texts1":["Les colis arrivent sur un convoyeur, d\'une unité de dépalettisation par exemple. Ils doivent être ouverts par le dessus pour permettre le prélèvement des pièces contenues à l\'intérieur.","Les colis sont de dimensions différentes. Le conditionnement est généralement sous format cartons collés ou scotchés.\\nLa machine est autonome.","La machine mesure chaque carton individuellement, à l\'aide de 3 capteurs (longueur, largeur et hauteur). Le robot et son préhenseur seront adaptés au type de cartons. Le préhenseur est pourvu d\'une lame de découpe, d\'une bonne résistance à l\'abrasion. Le robot fait un mouvement tout autour du carton pour le découper sur les 4 faces.","Il est possible de régler par l\'IHM la profondeur de découpe et sa hauteur par rapport au-dessus du carton. La solution peut être couplée à une lecture de code colis, intégrant un code caractérisant ces paramétrages de découpe.","Suivant la cadence, une deuxième piste de convoyage est possible pour alterner les découpes de chaque côté du pied robot.\\nUn système de retrait du dessus des colis est possible par l\'ajout d\'un manipulateur en sortie de poste de découpe.\\nCette solution est déclinée en une version spécifique pour l\'ouverture de blister de flacons."],"Texts2":["- Réduction de la pénibilité opérateur et des TMS (Troubles Musculo Squelettiques) : élimination du port de charges lourdes et des mouvements répétés du corps.","- Réduction des risques d\'accident du travail, surtout liés à l\'utilisation de cutter pouvant provoquer des coupures aux mains.","- Fiabilisation des opérations de découpe pour ne pas endommager le produit contenu à l\'intérieur (qualité) et potentielle augmentation de la cadence ligne."]},{"Title":"Palettisation hétérogène","Header":"La solution répond à un besoin de constitution de palettes de colis multiformats.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/4 - Palettisation hétérogène fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Palettisation hétérogène.jpg"},"Texts1":["- Algorithme de calcul pour plan de palettisation selon des critères personnalisables (poids, orientation,…),","- Robot de picking des cartons,","- Tour de stockage automatisée."],"Texts2":["- Suppression des ports de charges lourdes et diminution de la pénibilité.","- Sécurisation des flux.","- Optimisation de la production.","- Amélioration de l’empreinte carbone transport."]},{"Title":"Cobot’Ease Storage, solution qui exécute vos opérations de stockage","Header":"La solution répond à un besoin de stockage de colis en automatique, pour réaliser de la préparation de commande.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/3 - COBOT EASE STORAGE/cobotease-storage fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Cobot\'Ease Storage.jpg"},"Texts1":["Les colis arrivent par un convoyeur et sont stockés en attendant l\'ordre de sortie ou de palettisation.\\nCette mise en stock tampon permet d’attendre d\'avoir l\'ensemble des cartons d\'un ordre de palettisation et ainsi d\'optimiser au maximum la position des cartons sur la palette finale. Cela pour permettre une palettisation hétérogène (avec des cartons de différentes dimensions).\\nLa machine est autonome.","Notre solution Cobot’Ease Storage répond à ces différents cas d\'usage en standard.\\nLa manipulation des cartons du convoyeur vers le stockage est réalisée en automatique par un (des) robot(s).","Le tri dans le stockeur est réalisé par un automate qui connait la dimension des colis et réalise l\'affectation des colis dans chaque tiroir pour optimiser l\'espace occupé.","Le stockage est réalisé par une armoire MODULA, permettant de ranger des plateaux à la verticale (hauteur maximum de 15 mètres, largeur d\'un tiroir maximum de 4 mètres)."],"Texts2":["- Réduction de la place au sol pour les industriels.","- Optimisation des plans de palettisation pour de la palettisation homogène et hétérogène.","- Potentielle optimisation du transport de vide dans les cartons (optimisation de la taille des cartons suivant leur contenu)."]},{"Title":"Manufacturing Execution System","Header":null,"Subtitle1":null,"Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":null,"Texts1":["Le MES (Manufacturing Execution System) est un logiciel qui orchestre toutes les opérations de production. Il offre plusieurs fonctionnalités, qui seront explicitées en annexes, mais dans le cadre du Showroom 4.0, quatre fonctionnalités ont été retenues :","1. Gestion des ordres de fabrication \\n2. Acquisition des données \\n3. Calcul du TRS : Le Taux de Rendement \\n4. Qualité en cours de production"," La solution adoptée pour ce cas d\'utilisation est le MES AVEVA (Model Driven), qui permet la création de vues, de formulaires MES et de workflows associés.","Equans digital est certifié ENDORSED, le plus haut niveau de partenariat pour les produits AVEVA, ce qui en fait l\'un des trois seuls intégrateurs certifiés en France jusqu\'à présent.","Equans digital également partenaire avec Ordinal Software pour intégrer la solution MES COOX.\\n"],"Texts2":["Le MES permet de piloter les opérations de production en fournissant des informations structurées et adaptées aux besoins des acteurs de l\'entreprise, et permettant la prise de décision sur la base de données variées, précises et à jour."]},{"Title":"Cockpit hypervision","Header":"L’hyperviseur permet d’assurer une supervision globale du showroom.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/7 - Cockpit hypervision fr en es.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Hypervision.jpg"},"Texts1":["Son interface utilisateur permet de centraliser les informations des différents systèmes critiques (Cyber protection de l’installation, analyse IA des colis, indicateur de performance du dispositif…) et de suivi de production (Ordres de Fabrication exécutés, journal des évènements, impact global sur la santé et la sécurité du personnel, sur l’environnement …).​","L’hyperviseur propose un cockpit qui permet :​","-    Analyser la chaine de production (Anomalies détectées chaque jour par le dispositif de Computer Vision, historique de la performance enregistrée) ;\\n-    De piloter certains équipements ou systèmes (Démarrer/arrêter un OF, acquitter une alarme, …) ;​\\n-    De rien rediriger l’utilisateur vers le système le plus efficient (Accéder à l’ensemble des outils d’analyse d’une intrusion réseau <Seckiot>, au MES, au dispositif de réalité augmentée).​","Une authentification centralisée permet d’accéder à l’ensemble des sources de données disponibles dans l’usine. Ainsi, à tout moment, l’utilisateur dispose des informations nécessaires pour surveiller et piloter l’installation.​","Son architecture est basée sur une architecture décentralisée, avec à la base des webservices (API -(Application Programming Interface), permettant l’échange des données entre systèmes.​","Les informations présentées, leur agencement, sont adaptables / configurables de façon personnalisée pour chaque client."],"Texts2":["- Conservation des outils métiers et des supervisions au service des experts métier.","- Création d’une Hypervision / vue consolidée :","        - Prise de hauteur.\\n        - Analyse des situations, croisement multi-facteurs.\\n        - Compréhension des dysfonctionnements.\\n        - Identification des gisements de performance.\\n        - Amélioration de la performance globale."]},{"Title":"Cybersécurité","Header":null,"Subtitle1":"Solutions techniques mises en oeuvre :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":null,"ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/9 - Cybersécurité/Cybersécurité fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Cybersécurité.jpg"},"Texts1":["Equans Digital propose, avec son partenaire Seckiot, une solution de cybersécurité spécialisée pour les systèmes industriels et XIOT, ciblant plusieurs secteurs d\'activité incluant l\'industrie manufacturière, l\'énergie, les transports, et les infrastructures critiques.","Elle est conçue pour cartographier et surveiller en temps réel ces systèmes afin de détecter et de prévenir les anomalies et les intrusions, garantissant ainsi la sécurité et l\'optimisation de la gestion des infrastructures critiques industrielles.","   - Sécurisation des infrastructures critiques \\n - Optimisation de la gestion des infrastructures \\n - Détection et prévention des anomalies et intrusions\\n - Conformité réglementaire ","Solutions techniques mises en œuvre : ","   - Cartographie et surveillance continue​ \\n - Détection d’intrusions et d’anomalies ​ \\n - Analyse approfondie et gestion des risques​","En résumé, notre partenaire SECKIOT utilise des techniques avancées de cartographie et de détection pour offrir une surveillance continue et une protection proactive des systèmes industriels et XIOT. ​"],"Texts2":["- Visibilité et contrôle accrus\\n- Sécurité renforcée \\n- Performance opérationnelle","La solution assure une visibilité complète, une meilleure gestion des ressources, et une réactivité accrue face aux menaces, tout en aidant les entreprises à se conformer aux exigences réglementaires.​"]},{"Title":"Cobot (Robotique collaborative)","Header":"Cette solution permet au robot de travailler aux côtés des humains dans un environnement partagé.","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":[{"Source":"images/Montargis/poi/cobot/cobot 1.jpg","WidthInPixels":450,"HeightInPixels":300}],"VideoInfo":null,"Texts1":["La machine peut réaliser de la palettisation ou de la dépalettisation. Le robot et son préhenseur seront adaptés au type de contenant, à son poids et aux tailles de palettes. Les colis sont généralement de dimensions identiques et répétables.","La machine est déplaçable et transportable. La caméra intégrée permet d\'effectuer des opérations visuelles d\'inspection et de mesure.","En fonction des tâches à accomplir, le temps de cycle peut varier. La cadence max est de 3 déposes/min (hors chargement de palette) et les charges manipulées peuvent aller jusqu\'à 12 kg (avec préhenseur).","Des capteurs et des dispositifs de sécurité d\'arrêt d\'urgence sont intégrés à la solution pour éviter tout accident avec les opérateurs ainsi que des fonctions de réduction de la vitesse en cas de présence humaine.","Un logiciel Equans de création de plans de palettisation est intégré."],"Texts2":["-    Interactions possible avec les opérateurs et assistance dans la réalisation de certaines tâches\\n-    Réduction de la pénibilité opérateur et des TMS (Troubles Musculo-Squelettiques)\\n-    Facilité d\'intégration aux systèmes existants\\n-    Adaptation et reconfigration simple dans différentes lignes de production"]},{"Title":"Mobil’Ease, solution qui automatise vos transferts","Header":"Cette solution répond à un besoin d ‘assistance au déplacement de charges lourdes.\\nLes robots sont des AMR (autonomous mobile robots) aussi dits AIV (autonomous intelligent vehicles).","Subtitle1":"Principe de fonctionnement :","Subtitle2":"Les bénéfices majeurs de cette solution :","Footnote":"Cette solution est certifiée, d’un point de vue sécurité, par un organisme de contrôle agréé : Bureau Veritas","ImageSourceAndSize":null,"Images2":null,"VideoInfo":{"VideoUrl":"videos/Montargis/poi/5 - MOBILEASE/mobilease fr.mp4","ThumbnailUrl":"images/Montargis/thumbnails/Miniature Mobil\'Ease.jpg"},"Texts1":["En mode automatique, les robots répondent à des missions de chargement ou déchargement, communiqué par le gestionnaire de flotte (Fleet Manager). Ils sont libres de se déplacer suivant les zones apprises et autorisées et avec les paramètres de navigation définis (vitesse, accélération, signalisation, sens de circulation, etc.).","En mode \\"Follow-Me\\", l\'opérateur peut prendre la main sur un robot, mettant en pause la mission automatique, pour qu\'il le suive dans ses déplacements et lui permette de l\'aider dans ses missions de picking.\\n"],"Texts2":["- Réduction de la pénibilité opérateur et des TMS (Troubles Musculo Squelettiques) : élimination du port de charges lourdes et des mouvements répétés du corps.","- Réduction des risques d\'accident du travail, du fait de ne plus à avoir à manipuler les colis (coupure aux mains, risque chute de poids sur les pieds).","- Déchargement ou chargement automatique de machines (colis et palettes).","- Optimisation des déplacements.","- Adaptation à différents environnements.","- Intéraction possibles avec les opérateurs."]}]}]}');

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(10043));
/******/ }
]);