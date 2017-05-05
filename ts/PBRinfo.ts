class PBRinfo {

    public PBRmat: BABYLON.PBRMaterial;

    public type: string;

    public cameraContrast: number = 1;
    public cameraExposure: number = 1;
    public materialOpacity: number = 1;
    public lightDirect: number = 1;
    public lightEnvironment: number = 1;

    public textureAO: BABYLON.Texture;
    public textureAOName: string = "";
    public textureAlbedo: BABYLON.Texture;
    public textureAlbedoName: string = "";
    public textureEmissive: BABYLON.Texture;
    public textureEmissiveName: string = "";
    public textureMetallic: BABYLON.Texture;
    public textureMetallicName: string = "";
    public textureNormal: BABYLON.Texture;
    public textureNormalName: string = "";
    public textureRoughness: BABYLON.Texture;
    public textureRoughnessName: string = "";
    public textureSpecular: BABYLON.Texture;
    public textureSpecularName: string = "";

    public powerEmissive: number = 1;
    public powerReflection: number = 0;
    public powerRoughness: number = .9;
    public powerSpecular: number = 1;

    constructor() {
        this.type = "";
        this.cameraExposure = 1;
        this.cameraContrast = 1;
        this.materialOpacity = 1;
        this.lightDirect = 1;
        this.lightEnvironment = 1;
        this.powerEmissive = 1;
        this.powerReflection = 0;
        this.powerRoughness = .9;
        this.powerSpecular = 1;
    }
}