/// <reference path="./typings/babylon.d.ts" />
/// <reference path="AppManager.ts" />

class ViewManager {

    //*************************************************** MEMBERS ******************************************************

    private appManager: AppManager;

    private _canvasElement: HTMLElement;
    private _meshList: HTMLSelectElement;


    // LIGHTS

    private _lightAddOne: HTMLElement;
    private _lightListDiv: HTMLElement;
    private _lightList: HTMLElement[] = [];

    // SKYBOX

    private _skyList: HTMLSelectElement;
    private _inputSky: HTMLInputElement;

    // MATERIALS

    private _workflowMetallic: HTMLElement;
    private _workflowSpecular: HTMLElement;

    private _divAlbedo: HTMLElement;
    private _divAO: HTMLElement;
    private _divEmissive: HTMLElement;
    private _divMetallic: HTMLElement;
    private _divNormal: HTMLElement;
    private _divRoughness: HTMLElement;
    private _divSpecular: HTMLElement;

    private _inputAlbedo: HTMLInputElement;
    private _inputAO: HTMLInputElement;
    private _inputEmissive: HTMLInputElement;
    private _inputMetallic: HTMLInputElement;
    private _inputNormal: HTMLInputElement;
    private _inputRoughness: HTMLInputElement;
    private _inputSpecular: HTMLInputElement;

    private _imgAlbedo: HTMLImageElement;
    private _imgAO: HTMLImageElement;
    private _imgEmissive: HTMLImageElement;
    private _imgMetallic: HTMLImageElement;
    private _imgNormal: HTMLImageElement;
    private _imgRoughness: HTMLImageElement;
    private _imgSpecular: HTMLImageElement;


    // private _divPowerEmissive: HTMLElement;
    // private _divPowerReflection: HTMLElement;
    // private _divPowerRoughness: HTMLElement;
    // private _divPowerSpecular: HTMLElement;
    private _divPowerCamContrast: HTMLElement;
    private _divPowerCamExposure: HTMLElement;
    private _divPowerOpacity: HTMLElement;
    private _divPowerDirLight: HTMLElement;
    private _divPowerEnvLight: HTMLElement;

    // private _rangeEmissive: HTMLInputElement;
    // private _numberEmissive: HTMLInputElement;
    // private _rangeReflection: HTMLInputElement;
    // private _numberReflection: HTMLInputElement;
    // private _rangeRoughness: HTMLInputElement;
    // private _numberRoughness: HTMLInputElement;
    // private _rangeSpecular: HTMLInputElement;
    // private _numberSpecular: HTMLInputElement;
    private _rangeOpacity: HTMLInputElement;
    private _numberOpacity: HTMLInputElement;
    private _rangeCameraContrast: HTMLInputElement;
    private _numberCameraContrast: HTMLInputElement;
    private _rangeCameraExposure: HTMLInputElement;
    private _numberCameraExposure: HTMLInputElement;
    private _rangeLightDirect: HTMLInputElement;
    private _numberLightDirect: HTMLInputElement;
    private _rangeLightEnvironment: HTMLInputElement;
    private _numberLightEnvironment: HTMLInputElement;


    //*************************************************** CONSTRUCTOR **************************************************

