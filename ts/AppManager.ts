/// <reference path="./typings/babylon.d.ts" />
/// <reference path="PBRinfo.ts" />
/// <reference path="ViewManager.ts" />

class AppManager {

    //*************************************************** MEMBERS ******************************************************

    public static Instance: AppManager;

    // Base Babylon members
    private _scene: BABYLON.Scene;
    private _engine: BABYLON.Engine;
    private _userCamera: BABYLON.ArcRotateCamera;
    private _viewManager: ViewManager;

    private _isDebugLayerDisplayed = false;

    private _HDR: string[];
    private _skybox: BABYLON.HDRCubeTexture;
    private _skyboxMesh: BABYLON.Mesh;

    private _PBRinfos: PBRinfo[] = [];
    private _focusedMesh: string;

    private _lights: BABYLON.HemisphericLight[] = [];


    //*************************************************** GET / SET ****************************************************

    public get canvas(): HTMLElement {
        return this._scene.getEngine().getRenderingCanvas();
    }
    public get scene(): BABYLON.Scene {
        return this._scene;
    }
    public get engine(): BABYLON.Engine {
        return this._engine;
    }

    public get PBR(): PBRinfo {
        return this._PBRinfos[this._focusedMesh];
    }

    //*************************************************** CONSTRUCTOR **************************************************

    constructor() {
        AppManager.Instance = this;
    }

    public init(canvasName: string) {
        this._viewManager = new ViewManager(this);

        // Get the canvas
        let canvas = <HTMLCanvasElement>document.getElementById(canvasName);

        // Create the Babylon engine
        this._engine = new BABYLON.Engine(canvas, true);

        // Create the scene and the background color
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);


