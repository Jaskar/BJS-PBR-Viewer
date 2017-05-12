/// <reference path="./typings/babylon.d.ts" />
/// <reference path="PBRinfo.ts" />
/// <reference path="ViewManager.ts" />
var AppManager = (function () {
    //*************************************************** CONSTRUCTOR **************************************************
    function AppManager() {
        this._isDebugLayerDisplayed = false;
        this._PBRinfos = [];
        this._lights = [];
        AppManager.Instance = this;
    }
    Object.defineProperty(AppManager.prototype, "canvas", {
        //*************************************************** GET / SET ****************************************************
        get: function () {
            return this._scene.getEngine().getRenderingCanvas();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppManager.prototype, "scene", {
        get: function () {
            return this._scene;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppManager.prototype, "engine", {
        get: function () {
            return this._engine;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppManager.prototype, "PBR", {
        get: function () {
            return this._PBRinfos[this._focusedMesh];
        },
        enumerable: true,
        configurable: true
    });
    AppManager.prototype.init = function (canvasName) {
        var _this = this;
        this._viewManager = new ViewManager(this);
        // Get the canvas
        var canvas = document.getElementById(canvasName);
        // Create the Babylon engine
        this._engine = new BABYLON.Engine(canvas, true);
        // Create the scene and the background color
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        // Camera
        this._userCamera = new BABYLON.ArcRotateCamera("arcUserCam", -Math.PI / 4, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), this._scene);
        this._userCamera.minZ = 0.001;
        this._userCamera.attachControl(this.canvas, true);
        // Skybox
        this.createSkyBox();
        // Render Loop
        this._engine.runRenderLoop(function () {
            _this._scene.render();
        });
        // Resize
        window.addEventListener("resize", function () {
            _this._engine.resize();
        });
        this._engine.resize();
    };
    //*************************************************** FUNCTIONS ****************************************************
    AppManager.prototype.loadFile = function (content) {
        var _this = this;
        this.loadModel(content, function (names) {
            _this._viewManager.init(names);
        });
    };
    AppManager.prototype.selectMesh = function (name) {
        this._focusedMesh = name;
        this._userCamera.zoomOn([this._scene.getMeshByName(name)], true);
        this._userCamera.wheelPrecision = 2500 / this._userCamera.radius;
    };
    AppManager.prototype.toggleDebugLayer = function (force) {
        this._isDebugLayerDisplayed = force || !this._isDebugLayerDisplayed;
        if (this._isDebugLayerDisplayed)
            this._scene.debugLayer.show();
        else
            this._scene.debugLayer.hide();
    };
    // ----------------------------- LOADING / SKYBOX / INITIALIZATION / DISPOSING -----------------------------
    /**
     * Create the skybox
     */
    AppManager.prototype.createSkyBox = function () {
        this._HDR = [];
        this.addHDR("./assets/hdr/harbor.hdr", "Harbor");
        this.addHDR("./assets/hdr/normandy.hdr", "Normandy");
        this.addHDR("./assets/hdr/room.hdr", "Room");
        this.selectHDR("Harbor");
    };
    /**
     * Load models
     */
    AppManager.prototype.loadModel = function (content, callback) {
        var _this = this;
        BABYLON.SceneLoader.ImportMesh("", "", "data:" + content, this._scene, function (meshes) {
            var names = [];
            meshes.forEach(function (mesh) {
                if (!mesh.material)
                    mesh.material = new BABYLON.StandardMaterial("standardMat", _this._scene);
                _this._PBRinfos[mesh.name] = new PBRinfo();
                names.push(mesh.name);
            });
            _this._userCamera.zoomOn(meshes, true);
            _this._userCamera.wheelPrecision = 2500 / _this._userCamera.radius;
            _this._viewManager.updateCameraInfo("Arc", "Radius", _this._userCamera.radius);
            _this._viewManager.updateCameraInfo("Arc", "Wheel", _this._userCamera.wheelPrecision);
            names.sort(function (nameA, nameB) { return nameA < nameB ? -1 : 1; });
            callback(names);
        });
    };
    // ----------------------------- CAMERA -----------------------------
    AppManager.prototype.cameraChangeType = function (type) {
        var sub = this._userCamera.name.substr(0, 3);
        var lastPosition = this._userCamera.position.clone();
        if (type == "arc" && this._userCamera.name.substr(0, 3) != "arc") {
            var position = this._userCamera.position;
            this._userCamera.dispose();
            this._userCamera = new BABYLON.ArcRotateCamera("arcUserCam", 0, 0, 0, lastPosition, this._scene);
            this._userCamera.minZ = 0.01;
            this._userCamera.attachControl(this.canvas, true);
            this.cameraArcExpendZoom();
        }
        else if (type == "free" && this._userCamera.name.substr(0, 3) != "fre") {
            var target = this._userCamera.target.clone();
            this._userCamera.dispose();
            this._userCamera = new BABYLON.FreeCamera("freUserCam", lastPosition, this._scene);
            this._userCamera.minZ = 0.01;
            this._userCamera.setTarget(target);
            this._userCamera.attachControl(this.canvas, true);
            this._viewManager.updateCameraInfo("Free", "Speed", this._userCamera.speed);
        }
    };
    AppManager.prototype.cameraArcExpendZoom = function () {
        var meshes = [];
        this._scene.meshes.forEach(function (mesh) {
            if (mesh.name != "hdrSkybox")
                meshes.push(mesh);
        });
        this._userCamera.zoomOn(meshes, true);
        this._userCamera.wheelPrecision = 2500 / this._userCamera.radius;
        this._viewManager.updateCameraInfo("Arc", "Radius", this._userCamera.radius);
        this._viewManager.updateCameraInfo("Arc", "Wheel", this._userCamera.wheelPrecision);
    };
    AppManager.prototype.cameraArcSetProperty = function (type, value) {
        if (type == "radius")
            this._userCamera.radius = value;
        else if (type == "wheel")
            this._userCamera.wheelPrecision = value;
    };
    AppManager.prototype.cameraArcUpdateRadius = function () {
        this._viewManager.updateCameraInfo("Arc", "Radius", this._userCamera.radius);
    };
    AppManager.prototype.cameraFreeExpendZoom = function () {
        this._userCamera.position = BABYLON.Vector3.Zero();
        this._userCamera.rotation = BABYLON.Vector3.Zero();
    };
    AppManager.prototype.cameraFreeSetProperty = function (type, value) {
        if (type == "speed")
            this._userCamera.speed = value;
    };
    // ----------------------------- LIGHTS -----------------------------
    AppManager.prototype.addLight = function (type, callback) {
        var newLight = new BABYLON.HemisphericLight("hemi_light_" + (this._lights.length - 1).toString(), new BABYLON.Vector3(0, 1, 0), this._scene);
        this._lights.push(newLight);
        callback((this._lights.length - 1).toString());
    };
    AppManager.prototype.removeLight = function (id) {
        this._lights[Number(id)].dispose();
        this._lights[Number(id)] = null;
    };
    AppManager.prototype.modifLight = function (id, param, key, svalue) {
        var value = Number(svalue);
        if (param == "intensity")
            this._lights[id].intensity = value;
        else if (param == "orientation")
            this._lights[id].direction[key] = value;
        else {
            if (key == "x")
                key = "r";
            else if (key == "y")
                key = "g";
            else if (key == "z")
                key = "b";
            value /= 255;
        }
        if (param == "diffuse")
            this._lights[id].diffuse[key] = value;
        else if (param == "ground")
            this._lights[id].groundColor[key] = value;
        else if (param == "specular")
            this._lights[id].specular[key] = value;
    };
    // ----------------------------- HDR -----------------------------
    AppManager.prototype.addHDR = function (content, name) {
        this._HDR[name] = content;
        var names = [];
        for (var key in this._HDR) {
            names.push(key);
        }
        names.sort(function (a, b) {
            if (a < b)
                return -1;
            else if (a > b)
                return 1;
            else
                return 0;
        });
        this._viewManager.updateHDRList(names);
    };
    AppManager.prototype.selectHDR = function (name) {
        if (this._skybox)
            this._skybox.dispose();
        // Environment Texture
        this._skybox = new BABYLON.HDRCubeTexture(this._HDR[name], this._scene, 512);
        var exposure = 0.6;
        var contrast = 1.6;
        if (this._skyboxMesh) {
            this._skyboxMesh.material.reflectionTexture.dispose();
            this._skyboxMesh.material.dispose();
            this._skyboxMesh.dispose();
        }
        // Skybox
        this._skyboxMesh = BABYLON.Mesh.CreateBox("hdrSkybox", 1000.0, this._scene);
        var hdrSkyboxMaterial = new BABYLON.PBRMaterial("skybox", this._scene);
        hdrSkyboxMaterial.backFaceCulling = false;
        hdrSkyboxMaterial.reflectionTexture = this._skybox.clone();
        hdrSkyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        hdrSkyboxMaterial.microSurface = 1.0;
        hdrSkyboxMaterial.cameraExposure = exposure;
        hdrSkyboxMaterial.cameraContrast = contrast;
        hdrSkyboxMaterial.disableLighting = true;
        this._skyboxMesh.material = hdrSkyboxMaterial;
        this._skyboxMesh.infiniteDistance = true;
        for (var key in this._PBRinfos) {
            this._PBRinfos[key].PBRmat.reflectionTexture = this._skybox;
        }
        ;
        this._viewManager.selectHDRvalue(name);
    };
    // ----------------------------- MATERIALS -----------------------------
    /**
     * Set the PBR type
     * @param PBRtype Metalness or Specular
     */
    AppManager.prototype.setPBRType = function (PBRtype) {
        if (this._scene.getMeshByName(this._focusedMesh).material) {
            this._scene.getMeshByName(this._focusedMesh).material.dispose();
        }
        if (this.PBR.PBRmat)
            this.PBR.PBRmat.dispose();
        this.PBR.PBRmat = new BABYLON.PBRMaterial("PBRmat", this._scene);
        this.PBR.type = PBRtype;
        this.PBR.PBRmat.reflectionTexture = this._skybox;
        this.PBR.PBRmat.cameraContrast = this.PBR.cameraContrast;
        this.PBR.PBRmat.cameraExposure = this.PBR.cameraExposure;
        this.PBR.PBRmat.alpha = this.PBR.materialOpacity;
        this.PBR.PBRmat.directIntensity = this.PBR.lightDirect;
        this.PBR.PBRmat.environmentIntensity = this.PBR.lightEnvironment;
        this._scene.getMeshByName(this._focusedMesh).material = this.PBR.PBRmat;
        if (PBRtype == "specular") {
            this.PBR.PBRmat.ambientTexture = this.PBR.textureAO;
            this.PBR.PBRmat.albedoTexture = this.PBR.textureAlbedo;
            this.PBR.PBRmat.bumpTexture = this.PBR.textureNormal;
            this.PBR.PBRmat.emissiveTexture = this.PBR.textureEmissive;
            this.PBR.PBRmat.microSurfaceTexture = this.PBR.textureRoughness;
            this.PBR.PBRmat.reflectivityTexture = this.PBR.textureSpecular;
            this.setPowerReflection(this.PBR.powerReflection);
            this.setPowerRoughness(this.PBR.powerRoughness);
            this.setPowerSpecular(this.PBR.powerSpecular);
        }
        else if (PBRtype == "metallic") {
            this.PBR.PBRmat.ambientTexture = this.PBR.textureAO;
            this.PBR.PBRmat.albedoTexture = this.PBR.textureAlbedo;
            this.PBR.PBRmat.metallicTexture = this.PBR.textureMetallic;
            this.PBR.PBRmat.bumpTexture = this.PBR.textureNormal;
            this.PBR.PBRmat.microSurfaceTexture = this.PBR.textureRoughness;
            this.setPowerReflection(this.PBR.powerReflection);
            this.setPowerRoughness(this.PBR.powerRoughness);
        }
    };
    AppManager.prototype.setCameraContrast = function (power) {
        this.PBR.cameraContrast = power;
        this.PBR.PBRmat.cameraContrast = power;
    };
    AppManager.prototype.setCameraExposure = function (power) {
        this.PBR.cameraExposure = power;
        this.PBR.PBRmat.cameraExposure = power;
    };
    AppManager.prototype.setMaterialOpacity = function (power) {
        this.PBR.materialOpacity = power;
        this.PBR.PBRmat.alpha = power;
    };
    AppManager.prototype.setLightDirect = function (power) {
        this.PBR.lightDirect = power;
        this.PBR.PBRmat.directIntensity = power;
    };
    AppManager.prototype.setLightEnvironment = function (power) {
        this.PBR.lightEnvironment = power;
        this.PBR.PBRmat.environmentIntensity = power;
    };
    AppManager.prototype.setTextureAO = function (content, name) {
        this.PBR.textureAOName = name || "";
        this.PBR.textureAO = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.ambientTexture = this.PBR.textureAO;
    };
    AppManager.prototype.setTextureAlbedo = function (content, name) {
        this.PBR.textureAlbedoName = name || "";
        this.PBR.textureAlbedo = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.albedoTexture = this.PBR.textureAlbedo;
    };
    AppManager.prototype.setTextureEmissive = function (content, name) {
        this.PBR.textureEmissiveName = name || "";
        this.PBR.textureEmissive = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.emissiveTexture = this.PBR.textureEmissive;
    };
    AppManager.prototype.setTextureMetallic = function (content, name) {
        this.PBR.textureMetallicName = name || "";
        this.PBR.textureMetallic = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.metallicTexture = this.PBR.textureMetallic;
    };
    AppManager.prototype.setTextureNormal = function (content, name) {
        this.PBR.textureNormalName = name || "";
        this.PBR.textureNormal = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.bumpTexture = this.PBR.textureNormal;
    };
    AppManager.prototype.setTextureRoughness = function (content, name) {
        this.PBR.textureRoughnessName = name || "";
        this.PBR.textureRoughness = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.microSurfaceTexture = this.PBR.textureRoughness;
    };
    AppManager.prototype.setTextureSpecular = function (content, name) {
        this.PBR.textureSpecularName = name || "";
        this.PBR.textureSpecular = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.reflectivityTexture = this.PBR.textureSpecular;
    };
    AppManager.prototype.setPowerEmissive = function (power) {
        this.PBR.powerEmissive = power;
        this.PBR.PBRmat.emissiveIntensity = power;
    };
    AppManager.prototype.setPowerReflection = function (power) {
        this.PBR.powerReflection = power;
        this.PBR.PBRmat.reflectionColor = new BABYLON.Color3(power, power, power);
    };
    AppManager.prototype.setPowerRoughness = function (power) {
        this.PBR.powerRoughness = power;
        this.PBR.PBRmat.microSurface = power;
    };
    AppManager.prototype.setPowerSpecular = function (power) {
        this.PBR.powerSpecular = power;
        this.PBR.PBRmat.reflectivityColor = new BABYLON.Color3(power, power, power);
    };
    // ----------------------------- GET BABYLON CODE -----------------------------
    AppManager.prototype.getJSONsave = function (fileName) {
        var finalObject = [];
        var PBR;
        for (var key in this._PBRinfos) {
            PBR = this._PBRinfos[key];
            finalObject.push({
                name: key,
                cameraContrast: PBR.cameraContrast,
                cameraExposure: PBR.cameraExposure,
                materialOpacity: PBR.materialOpacity,
                lightDirect: PBR.lightDirect,
                lightEnvironment: PBR.lightEnvironment,
                textureAOName: PBR.textureAOName,
                textureAlbedoName: PBR.textureAlbedoName,
                textureEmissiveName: PBR.textureEmissiveName,
                textureMetallicName: PBR.textureMetallicName,
                textureNormalName: PBR.textureNormalName,
                textureRoughnessName: PBR.textureRoughnessName,
                textureSpecularName: PBR.textureSpecularName
                // powerEmissive: PBR.powerEmissive,
                // powerReflection: PBR.powerReflection,
                // powerRoughness: PBR.powerRoughness,
                // powerSpecular: PBR.powerSpecular
            });
        }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(finalObject)], { type: "application/json" }));
        a.download = fileName + ".bepi";
        a.click();
    };
    AppManager.prototype.getJSsave = function (fileName) {
        var br = "\r\n";
        var finalCode = "/* --------------------------------------" + br +
            " * Code generated by PBR Material Viewer" + br +
            "----------------------------------------- */" + br + br;
        var PBR;
        var lightCount = 0;
        this._lights.forEach(function (light) {
            if (light == null)
                return;
            var lightName = "hemi_" + lightCount;
            finalCode += br;
            finalCode += "// Hemispheric light " + lightCount + br;
            finalCode += "var " + lightName + " = new BABYLON.HemisphericLight(\"hemi_" + lightCount + "\", new BABYLON.Vector3("
                + light.direction.x + ","
                + light.direction.y + ","
                + light.direction.z + ")"
                + ", scene);" + br;
            finalCode += lightName + ".intensity = " + light.intensity + ";" + br;
            finalCode += lightName + ".diffuse = new BABYLON.Color3("
                + light.diffuse.r + ","
                + light.diffuse.g + ","
                + light.diffuse.b + ");" + br;
            finalCode += lightName + ".groundColor = new BABYLON.Color3("
                + light.groundColor.r + ","
                + light.groundColor.g + ","
                + light.groundColor.b + ");" + br;
            finalCode += lightName + ".specular = new BABYLON.Color3("
                + light.specular.r + ","
                + light.specular.g + ","
                + light.specular.b + ");" + br;
            lightCount++;
        });
        if (this._lights.length > 0)
            finalCode += br;
        for (var key in this._PBRinfos) {
            PBR = this._PBRinfos[key];
            if (PBR.type == "")
                continue;
            var matName = key + "PBRmat";
            finalCode += br;
            finalCode += "// Material for object : " + key + br;
            finalCode += "var " + matName + " = new BABYLON.PBRMaterial(\"" + key + "PBRmat\", myScene);" + br;
            finalCode += "scene.getMeshByName(\"" + key + "\").material = " + matName + ";";
            if (PBR.type == "specular") {
                finalCode += matName + ".reflectionColor = new BABYLON.Vector3(" + PBR.powerReflection + "," + PBR.powerReflection + "," + PBR.powerReflection + ");" + br;
                finalCode += matName + ".microSurface = " + PBR.powerRoughness + br;
                finalCode += matName + ".reflectivityColor = new BABYLON.Vector3(" + PBR.powerSpecular + "," + PBR.powerSpecular + "," + PBR.powerSpecular + ");" + br;
                if (PBR.textureAlbedoName != "") {
                    finalCode += "var albedoTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureAlbedoName + "\");" + br;
                    finalCode += matName + ".albedoTexture = albedoTex;" + br;
                }
                if (PBR.textureAOName != "") {
                    finalCode += "var ambientTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureAOName + "\");" + br;
                    finalCode += matName + ".ambientTexture = ambientTex;" + br;
                }
                if (PBR.textureNormalName != "") {
                    finalCode += "var bumpTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureNormalName + "\");" + br;
                    finalCode += matName + ".bumpTexture = bumpTex;" + br;
                }
                if (PBR.textureEmissiveName != "") {
                    finalCode += "var emissiveTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureEmissiveName + "\");" + br;
                    finalCode += matName + ".emissiveTexture = emissiveTex;" + br;
                }
                if (PBR.textureRoughnessName != "") {
                    finalCode += "var microSurfaceTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureRoughnessName + "\");" + br;
                    finalCode += matName + ".microSurfaceTexture = microSurfaceTex;" + br;
                }
                if (PBR.textureSpecularName != "") {
                    finalCode += "var reflectivityTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureSpecularName + "\");" + br;
                    finalCode += matName + ".reflectivityTexture = reflectivityTex;" + br;
                }
            }
            else if (PBR.type == "metallic") {
                finalCode += matName + ".reflectionColor = new BABYLON.Vector3(" + PBR.powerReflection + "," + PBR.powerReflection + "," + PBR.powerReflection + ");" + br;
                finalCode += matName + ".microSurface = " + PBR.powerRoughness + br;
                if (PBR.textureAlbedoName != "") {
                    finalCode += "var albedoTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureAlbedoName + "\");" + br;
                    finalCode += matName + ".albedoTexture = albedoTex;" + br;
                }
                if (PBR.textureAOName != "") {
                    finalCode += "var ambientTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureAlbedoName + "\");" + br;
                    finalCode += matName + ".ambientTexture = ambientTex;" + br;
                }
                if (PBR.textureNormalName != "") {
                    finalCode += "var bumpTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureNormalName + "\");" + br;
                    finalCode += matName + ".bumpTexture = bumpTex;" + br;
                }
                if (PBR.textureMetallicName != "") {
                    finalCode += "var metallicTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureMetallicName + "\");" + br;
                    finalCode += matName + ".metallicTexture = metallicTex;" + br;
                }
                if (PBR.textureRoughnessName != "") {
                    finalCode += "var microSurfaceTex = new BABYLON.Texture(\"/assets/" + key + "/" + PBR.textureRoughnessName + "\");" + br;
                    finalCode += matName + ".microSurfaceTexture = microSurfaceTex;" + br;
                }
            }
            finalCode += matName + ".reflectionTexture = mySkybox;" + br;
            finalCode += matName + ".cameraContrast = " + PBR.cameraContrast + ";" + br;
            finalCode += matName + ".cameraExposure = " + PBR.cameraExposure + ";" + br;
            finalCode += matName + ".alpha = " + PBR.materialOpacity + ";" + br;
            finalCode += matName + ".directIntensity = " + PBR.lightDirect + ";" + br;
            finalCode += matName + ".environmentIntensity = " + PBR.lightEnvironment + ";" + br;
        }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([finalCode], { type: "text/plain" }));
        a.download = fileName + ".js";
        a.click();
    };
    return AppManager;
}());
//# sourceMappingURL=AppManager.js.map