    constructor(appManager: AppManager) {

        this.appManager = appManager;

        // Get the canvas html element
        this._canvasElement = document.getElementById("renderCanvas");


        // Left menu tabs

        let but_Lights = document.getElementById("leftBar_ButtonLights");
        let but_Textures = document.getElementById("leftBar_ButtonTextures");
        let but_Skybox = document.getElementById("leftBar_ButtonSkybox");
        let tab_Lights = document.getElementById("leftBar_TabLights");
        let tab_Textures = document.getElementById("leftBar_TabTextures");
        let tab_Skybox = document.getElementById("leftBar_TabSkybox");

        let tab_hideAll = () => {
            but_Lights.classList.remove("activeTab");
            but_Textures.classList.remove("activeTab");
            but_Skybox.classList.remove("activeTab");

            tab_Lights.style.display = "none";
            tab_Textures.style.display = "none";
            tab_Skybox.style.display = "none";
        }

        but_Lights.onclick = (evt) => {
            tab_hideAll();
            but_Lights.classList.add("activeTab");
            tab_Lights.style.display = "block";
        }
        but_Textures.onclick = (evt) => {
            tab_hideAll();
            but_Textures.classList.add("activeTab");
            tab_Textures.style.display = "block";
        }
        but_Skybox.onclick = (evt) => {
            tab_hideAll();
            but_Skybox.classList.add("activeTab");
            tab_Skybox.style.display = "block";
        }


        let babylonFileInput = <HTMLInputElement>document.getElementById("inputBabylonFileMain");
        babylonFileInput.onchange = (evt) => {
            if (babylonFileInput.files[0]) {
                this.loaderToggle(true);

                document.getElementById("inputBabylonFileMainDiv").style.display = "none";
                babylonFileInput.style.display = "none";

                let rdr = new FileReader();

                document.getElementById("topBar_Subtitle").innerText = babylonFileInput.files[0].name.substring(0, babylonFileInput.files[0].name.length - 8);

                rdr.readAsText(babylonFileInput.files[0]);
                rdr.onload = (imgSrc) => {
                    this.appManager.loadFile((<any>imgSrc.target).result);
                }
            }
        };


        document.getElementById("leftBar_ButtonTextures").click();
    }