        // Camera
        this._userCamera = new BABYLON.ArcRotateCamera("zoomCamera", -Math.PI / 4, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), this._scene);
        this._userCamera.minZ = 0.001;
        this._userCamera.attachControl(this.canvas, true);

        // Skybox
        this.createSkyBox();


        // Render Loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        // Resize
        window.addEventListener("resize", () => {
            this._engine.resize();
        });
        this._engine.resize();
    }


    //*************************************************** FUNCTIONS ****************************************************

    public loadFile(content: string) {
        this.loadModel(content, (names) => {
            this._viewManager.init(names);
        });
    }

    public selectMesh(name: string) {

        this._focusedMesh = name;

        this._userCamera.zoomOn([<BABYLON.AbstractMesh>this._scene.getMeshByName(name)], true);
        this._userCamera.wheelPrecision = 2500 / this._userCamera.radius;

        // this._userCamera.setTarget(this._scene.getMeshByName(name).position);
        // this._userCamera.radius = this._scene.getMeshByName(name).getBoundingInfo().boundingSphere.radius * 1.5;
    }

    public toggleDebugLayer(force?: boolean) {
        this._isDebugLayerDisplayed = force || !this._isDebugLayerDisplayed;

        if(this._isDebugLayerDisplayed) this._scene.debugLayer.show();
        else this._scene.debugLayer.hide();
    }

    // ----------------------------- LOADING / SKYBOX / INITIALIZATION / DISPOSING -----------------------------

    /**
     * Create the skybox
     */
    private createSkyBox() {

        this._HDR = [];

        this.addHDR("./assets/hdr/harbor.hdr", "Harbor");
        this.addHDR("./assets/hdr/normandy.hdr", "Normandy");
        this.addHDR("./assets/hdr/room.hdr", "Room");

        this.selectHDR("Harbor");
    }

    /**
     * Load models
     */
    private loadModel(content: string, callback: Function) {
        BABYLON.SceneLoader.ImportMesh("", "", "data:" + content, this._scene, (meshes) => {

            let names = [];

            meshes.forEach((mesh) => {
                if (!mesh.material) mesh.material = new BABYLON.StandardMaterial("standardMat", this._scene);
                this._PBRinfos[mesh.name] = new PBRinfo();
                names.push(mesh.name);
            });

            this._userCamera.zoomOn(meshes, true);
            this._userCamera.wheelPrecision = 2500 / this._userCamera.radius;

            names.sort((nameA, nameB) => { return nameA < nameB ? -1 : 1; });
            callback(names);
        });
    }


    // ----------------------------- LIGHTS -----------------------------

    public addLight(type: string, callback: Function) {
        let newLight = new BABYLON.HemisphericLight("hemi_light_" + (this._lights.length - 1).toString(), new BABYLON.Vector3(0, 1, 0), this._scene);
        this._lights.push(newLight);

        callback((this._lights.length - 1).toString());
    }
    public removeLight(id: string) {
        this._lights[Number(id)].dispose();
        this._lights[Number(id)] = null;
    }
    public modifLight(id: string, param: string, key: string, svalue: string) {
        let value = Number(svalue);

        if (param == "intensity") (<BABYLON.HemisphericLight>this._lights[id]).intensity = value;
        else if (param == "orientation") (<BABYLON.HemisphericLight>this._lights[id]).direction[key] = value;

        else {
            if(key == "x") key = "r";
            else if(key == "y") key = "g";
            else if(key == "z") key = "b";
            value /= 255;
        }

        if (param == "diffuse") (<BABYLON.HemisphericLight>this._lights[id]).diffuse[key] = value;
        else if (param == "ground") (<BABYLON.HemisphericLight>this._lights[id]).groundColor[key] = value;
        else if (param == "specular") (<BABYLON.HemisphericLight>this._lights[id]).specular[key] = value;
    }

    // ----------------------------- HDR -----------------------------

    public addHDR(content: string, name: string) {
        this._HDR[name] = content;

        let names: string[] = [];
        for(let key in this._HDR) { names.push(key); }
        names.sort((a, b) => {
            if(a < b) return -1;
            else if(a > b) return 1;
            else return 0;
        })

        this._viewManager.updateHDRList(names);
    }
    public selectHDR(name: string) {
        if(this._skybox) this._skybox.dispose();

        // Environment Texture
        this._skybox = new BABYLON.HDRCubeTexture(this._HDR[name], this._scene, 512);
      
        var exposure = 0.6;
        var contrast = 1.6;

        if(this._skyboxMesh) {
            (<BABYLON.PBRMaterial>this._skyboxMesh.material).reflectionTexture.dispose();
            this._skyboxMesh.material.dispose();
            this._skyboxMesh.dispose();
        }

        // Skybox
        this._skyboxMesh = BABYLON.Mesh.CreateBox("hdrSkyBox", 1000.0, this._scene);
        var hdrSkyboxMaterial = new BABYLON.PBRMaterial("skyBox", this._scene);
        hdrSkyboxMaterial.backFaceCulling = false;
        hdrSkyboxMaterial.reflectionTexture = this._skybox.clone();
        hdrSkyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        hdrSkyboxMaterial.microSurface = 1.0;
        hdrSkyboxMaterial.cameraExposure = exposure;
        hdrSkyboxMaterial.cameraContrast = contrast;
        hdrSkyboxMaterial.disableLighting = true;
        this._skyboxMesh.material = hdrSkyboxMaterial;
        this._skyboxMesh.infiniteDistance = true;

        for(let key in this._PBRinfos) {
            this._PBRinfos[key].PBRmat.reflectionTexture = this._skybox;
        };

        this._viewManager.selectHDRvalue(name);
    }

    // ----------------------------- MATERIALS -----------------------------

    /**
     * Set the PBR type
     * @param PBRtype Metalness or Specular
     */
    public setPBRType(PBRtype: string) {

        if(this._scene.getMeshByName(this._focusedMesh).material) {
            this._scene.getMeshByName(this._focusedMesh).material.dispose();
        }
        if (this.PBR.PBRmat) this.PBR.PBRmat.dispose();

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
    }

    public setCameraContrast(power: number) {
        this.PBR.cameraContrast = power;
        this.PBR.PBRmat.cameraContrast = power;
    }
    public setCameraExposure(power: number) {
        this.PBR.cameraExposure = power;
        this.PBR.PBRmat.cameraExposure = power;
    }
    public setMaterialOpacity(power: number) {
        this.PBR.materialOpacity = power;
        this.PBR.PBRmat.alpha = power;
    }
    public setLightDirect(power: number) {
        this.PBR.lightDirect = power;
        this.PBR.PBRmat.directIntensity = power;
    }
    public setLightEnvironment(power: number) {
        this.PBR.lightEnvironment = power;
        this.PBR.PBRmat.environmentIntensity = power;
    }

    public setTextureAO(content: string, name?: string) {
        this.PBR.textureAOName = name || "";
        this.PBR.textureAO = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.ambientTexture = this.PBR.textureAO;
    }
    public setTextureAlbedo(content: string, name?: string) {
        this.PBR.textureAlbedoName = name || "";
        this.PBR.textureAlbedo = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.albedoTexture = this.PBR.textureAlbedo;
    }
    public setTextureEmissive(content: string, name?: string) {
        this.PBR.textureEmissiveName = name || "";
        this.PBR.textureEmissive = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.emissiveTexture = this.PBR.textureEmissive;
    }
    public setTextureMetallic(content: string, name?: string) {
        this.PBR.textureMetallicName = name || "";
        this.PBR.textureMetallic = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.metallicTexture = this.PBR.textureMetallic;
    }
    public setTextureNormal(content: string, name?: string) {
        this.PBR.textureNormalName = name || "";
        this.PBR.textureNormal = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.bumpTexture = this.PBR.textureNormal;
    }
    public setTextureRoughness(content: string, name?: string) {
        this.PBR.textureRoughnessName = name || "";
        this.PBR.textureRoughness = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.microSurfaceTexture = this.PBR.textureRoughness;
    }
    public setTextureSpecular(content: string, name?: string) {
        this.PBR.textureSpecularName = name || "";
        this.PBR.textureSpecular = new BABYLON.Texture(content, this._scene);
        this.PBR.PBRmat.reflectivityTexture = this.PBR.textureSpecular;
    }

    public setPowerEmissive(power: number) {
        this.PBR.powerEmissive = power;
        this.PBR.PBRmat.emissiveIntensity = power;
    }
    public setPowerReflection(power: number) {
        this.PBR.powerReflection = power;
        this.PBR.PBRmat.reflectionColor = new BABYLON.Color3(power, power, power);
    }
    public setPowerRoughness(power: number) {
        this.PBR.powerRoughness = power;
        this.PBR.PBRmat.microSurface = power;
    }
    public setPowerSpecular(power: number) {
        this.PBR.powerSpecular = power;
        this.PBR.PBRmat.reflectivityColor = new BABYLON.Color3(power, power, power);
    }


    // ----------------------------- GET BABYLON EASY PBR IMPORT -----------------------------

    public getJSONsave(fileName: string) {

        let finalObject = [];
        let PBR: PBRinfo;

        for (let key in this._PBRinfos) {
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

        let a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(finalObject)], { type: "application/json" }));
        a.download = fileName + ".bepi";
        a.click();
    }
}