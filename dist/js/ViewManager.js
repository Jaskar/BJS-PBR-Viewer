/// <reference path="./typings/babylon.d.ts" />
/// <reference path="AppManager.ts" />
var ViewManager = (function () {
    //*************************************************** CONSTRUCTOR **************************************************
    function ViewManager(appManager) {
        var _this = this;
        this._lightList = [];
        this.appManager = appManager;
        // Get the canvas html element
        this._canvasElement = document.getElementById("renderCanvas");
        // Left menu tabs
        var but_Textures = document.getElementById("leftBar_ButtonTextures");
        var tab_Textures = document.getElementById("leftBar_TabTextures");
        var but_Lights = document.getElementById("leftBar_ButtonLights");
        var tab_Lights = document.getElementById("leftBar_TabLights");
        var but_Skybox = document.getElementById("leftBar_ButtonSkybox");
        var tab_Skybox = document.getElementById("leftBar_TabSkybox");
        var but_Camera = document.getElementById("leftBar_ButtonCamera");
        var tab_Camera = document.getElementById("leftBar_TabCamera");
        var tab_hideAll = function () {
            but_Textures.classList.remove("activeTab");
            but_Lights.classList.remove("activeTab");
            but_Skybox.classList.remove("activeTab");
            but_Camera.classList.remove("activeTab");
            tab_Textures.style.display = "none";
            tab_Lights.style.display = "none";
            tab_Skybox.style.display = "none";
            tab_Camera.style.display = "none";
        };
        but_Lights.onclick = function (evt) {
            tab_hideAll();
            but_Lights.classList.add("activeTab");
            tab_Lights.style.display = "block";
        };
        but_Textures.onclick = function (evt) {
            tab_hideAll();
            but_Textures.classList.add("activeTab");
            tab_Textures.style.display = "block";
        };
        but_Skybox.onclick = function (evt) {
            tab_hideAll();
            but_Skybox.classList.add("activeTab");
            tab_Skybox.style.display = "block";
        };
        but_Camera.onclick = function (evt) {
            tab_hideAll();
            but_Camera.classList.add("activeTab");
            tab_Camera.style.display = "block";
        };
        var babylonFileInput = document.getElementById("inputBabylonFileMain");
        babylonFileInput.onchange = function (evt) {
            if (babylonFileInput.files[0]) {
                _this.loaderToggle(true);
                document.getElementById("inputBabylonFileMainDiv").style.display = "none";
                babylonFileInput.style.display = "none";
                var rdr = new FileReader();
                document.getElementById("topBar_Subtitle").innerText = babylonFileInput.files[0].name.substring(0, babylonFileInput.files[0].name.length - 8);
                rdr.readAsText(babylonFileInput.files[0]);
                rdr.onload = function (imgSrc) {
                    _this.appManager.loadFile(imgSrc.target.result);
                };
            }
        };
        document.getElementById("leftBar_ButtonTextures").click();
    }
    // Init the ViewManager
    ViewManager.prototype.init = function (names) {
        var _this = this;
        this.loaderToggle(false);
        // TOP BAR BUTTONS
        document.getElementById("topBar_debugLayer").onclick = function (evt) {
            _this.appManager.toggleDebugLayer();
        };
        document.getElementById("topBar_downloadJSCode").style.display = "inline-block";
        document.getElementById("topBar_downloadJSCode").onclick = function (evt) {
            _this.appManager.getJSsave(document.getElementById("topBar_Subtitle").innerText);
        };
        // document.getElementById("topBar_Save_BEPI").style.display = "inline-block";
        // document.getElementById("topBar_Save_BEPI").onclick = (evt) => {
        //     this.appManager.getJSONsave(document.getElementById("topBar_Subtitle").innerText);
        // };
        // LEFT TAB : LIGHT
        this._lightListDiv = document.getElementById("lbtLig_list");
        this._lightAddOne = document.getElementById("lbtLig_addOne");
        this._lightAddOne.style.display = "block";
        this._lightAddOne.onclick = function (evt) {
            _this.appManager.addLight("hemispheric", function (id) {
                _this.addLightToList(id);
            });
        };
        // LEFT TAB : SKYBOX
        this._skyList = document.getElementById("lbSky_Selection");
        this._skyList.oninput = function (evt) {
            _this.appManager.selectHDR(_this._skyList.value);
        };
        this._inputSky = document.getElementById("SkyInput");
        this._inputSky.onchange = function (evt) {
            if (_this._inputSky.files[0]) {
                var rdr = new FileReader();
                rdr.readAsDataURL(_this._inputSky.files[0]);
                rdr.onload = function (imgSrc) {
                    _this.appManager.addHDR(imgSrc.target.result, _this._inputSky.files[0].name);
                    _this.appManager.selectHDR(_this._inputSky.files[0].name);
                };
            }
        };
        document.getElementById("lbtSky_addOne").onclick = function (evt) {
            _this._inputSky.click();
        };
        // LEFT TAB : CAMERA
        document.getElementById("lbtCam_selectionButtons").style.display = "block";
        this._cameraSelectionArc = document.getElementById("lbtCam_selectionButtonArc");
        this._cameraDivArc = document.getElementById("lbtCam_infosArc");
        this._cameraSelectionFree = document.getElementById("lbtCam_selectionButtonFree");
        this._cameraDivFree = document.getElementById("lbtCam_infosFree");
        var hideCameraSelectionElements = function () {
            _this._cameraSelectionArc.classList.remove("activeButton");
            _this._cameraSelectionFree.classList.remove("activeButton");
            _this._cameraDivArc.style.display = "none";
            _this._cameraDivFree.style.display = "none";
        };
        var displayCameraSelectionArc = function () {
            _this._cameraSelectionArc.classList.add("activeButton");
            _this._cameraDivArc.style.display = "block";
        };
        var displayCameraSelectionFree = function () {
            _this._cameraSelectionFree.classList.add("activeButton");
            _this._cameraDivFree.style.display = "block";
        };
        this._cameraSelectionArc.onclick = function (evt) {
            hideCameraSelectionElements();
            displayCameraSelectionArc();
            _this.appManager.cameraChangeType("arc");
        };
        this._cameraSelectionFree.onclick = function (evt) {
            hideCameraSelectionElements();
            displayCameraSelectionFree();
            _this.appManager.cameraChangeType("free");
        };
        document.getElementById("lbtCam_infoAutoZoomArc").onclick = function (evt) {
            _this.appManager.cameraArcExpendZoom();
        };
        document.getElementById("lbtCam_infosArcRadius").oninput = function (evt) {
            _this.appManager.cameraArcSetProperty("radius", Number(evt.srcElement.value));
        };
        document.getElementById("lbtCam_infosArcWheel").oninput = function (evt) {
            _this.appManager.cameraArcSetProperty("wheel", Number(evt.srcElement.value));
        };
        this._canvasElement.addEventListener("mousewheel", function (evt) {
            _this.appManager.cameraArcUpdateRadius();
        });
        document.getElementById("lbtCam_infoAutoCenterFree").onclick = function (evt) {
            _this.appManager.cameraFreeExpendZoom();
        };
        document.getElementById("lbtCam_infosFreeSpeed").oninput = function (evt) {
            _this.appManager.cameraFreeSetProperty("speed", Number(evt.srcElement.value));
        };
        // LEFT TAB : MATERIAL
        document.getElementById("leftBar_TabTextures").style.display = "block";
        var hidePBRWorkflowElements = function () {
            _this._workflowMetallic.classList.remove("activeButton");
            _this._workflowSpecular.classList.remove("activeButton");
            _this._divAlbedo.style.display = "none";
            _this._divAO.style.display = "none";
            _this._divEmissive.style.display = "none";
            _this._divMetallic.style.display = "none";
            _this._divNormal.style.display = "none";
            _this._divRoughness.style.display = "none";
            _this._divSpecular.style.display = "none";
            // this._divPowerEmissive.style.display = "none";
            // this._divPowerReflection.style.display = "none";
            // this._divPowerRoughness.style.display = "none";
            // this._divPowerSpecular.style.display = "none";
            _this._divPowerCamContrast.style.display = "none";
            _this._divPowerCamExposure.style.display = "none";
            _this._divPowerOpacity.style.display = "none";
            _this._divPowerDirLight.style.display = "none";
            _this._divPowerEnvLight.style.display = "none";
        };
        var displayPBRMetallicWorkflowElements = function () {
            _this._workflowMetallic.classList.add("activeButton");
            _this._workflowSpecular.classList.remove("activeButton");
            _this._divAlbedo.style.display = "block";
            _this._divAO.style.display = "block";
            _this._divEmissive.style.display = "none";
            _this._divMetallic.style.display = "block";
            _this._divNormal.style.display = "block";
            _this._divRoughness.style.display = "block";
            _this._divSpecular.style.display = "none";
            // this._divPowerEmissive.style.display = "none";
            // this._divPowerReflection.style.display = "block";
            // this._divPowerRoughness.style.display = "block";
            // this._divPowerSpecular.style.display = "none";
            _this._divPowerCamContrast.style.display = "block";
            _this._divPowerCamExposure.style.display = "block";
            _this._divPowerOpacity.style.display = "block";
            _this._divPowerDirLight.style.display = "block";
            _this._divPowerEnvLight.style.display = "block";
        };
        var displayPBRSpecularWorkflowElements = function () {
            _this._workflowMetallic.classList.remove("activeButton");
            _this._workflowSpecular.classList.add("activeButton");
            _this._divAlbedo.style.display = "block";
            _this._divAO.style.display = "block";
            _this._divEmissive.style.display = "block";
            _this._divMetallic.style.display = "none";
            _this._divNormal.style.display = "block";
            _this._divRoughness.style.display = "block";
            _this._divSpecular.style.display = "block";
            // this._divPowerEmissive.style.display = "block";
            // this._divPowerReflection.style.display = "block";
            // this._divPowerRoughness.style.display = "block";
            // this._divPowerSpecular.style.display = "block";
            _this._divPowerCamContrast.style.display = "block";
            _this._divPowerCamExposure.style.display = "block";
            _this._divPowerOpacity.style.display = "block";
            _this._divPowerDirLight.style.display = "block";
            _this._divPowerEnvLight.style.display = "block";
        };
        // MESH SELECTION
        this._meshList = document.getElementById("lbTex_MeshSelection");
        this._meshList.innerHTML = "";
        names.forEach(function (name) {
            _this._meshList.innerHTML += "<option value='" + name + "'>" + name + "</option>";
        });
        this._meshList.oninput = function (evt) {
            _this.appManager.selectMesh(_this._meshList.value);
            _this._workflowMetallic.style.display = "inline-block";
            _this._workflowSpecular.style.display = "inline-block";
            if (_this.appManager.PBR.type == "metallic") {
                displayPBRMetallicWorkflowElements();
            }
            else if (_this.appManager.PBR.type == "specular") {
                displayPBRSpecularWorkflowElements();
            }
            else {
                hidePBRWorkflowElements();
            }
            _this._imgAO.src = "./assets/amiga.jpg";
            _this._imgAlbedo.src = "./assets/amiga.jpg";
            _this._imgMetallic.src = "./assets/amiga.jpg";
            _this._imgNormal.src = "./assets/amiga.jpg";
            _this._imgRoughness.src = "./assets/amiga.jpg";
            _this._imgSpecular.src = "./assets/amiga.jpg";
            _this._rangeCameraContrast.value = _this.appManager.PBR.cameraContrast.toString();
            _this._numberCameraContrast.innerText = _this.appManager.PBR.cameraContrast.toString();
            _this._rangeCameraExposure.value = _this.appManager.PBR.cameraExposure.toString();
            _this._numberCameraExposure.innerText = _this.appManager.PBR.cameraExposure.toString();
            _this._rangeLightDirect.value = _this.appManager.PBR.lightDirect.toString();
            _this._numberLightDirect.innerText = _this.appManager.PBR.lightDirect.toString();
            _this._rangeLightEnvironment.value = _this.appManager.PBR.lightEnvironment.toString();
            _this._numberLightEnvironment.innerText = _this.appManager.PBR.lightEnvironment.toString();
            _this._rangeOpacity.value = _this.appManager.PBR.materialOpacity.toString();
            _this._numberOpacity.innerText = _this.appManager.PBR.materialOpacity.toString();
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
        this._workflowMetallic = document.getElementById("lbtTex_WorkflowButtonMetallic");
        this._workflowMetallic.onclick = function (evt) {
            displayPBRMetallicWorkflowElements();
            _this.appManager.setPBRType("metallic");
        };
        this._workflowSpecular = document.getElementById("lbtTex_WorkflowButtonSpecular");
        this._workflowSpecular.onclick = function (evt) {
            displayPBRSpecularWorkflowElements();
            _this.appManager.setPBRType("specular");
        };
        // TEXTURES CHANGES
        this._imgAlbedo = document.getElementById("albedoImg");
        this._inputAlbedo = document.getElementById("albedoInput");
        this._inputAlbedo.onchange = function (evt) {
            if (_this._inputAlbedo.files[0]) {
                var rdr = new FileReader();
                rdr.readAsDataURL(_this._inputAlbedo.files[0]);
                rdr.onload = function (imgSrc) {
                    _this._imgAlbedo.src = imgSrc.target.result;
                    _this.appManager.setTextureAlbedo(imgSrc.target.result, _this._inputAlbedo.files[0].name);
                };
            }
        };
        this._imgAO = document.getElementById("aoImg");
        this._inputAO = document.getElementById("aoInput");
        this._inputAO.onchange = function (evt) {
            if (_this._inputAO.files[0]) {
                var rdr = new FileReader();
                rdr.readAsDataURL(_this._inputAO.files[0]);
                rdr.onload = function (imgSrc) {
                    _this._imgAO.src = imgSrc.target.result;
                    _this.appManager.setTextureAO(imgSrc.target.result, _this._inputAO.files[0].name);
                };
            }
        };
        this._imgEmissive = document.getElementById("emissiveImg");
        this._inputEmissive = document.getElementById("emissiveInput");
        this._inputEmissive.onchange = function (evt) {
            if (_this._inputEmissive.files[0]) {
                var rdr = new FileReader();
                rdr.readAsDataURL(_this._inputEmissive.files[0]);
                rdr.onload = function (imgSrc) {
                    _this._imgEmissive.src = imgSrc.target.result;
                    _this.appManager.setTextureEmissive(imgSrc.target.result, _this._inputEmissive.files[0].name);
                };
            }
        };
        this._imgMetallic = document.getElementById("metallicImg");
        this._inputMetallic = document.getElementById("metallicInput");
        this._inputMetallic.onchange = function (evt) {
            if (_this._inputMetallic.files[0]) {
                var rdr = new FileReader();
                rdr.readAsDataURL(_this._inputMetallic.files[0]);
                rdr.onload = function (imgSrc) {
                    _this._imgMetallic.src = imgSrc.target.result;
                    _this.appManager.setTextureMetallic(imgSrc.target.result, _this._inputMetallic.files[0].name);
                };
            }
        };
        this._imgNormal = document.getElementById("normalImg");
        this._inputNormal = document.getElementById("normalInput");
        this._inputNormal.onchange = function (evt) {
            if (_this._inputNormal.files[0]) {
                var rdr = new FileReader();
                rdr.readAsDataURL(_this._inputNormal.files[0]);
                rdr.onload = function (imgSrc) {
                    _this._imgNormal.src = imgSrc.target.result;
                    _this.appManager.setTextureNormal(imgSrc.target.result, _this._inputNormal.files[0].name);
                };
            }
        };
        this._imgRoughness = document.getElementById("roughnessImg");
        this._inputRoughness = document.getElementById("roughnessInput");
        this._inputRoughness.onchange = function (evt) {
            if (_this._inputRoughness.files[0]) {
                var rdr = new FileReader();
                rdr.readAsDataURL(_this._inputRoughness.files[0]);
                rdr.onload = function (imgSrc) {
                    _this._imgRoughness.src = imgSrc.target.result;
                    _this.appManager.setTextureRoughness(imgSrc.target.result, _this._inputRoughness.files[0].name);
                };
            }
        };
        this._imgSpecular = document.getElementById("specularImg");
        this._inputSpecular = document.getElementById("specularInput");
        this._inputSpecular.onchange = function (evt) {
            if (_this._inputSpecular.files[0]) {
                var rdr = new FileReader();
                rdr.readAsDataURL(_this._inputSpecular.files[0]);
                rdr.onload = function (imgSrc) {
                    _this._imgSpecular.src = imgSrc.target.result;
                    _this.appManager.setTextureSpecular(imgSrc.target.result, _this._inputSpecular.files[0].name);
                };
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
        this._numberCameraContrast = document.getElementById("contrastValue");
        this._rangeCameraContrast = document.getElementById("contrastRange");
        this._rangeCameraContrast.oninput = function (evt) {
            _this._numberCameraContrast.innerText = _this._rangeCameraContrast.value;
            _this.appManager.setCameraContrast(Number(_this._rangeCameraContrast.value));
        };
        this._numberCameraExposure = document.getElementById("exposureValue");
        this._rangeCameraExposure = document.getElementById("exposureRange");
        this._rangeCameraExposure.oninput = function (evt) {
            _this._numberCameraExposure.innerText = _this._rangeCameraExposure.value;
            _this.appManager.setCameraExposure(Number(_this._rangeCameraExposure.value));
        };
        this._numberOpacity = document.getElementById("opacityValue");
        this._rangeOpacity = document.getElementById("opacityRange");
        this._rangeOpacity.oninput = function (evt) {
            _this._numberOpacity.innerText = _this._rangeOpacity.value;
            _this.appManager.setMaterialOpacity(Number(_this._rangeOpacity.value));
        };
        this._numberLightDirect = document.getElementById("lDirectValue");
        this._rangeLightDirect = document.getElementById("lDirectRange");
        this._rangeLightDirect.oninput = function (evt) {
            _this._numberLightDirect.innerText = _this._rangeLightDirect.value;
            _this.appManager.setLightDirect(Number(_this._rangeLightDirect.value));
        };
        this._numberLightEnvironment = document.getElementById("lEnvValue");
        this._rangeLightEnvironment = document.getElementById("lEnvRange");
        this._rangeLightEnvironment.oninput = function (evt) {
            _this._numberLightEnvironment.innerText = _this._rangeLightEnvironment.value;
            _this.appManager.setLightEnvironment(Number(_this._rangeLightEnvironment.value));
        };
        document.getElementById("leftBar_ButtonTextures").click();
    };
    // ----------------------------- LOADER -----------------------------
    ViewManager.prototype.loaderToggle = function (onOff) {
        if (onOff == true)
            document.getElementById("inputBabylonLoader").style.display = "block";
        else
            document.getElementById("inputBabylonLoader").style.display = "none";
    };
    // ----------------------------- LIGHTS -----------------------------
    ViewManager.prototype.addLightToList = function (id) {
        var _this = this;
        var div = document.createElement("div");
        div.classList.add("lbtLig_list_div");
        div.id = "lbtLig_list_div_" + id;
        var divName = document.createElement("div");
        divName.className = "lbtLig_list_name";
        divName.innerHTML = "<div class='lbt_divLabel'>Name :</div>Hemispheric light n°" + id;
        var imgDel = document.createElement("img");
        imgDel.className = "lbtLig_list_delete";
        imgDel.src = "./img/icon_delete.png";
        imgDel.onclick = function (evt) { _this.removeLight(id); };
        var divIntensity = document.createElement("div");
        divIntensity.className = "lbt_divLabel";
        divIntensity.innerText = "Intensity";
        var inIntensity = document.createElement("input");
        inIntensity.className = "lbt_inputVec3";
        inIntensity.type = "number";
        inIntensity.type = "number";
        inIntensity.step = "0.05";
        inIntensity.min = "0";
        inIntensity.max = "1";
        inIntensity.value = "1";
        inIntensity.onchange = function (evt) { _this.appManager.modifLight(id, "intensity", "", inIntensity.value); };
        var divOrientation = document.createElement("div");
        divOrientation.className = "lbt_divLabel";
        divOrientation.innerText = "Orentation";
        var divOrientationInputs = document.createElement("div");
        divOrientationInputs.className = "lbt_inputVec3Div";
        var inX = document.createElement("input");
        inX.className = "lbt_inputVec3";
        inX.type = "number";
        inX.value = "0";
        inX.onchange = function (evt) { _this.appManager.modifLight(id, "orientation", "x", inX.value); };
        var inY = document.createElement("input");
        inY.className = "lbt_inputVec3";
        inY.type = "number";
        inY.value = "1";
        inY.onchange = function (evt) { _this.appManager.modifLight(id, "orientation", "y", inY.value); };
        var inZ = document.createElement("input");
        inZ.className = "lbt_inputVec3";
        inZ.type = "number";
        inZ.value = "0";
        inZ.onchange = function (evt) { _this.appManager.modifLight(id, "orientation", "z", inZ.value); };
        divOrientationInputs.appendChild(inX);
        divOrientationInputs.appendChild(inY);
        divOrientationInputs.appendChild(inZ);
        var divDiffuse = document.createElement("div");
        divDiffuse.className = "lbt_divLabel";
        divDiffuse.innerText = "Diffuse color";
        var divDiffuseInputs = document.createElement("div");
        divDiffuseInputs.className = "lbt_inputVec3Div";
        var dinX = document.createElement("input");
        dinX.className = "lbt_inputVec3";
        dinX.type = "number";
        dinX.value = "255";
        dinX.step = "1";
        dinX.min = "0";
        dinX.max = "255";
        dinX.onchange = function (evt) { _this.appManager.modifLight(id, "diffuse", "x", dinX.value); };
        var dinY = document.createElement("input");
        dinY.className = "lbt_inputVec3";
        dinY.type = "number";
        dinY.value = "255";
        dinY.step = "1";
        dinY.min = "0";
        dinY.max = "255";
        dinY.onchange = function (evt) { _this.appManager.modifLight(id, "diffuse", "y", dinY.value); };
        var dinZ = document.createElement("input");
        dinZ.className = "lbt_inputVec3";
        dinZ.type = "number";
        dinZ.value = "255";
        dinZ.step = "1";
        dinZ.min = "0";
        dinZ.max = "255";
        dinZ.onchange = function (evt) { _this.appManager.modifLight(id, "diffuse", "z", dinZ.value); };
        divDiffuseInputs.appendChild(dinX);
        divDiffuseInputs.appendChild(dinY);
        divDiffuseInputs.appendChild(dinZ);
        var divGround = document.createElement("div");
        divGround.className = "lbt_divLabel";
        divGround.innerText = "Ground color";
        var divGroundInputs = document.createElement("div");
        divGroundInputs.className = "lbt_inputVec3Div";
        var ginX = document.createElement("input");
        ginX.className = "lbt_inputVec3";
        ginX.type = "number";
        ginX.value = "0";
        ginX.step = "1";
        ginX.min = "0";
        ginX.max = "255";
        ginX.onchange = function (evt) { _this.appManager.modifLight(id, "ground", "x", ginX.value); };
        var ginY = document.createElement("input");
        ginY.className = "lbt_inputVec3";
        ginY.type = "number";
        ginY.value = "0";
        ginY.step = "1";
        ginY.min = "0";
        ginY.max = "255";
        ginY.onchange = function (evt) { _this.appManager.modifLight(id, "ground", "y", ginY.value); };
        var ginZ = document.createElement("input");
        ginZ.className = "lbt_inputVec3";
        ginZ.type = "number";
        ginZ.value = "0";
        ginZ.step = "1";
        ginZ.min = "0";
        ginZ.max = "255";
        ginZ.onchange = function (evt) { _this.appManager.modifLight(id, "ground", "z", ginZ.value); };
        divGroundInputs.appendChild(ginX);
        divGroundInputs.appendChild(ginY);
        divGroundInputs.appendChild(ginZ);
        var divSpecular = document.createElement("div");
        divSpecular.className = "lbt_divLabel";
        divSpecular.innerText = "Specular color";
        var divSpecularInputs = document.createElement("div");
        divSpecularInputs.className = "lbt_inputVec3Div";
        var sinX = document.createElement("input");
        sinX.className = "lbt_inputVec3";
        sinX.type = "number";
        sinX.value = "255";
        sinX.step = "1";
        sinX.min = "0";
        sinX.max = "255";
        sinX.onchange = function (evt) { _this.appManager.modifLight(id, "specular", "x", sinX.value); };
        var sinY = document.createElement("input");
        sinY.className = "lbt_inputVec3";
        sinY.type = "number";
        sinY.value = "255";
        sinY.step = "1";
        sinY.min = "0";
        sinY.max = "255";
        sinY.onchange = function (evt) { _this.appManager.modifLight(id, "specular", "y", sinY.value); };
        var sinZ = document.createElement("input");
        sinZ.className = "lbt_inputVec3";
        sinZ.type = "number";
        sinZ.value = "255";
        sinZ.step = "1";
        sinZ.min = "0";
        sinZ.max = "255";
        sinZ.onchange = function (evt) { _this.appManager.modifLight(id, "specular", "z", sinZ.value); };
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
    };
    ViewManager.prototype.removeLight = function (id) {
        document.getElementById("lbtLig_list_div_" + id).remove();
        this.appManager.removeLight(id);
    };
    // ----------------------------- HDR -----------------------------
    ViewManager.prototype.selectHDRvalue = function (name) {
        document.getElementById("lbSky_Selection").value = name;
    };
    ViewManager.prototype.updateHDRList = function (names) {
        document.getElementById("lbSky_Selection").innerHTML = "";
        names.forEach(function (name) {
            document.getElementById("lbSky_Selection").innerHTML += "<option value='" + name + "'>" + name + "</>";
        });
    };
    // ----------------------------- LIGHTS -----------------------------
    ViewManager.prototype.updateCameraInfo = function (camType, type, value) {
        document.getElementById("lbtCam_infos" + camType + type).value = (Math.round(value * 100) / 100).toFixed(2).toString();
    };
    return ViewManager;
}());
//# sourceMappingURL=ViewManager.js.map