    // Init the ViewManager
    public init(names: string[]) {
        this.loaderToggle(false);

        // TOP BAR BUTTONS

        document.getElementById("topBar_debugLayer").onclick = (evt) => {
            this.appManager.toggleDebugLayer();
        };

        // document.getElementById("topBar_Save_BEPI").style.display = "inline-block";
        // document.getElementById("topBar_Save_BEPI").onclick = (evt) => {
        //     this.appManager.getJSONsave(document.getElementById("topBar_Subtitle").innerText);
        // };

        // LEFT TAB : LIGHT

        this._lightListDiv = document.getElementById("lbtLig_list");

        this._lightAddOne = document.getElementById("lbtLig_addOne");
        this._lightAddOne.style.display = "block";
        this._lightAddOne.onclick = (evt) => {
            this.appManager.addLight("hemispheric", (id) => {
                this.addLightToList(id);
            })
        };


        // LEFT TAB : SKYBOX

        this._skyList = <HTMLSelectElement>document.getElementById("lbSky_Selection");
        this._skyList.oninput = (evt) => {
            this.appManager.selectHDR(this._skyList.value);
        };
        
        this._inputSky = <HTMLInputElement>document.getElementById("SkyInput");
        this._inputSky.onchange = (evt) => {
            if (this._inputSky.files[0]) {
                let rdr = new FileReader();
                rdr.readAsDataURL(this._inputSky.files[0]);
                rdr.onload = (imgSrc) => {
                    this.appManager.addHDR((<any>imgSrc.target).result, this._inputSky.files[0].name);
                    this.appManager.selectHDR(this._inputSky.files[0].name);
                }
            }
        };
        document.getElementById("lbtSky_addOne").onclick = (evt) => {
            this._inputSky.click();
        };



        // LEFT TAB : MATERIAL

        document.getElementById("leftBar_TabTextures").style.display = "block";

        let hidePBRWorkflowElements = () => {
            this._workflowMetallic.classList.remove("activeButton");
            this._workflowSpecular.classList.remove("activeButton");

            this._divAlbedo.style.display = "none";
            this._divAO.style.display = "none";
            this._divEmissive.style.display = "none";
            this._divMetallic.style.display = "none";
            this._divNormal.style.display = "none";
            this._divRoughness.style.display = "none";
            this._divSpecular.style.display = "none";

            // this._divPowerEmissive.style.display = "none";
            // this._divPowerReflection.style.display = "none";
            // this._divPowerRoughness.style.display = "none";
            // this._divPowerSpecular.style.display = "none";
            this._divPowerCamContrast.style.display = "none";
            this._divPowerCamExposure.style.display = "none";
            this._divPowerOpacity.style.display = "none";
            this._divPowerDirLight.style.display = "none";
            this._divPowerEnvLight.style.display = "none";
        };
        let displayPBRMetallicWorkflowElements = () => {
            this._workflowMetallic.classList.add("activeButton");
            this._workflowSpecular.classList.remove("activeButton");

            this._divAlbedo.style.display = "block";
            this._divAO.style.display = "block";
            this._divEmissive.style.display = "none";
            this._divMetallic.style.display = "block";
            this._divNormal.style.display = "block";
            this._divRoughness.style.display = "block";
            this._divSpecular.style.display = "none";

            // this._divPowerEmissive.style.display = "none";
            // this._divPowerReflection.style.display = "block";
            // this._divPowerRoughness.style.display = "block";
            // this._divPowerSpecular.style.display = "none";
            this._divPowerCamContrast.style.display = "block";
            this._divPowerCamExposure.style.display = "block";
            this._divPowerOpacity.style.display = "block";
            this._divPowerDirLight.style.display = "block";
            this._divPowerEnvLight.style.display = "block";
        };
        let displayPBRSpecularWorkflowElements = () => {
            this._workflowMetallic.classList.remove("activeButton");
            this._workflowSpecular.classList.add("activeButton");

            this._divAlbedo.style.display = "block";
            this._divAO.style.display = "block";
            this._divEmissive.style.display = "block";
            this._divMetallic.style.display = "none";
            this._divNormal.style.display = "block";
            this._divRoughness.style.display = "block";
            this._divSpecular.style.display = "block";

            // this._divPowerEmissive.style.display = "block";
            // this._divPowerReflection.style.display = "block";
            // this._divPowerRoughness.style.display = "block";
            // this._divPowerSpecular.style.display = "block";
            this._divPowerCamContrast.style.display = "block";
            this._divPowerCamExposure.style.display = "block";
            this._divPowerOpacity.style.display = "block";
            this._divPowerDirLight.style.display = "block";
            this._divPowerEnvLight.style.display = "block";
        };

        // MESH SELECTION

        this._meshList = <HTMLSelectElement>document.getElementById("lbTex_MeshSelection");
        this._meshList.innerHTML = "";
        names.forEach((name) => {
            this._meshList.innerHTML += "<option value='" + name + "'>" + name + "</option>";
        });
        this._meshList.oninput = (evt) => {

            this.appManager.selectMesh(this._meshList.value);

            this._workflowMetallic.style.display = "inline-block";
            this._workflowSpecular.style.display = "inline-block";

            if (this.appManager.PBR.type == "metallic") {
                displayPBRMetallicWorkflowElements();
            }
            else if (this.appManager.PBR.type == "specular") {
                displayPBRSpecularWorkflowElements();
            }
            else {
                hidePBRWorkflowElements();
            }

            this._imgAO.src = "./assets/amiga.jpg";
            this._imgAlbedo.src = "./assets/amiga.jpg";
            this._imgMetallic.src = "./assets/amiga.jpg";
            this._imgNormal.src = "./assets/amiga.jpg";
            this._imgRoughness.src = "./assets/amiga.jpg";
            this._imgSpecular.src = "./assets/amiga.jpg";
            this._rangeCameraContrast.value = this.appManager.PBR.cameraContrast.toString();
            this._numberCameraContrast.innerText = this.appManager.PBR.cameraContrast.toString();
            this._rangeCameraExposure.value = this.appManager.PBR.cameraExposure.toString();
            this._numberCameraExposure.innerText = this.appManager.PBR.cameraExposure.toString();
            this._rangeLightDirect.value = this.appManager.PBR.lightDirect.toString();
            this._numberLightDirect.innerText = this.appManager.PBR.lightDirect.toString();
            this._rangeLightEnvironment.value = this.appManager.PBR.lightEnvironment.toString();
            this._numberLightEnvironment.innerText = this.appManager.PBR.lightEnvironment.toString();
            this._rangeOpacity.value = this.appManager.PBR.materialOpacity.toString();
            this._numberOpacity.innerText = this.appManager.PBR.materialOpacity.toString();
            // this._rangeEmissive.value = this.appManager.PBR.powerEmissive.toString();
            // this._numberEmissive.innerText = this.appManager.PBR.powerEmissive.toString();
            // this._rangeReflection.value = this.appManager.PBR.powerReflection.toString();
            // this._numberReflection.innerText = this.appManager.PBR.powerReflection.toString();
            // this._rangeRoughness.value = this.appManager.PBR.powerRoughness.toString();
            // this._numberRoughness.innerText = this.appManager.PBR.powerRoughness.toString();
            // this._rangeSpecular.value = this.appManager.PBR.powerSpecular.toString();
            // this._numberSpecular.innerText = this.appManager.PBR.powerSpecular.toString();
        };
        this._meshList.value = "";

        // TEXTURES DIVS

        this._divAlbedo = document.getElementById("lbtText_textureDivAlbedo");
        this._divAO = document.getElementById("lbtText_textureDivAO");
        this._divEmissive = document.getElementById("lbtText_textureDivEmissive");
        this._divMetallic = document.getElementById("lbtText_textureDivMetallic");
        this._divNormal = document.getElementById("lbtText_textureDivNormal");
        this._divRoughness = document.getElementById("lbtText_textureDivRoughness");
        this._divSpecular = document.getElementById("lbtText_textureDivSpecular");

        // POWER DIV

        // this._divPowerEmissive = document.getElementById("lbtText_rangeDivEmissive");
        // this._divPowerReflection = document.getElementById("lbtText_rangeDivReflection");
        // this._divPowerRoughness = document.getElementById("lbtText_rangeDivRoughness");
        // this._divPowerSpecular = document.getElementById("lbtText_rangeDivSpecular");
        this._divPowerCamContrast = document.getElementById("lbtText_rangeDivContrast");
        this._divPowerCamExposure = document.getElementById("lbtText_rangeDivExposure");
        this._divPowerOpacity = document.getElementById("lbtText_rangeDivOpacity");
        this._divPowerDirLight = document.getElementById("lbtText_rangeDivLDirect");
        this._divPowerEnvLight = document.getElementById("lbtText_rangeDivLEnv");


        // WORKFLOW CHANGE

        this._workflowMetallic = <HTMLElement>document.getElementById("lbtTex_WorkflowButtonMetallic");
        this._workflowMetallic.onclick = (evt) => {
            displayPBRMetallicWorkflowElements();
            this.appManager.setPBRType("metallic");
        };

        this._workflowSpecular = <HTMLElement>document.getElementById("lbtTex_WorkflowButtonSpecular");
        this._workflowSpecular.onclick = (evt) => {
            displayPBRSpecularWorkflowElements();
            this.appManager.setPBRType("specular");
        };


        // TEXTURES CHANGES

        this._imgAlbedo = <HTMLImageElement>document.getElementById("albedoImg");
        this._inputAlbedo = <HTMLInputElement>document.getElementById("albedoInput");
        this._inputAlbedo.onchange = (evt) => {
            if (this._inputAlbedo.files[0]) {
                let rdr = new FileReader();
                rdr.readAsDataURL(this._inputAlbedo.files[0]);
                rdr.onload = (imgSrc) => {
                    this._imgAlbedo.src = (<any>imgSrc.target).result;
                    this.appManager.setTextureAlbedo((<any>imgSrc.target).result, this._inputAlbedo.files[0].name);
                }
            }
        };

        this._imgAO = <HTMLImageElement>document.getElementById("aoImg");
        this._inputAO = <HTMLInputElement>document.getElementById("aoInput");
        this._inputAO.onchange = (evt) => {
            if (this._inputAO.files[0]) {
                let rdr = new FileReader();
                rdr.readAsDataURL(this._inputAO.files[0]);
                rdr.onload = (imgSrc) => {
                    this._imgAO.src = (<any>imgSrc.target).result;
                    this.appManager.setTextureAO((<any>imgSrc.target).result, this._inputAO.files[0].name);
                }
            }
        };

        this._imgEmissive = <HTMLImageElement>document.getElementById("emissiveImg");
        this._inputEmissive = <HTMLInputElement>document.getElementById("emissiveInput");
        this._inputEmissive.onchange = (evt) => {
            if (this._inputEmissive.files[0]) {
                let rdr = new FileReader();
                rdr.readAsDataURL(this._inputEmissive.files[0]);
                rdr.onload = (imgSrc) => {
                    this._imgEmissive.src = (<any>imgSrc.target).result;
                    this.appManager.setTextureEmissive((<any>imgSrc.target).result, this._inputEmissive.files[0].name);
                }
            }
        };

        this._imgMetallic = <HTMLImageElement>document.getElementById("metallicImg");
        this._inputMetallic = <HTMLInputElement>document.getElementById("metallicInput");
        this._inputMetallic.onchange = (evt) => {
            if (this._inputMetallic.files[0]) {
                let rdr = new FileReader();
                rdr.readAsDataURL(this._inputMetallic.files[0]);
                rdr.onload = (imgSrc) => {
                    this._imgMetallic.src = (<any>imgSrc.target).result;
                    this.appManager.setTextureMetallic((<any>imgSrc.target).result, this._inputMetallic.files[0].name);
                }
            }
        };

        this._imgNormal = <HTMLImageElement>document.getElementById("normalImg");
        this._inputNormal = <HTMLInputElement>document.getElementById("normalInput");
        this._inputNormal.onchange = (evt) => {
            if (this._inputNormal.files[0]) {
                let rdr = new FileReader();
                rdr.readAsDataURL(this._inputNormal.files[0]);
                rdr.onload = (imgSrc) => {
                    this._imgNormal.src = (<any>imgSrc.target).result;
                    this.appManager.setTextureNormal((<any>imgSrc.target).result, this._inputNormal.files[0].name);
                }
            }
        };

        this._imgRoughness = <HTMLImageElement>document.getElementById("roughnessImg");
        this._inputRoughness = <HTMLInputElement>document.getElementById("roughnessInput");
        this._inputRoughness.onchange = (evt) => {
            if (this._inputRoughness.files[0]) {
                let rdr = new FileReader();
                rdr.readAsDataURL(this._inputRoughness.files[0]);
                rdr.onload = (imgSrc) => {
                    this._imgRoughness.src = (<any>imgSrc.target).result;
                    this.appManager.setTextureRoughness((<any>imgSrc.target).result, this._inputRoughness.files[0].name);
                }
            }
        };

        this._imgSpecular = <HTMLImageElement>document.getElementById("specularImg");
        this._inputSpecular = <HTMLInputElement>document.getElementById("specularInput");
        this._inputSpecular.onchange = (evt) => {
            if (this._inputSpecular.files[0]) {
                let rdr = new FileReader();
                rdr.readAsDataURL(this._inputSpecular.files[0]);
                rdr.onload = (imgSrc) => {
                    this._imgSpecular.src = (<any>imgSrc.target).result;
                    this.appManager.setTextureSpecular((<any>imgSrc.target).result, this._inputSpecular.files[0].name);
                }
            }
        };


        // POWER CHANGES

        // this._numberEmissive = <HTMLInputElement>document.getElementById("emissiveValue");
        // this._rangeEmissive = <HTMLInputElement>document.getElementById("emissiveRange");
        // this._rangeEmissive.oninput = (evt) => {
        //     this._numberEmissive.innerText = this._rangeEmissive.value;
        //     this.appManager.setPowerEmissive(Number(this._rangeEmissive.value));
        // };

        // this._numberReflection = <HTMLInputElement>document.getElementById("reflectionValue");
        // this._rangeReflection = <HTMLInputElement>document.getElementById("reflectionRange");
        // this._rangeReflection.oninput = (evt) => {
        //     this._numberReflection.innerText = this._rangeReflection.value;
        //     this.appManager.setPowerReflection(Number(this._rangeReflection.value));
        // };

        // this._numberRoughness = <HTMLInputElement>document.getElementById("roughnessValue");
        // this._rangeRoughness = <HTMLInputElement>document.getElementById("roughnessRange");
        // this._rangeRoughness.oninput = (evt) => {
        //     this._numberRoughness.innerText = this._rangeRoughness.value;
        //     this.appManager.setPowerRoughness(Number(this._rangeRoughness.value));
        // };

        // this._numberSpecular = <HTMLInputElement>document.getElementById("specularValue");
        // this._rangeSpecular = <HTMLInputElement>document.getElementById("specularRange");
        // this._rangeSpecular.oninput = (evt) => {
        //     this._numberSpecular.innerText = this._rangeSpecular.value;
        //     this.appManager.setPowerSpecular(Number(this._rangeSpecular.value));
        // };

        this._numberCameraContrast = <HTMLInputElement>document.getElementById("contrastValue");
        this._rangeCameraContrast = <HTMLInputElement>document.getElementById("contrastRange");
        this._rangeCameraContrast.oninput = (evt) => {
            this._numberCameraContrast.innerText = this._rangeCameraContrast.value;
            this.appManager.setCameraContrast(Number(this._rangeCameraContrast.value));
        };

        this._numberCameraExposure = <HTMLInputElement>document.getElementById("exposureValue");
        this._rangeCameraExposure = <HTMLInputElement>document.getElementById("exposureRange");
        this._rangeCameraExposure.oninput = (evt) => {
            this._numberCameraExposure.innerText = this._rangeCameraExposure.value;
            this.appManager.setCameraExposure(Number(this._rangeCameraExposure.value));
        };

        this._numberOpacity = <HTMLInputElement>document.getElementById("opacityValue");
        this._rangeOpacity = <HTMLInputElement>document.getElementById("opacityRange");
        this._rangeOpacity.oninput = (evt) => {
            this._numberOpacity.innerText = this._rangeOpacity.value;
            this.appManager.setMaterialOpacity(Number(this._rangeOpacity.value));
        };

        this._numberLightDirect = <HTMLInputElement>document.getElementById("lDirectValue");
        this._rangeLightDirect = <HTMLInputElement>document.getElementById("lDirectRange");
        this._rangeLightDirect.oninput = (evt) => {
            this._numberLightDirect.innerText = this._rangeLightDirect.value;
            this.appManager.setLightDirect(Number(this._rangeLightDirect.value));
        };

        this._numberLightEnvironment = <HTMLInputElement>document.getElementById("lEnvValue");
        this._rangeLightEnvironment = <HTMLInputElement>document.getElementById("lEnvRange");
        this._rangeLightEnvironment.oninput = (evt) => {
            this._numberLightEnvironment.innerText = this._rangeLightEnvironment.value;
            this.appManager.setLightEnvironment(Number(this._rangeLightEnvironment.value));
        };

        document.getElementById("leftBar_ButtonTextures").click();
    }

    // ----------------------------- LOADER -----------------------------

    private loaderToggle(onOff: boolean) {
        if(onOff == true) document.getElementById("inputBabylonLoader").style.display = "block";
        else document.getElementById("inputBabylonLoader").style.display = "none";
    }

    // ----------------------------- LIGHTS -----------------------------

    public addLightToList(id: string) {

        let div = document.createElement("div");
        div.classList.add("lbtLig_list_div");
        div.id = "lbtLig_list_div_" + id;

        let divName = document.createElement("div");
        divName.className = "lbtLig_list_name";
        divName.innerHTML = "<div class='lbt_divLabel'>Name :</div>Hemispheric light n°" + id;

        let imgDel: HTMLImageElement = document.createElement("img");
        imgDel.className = "lbtLig_list_delete";
        imgDel.src = "./img/icon_delete.png";
        imgDel.onclick = (evt) => { this.removeLight(id); };

        let divIntensity = document.createElement("div");
        divIntensity.className = "lbt_divLabel";
        divIntensity.innerText = "Intensity";

        let inIntensity: HTMLInputElement = document.createElement("input");
        inIntensity.className = "lbt_inputVec3";
        inIntensity.type = "number";
        inIntensity.type = "number";
        inIntensity.step = "0.05";
        inIntensity.min = "0";
        inIntensity.max = "1";
        inIntensity.value = "1";
        inIntensity.onchange = (evt) => { this.appManager.modifLight(id, "intensity", "", inIntensity.value) };

        let divOrientation = document.createElement("div");
        divOrientation.className = "lbt_divLabel";
        divOrientation.innerText = "Orentation";

        let divOrientationInputs = document.createElement("div");
        divOrientationInputs.className = "lbt_inputVec3Div";

        let inX: HTMLInputElement = document.createElement("input");
        inX.className = "lbt_inputVec3";
        inX.type = "number";
        inX.value = "0";
        inX.onchange = (evt) => { this.appManager.modifLight(id, "orientation", "x", inX.value) };

        let inY: HTMLInputElement = document.createElement("input");
        inY.className = "lbt_inputVec3";
        inY.type = "number";
        inY.value = "1";
        inY.onchange = (evt) => { this.appManager.modifLight(id, "orientation", "y", inY.value) };

        let inZ: HTMLInputElement = document.createElement("input");
        inZ.className = "lbt_inputVec3";
        inZ.type = "number";
        inZ.value = "0";
        inZ.onchange = (evt) => { this.appManager.modifLight(id, "orientation", "z", inZ.value) };

        divOrientationInputs.appendChild(inX);
        divOrientationInputs.appendChild(inY);
        divOrientationInputs.appendChild(inZ);


        let divDiffuse = document.createElement("div");
        divDiffuse.className = "lbt_divLabel";
        divDiffuse.innerText = "Diffuse color";

        let divDiffuseInputs = document.createElement("div");
        divDiffuseInputs.className = "lbt_inputVec3Div";

        let dinX: HTMLInputElement = document.createElement("input");
        dinX.className = "lbt_inputVec3";
        dinX.type = "number";
        dinX.value = "255";
        dinX.step = "1";
        dinX.min = "0";
        dinX.max = "255";
        dinX.onchange = (evt) => { this.appManager.modifLight(id, "diffuse", "x", dinX.value) };

        let dinY: HTMLInputElement = document.createElement("input");
        dinY.className = "lbt_inputVec3";
        dinY.type = "number";
        dinY.value = "255";
        dinY.step = "1";
        dinY.min = "0";
        dinY.max = "255";
        dinY.onchange = (evt) => { this.appManager.modifLight(id, "diffuse", "y", dinY.value) };

        let dinZ: HTMLInputElement = document.createElement("input");
        dinZ.className = "lbt_inputVec3";
        dinZ.type = "number";
        dinZ.value = "255";
        dinZ.step = "1";
        dinZ.min = "0";
        dinZ.max = "255";
        dinZ.onchange = (evt) => { this.appManager.modifLight(id, "diffuse", "z", dinZ.value) };

        divDiffuseInputs.appendChild(dinX);
        divDiffuseInputs.appendChild(dinY);
        divDiffuseInputs.appendChild(dinZ);


        let divGround = document.createElement("div");
        divGround.className = "lbt_divLabel";
        divGround.innerText = "Ground color";

        let divGroundInputs = document.createElement("div");
        divGroundInputs.className = "lbt_inputVec3Div";

        let ginX: HTMLInputElement = document.createElement("input");
        ginX.className = "lbt_inputVec3";
        ginX.type = "number";
        ginX.value = "0";
        ginX.step = "1";
        ginX.min = "0";
        ginX.max = "255";
        ginX.onchange = (evt) => { this.appManager.modifLight(id, "ground", "x", ginX.value) };

        let ginY: HTMLInputElement = document.createElement("input");
        ginY.className = "lbt_inputVec3";
        ginY.type = "number";
        ginY.value = "0";
        ginY.step = "1";
        ginY.min = "0";
        ginY.max = "255";
        ginY.onchange = (evt) => { this.appManager.modifLight(id, "ground", "y", ginY.value) };

        let ginZ: HTMLInputElement = document.createElement("input");
        ginZ.className = "lbt_inputVec3";
        ginZ.type = "number";
        ginZ.value = "0";
        ginZ.step = "1";
        ginZ.min = "0";
        ginZ.max = "255";
        ginZ.onchange = (evt) => { this.appManager.modifLight(id, "ground", "z", ginZ.value) };

        divGroundInputs.appendChild(ginX);
        divGroundInputs.appendChild(ginY);
        divGroundInputs.appendChild(ginZ);


        let divSpecular = document.createElement("div");
        divSpecular.className = "lbt_divLabel";
        divSpecular.innerText = "Specular color";

        let divSpecularInputs = document.createElement("div");
        divSpecularInputs.className = "lbt_inputVec3Div";

        let sinX: HTMLInputElement = document.createElement("input");
        sinX.className = "lbt_inputVec3";
        sinX.type = "number";
        sinX.value = "255";
        sinX.step = "1";
        sinX.min = "0";
        sinX.max = "255";
        sinX.onchange = (evt) => { this.appManager.modifLight(id, "specular", "x", sinX.value) };

        let sinY: HTMLInputElement = document.createElement("input");
        sinY.className = "lbt_inputVec3";
        sinY.type = "number";
        sinY.value = "255";
        sinY.step = "1";
        sinY.min = "0";
        sinY.max = "255";
        sinY.onchange = (evt) => { this.appManager.modifLight(id, "specular", "y", sinY.value) };

        let sinZ: HTMLInputElement = document.createElement("input");
        sinZ.className = "lbt_inputVec3";
        sinZ.type = "number";
        sinZ.value = "255";
        sinZ.step = "1";
        sinZ.min = "0";
        sinZ.max = "255";
        sinZ.onchange = (evt) => { this.appManager.modifLight(id, "specular", "z", sinZ.value) };

        divSpecularInputs.appendChild(sinX);
        divSpecularInputs.appendChild(sinY);
        divSpecularInputs.appendChild(sinZ);


        div.appendChild(divName);
        div.appendChild(imgDel);
        div.appendChild(divIntensity);
        div.appendChild(inIntensity);
        div.appendChild(divOrientation);
        div.appendChild(divOrientationInputs);
        div.appendChild(divDiffuse);
        div.appendChild(divDiffuseInputs);
        div.appendChild(divGround);
        div.appendChild(divGroundInputs);
        div.appendChild(divSpecular);
        div.appendChild(divSpecularInputs);

        this._lightListDiv.appendChild(div);
    }
    public removeLight(id: string) {
        document.getElementById("lbtLig_list_div_" + id).remove();
        this.appManager.removeLight(id);
    }

    // ----------------------------- HDR -----------------------------

    public selectHDRvalue(name: string) {
        (<HTMLSelectElement>document.getElementById("lbSky_Selection")).value = name;
    }
    public updateHDRList(names: string[]) {
        document.getElementById("lbSky_Selection").innerHTML = "";

        names.forEach((name) => {
            document.getElementById("lbSky_Selection").innerHTML += "<option value='" + name + "'>" + name + "</>";
        });
    }
}