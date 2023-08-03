import {
  Component,
  ElementRef,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  Scene,
  Texture,
  Vector3,
} from '@babylonjs/core';

import * as BABYLON from '@babylonjs/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  @Output() engine!: Engine;
  @Output() scene!: Scene;
  @Output() camera!: FreeCamera;

  materialFormatData: any = [
    { name: 'albedoColor', type: 'Color3', value: '' },
    {
      name: 'albedoTexture',
      type: 'Texture',
      isTextureEnabled: false,
      value: '',
    },
    { name: 'uScale', parent: 'albedoTexture', type: 'Number', value: '' },
    { name: 'vScale', parent: 'albedoTexture', type: 'Number', value: '' },
    {
      name: 'bumpTexture',
      type: 'Texture',
      isTextureEnabled: false,
      value: '',
    },

    { name: 'uScale', parent: 'bumpTexture', type: 'Number', value: '' },
    { name: 'vScale', parent: 'bumpTexture', type: 'Number', value: '' },

    { name: 'isEnabled', parent: 'clearCoat', type: 'boolean', value: '' },
    { name: 'metallic', parent: 'clearCoat', type: 'Number', value: '0' },
    { name: 'roughness', parent: 'clearCoat', type: 'Number', value: '1' },
    { name: 'intensity', parent: 'clearCoat', type: 'Number', value: '1' },

    // {
    //   name: 'clearCoat',
    //   type: 'clearCoat',
    //   child: [
    //     { name: 'metallic', type: 'Number', value: '0' },
    //     { name: 'roughness  ', type: 'Number', value: '1' },
    //     { name: 'isEnabled', type: 'boolean', value: false },
    //     { name: 'intensity ', type: 'Number', value: '1' },
    //   ],
    // },

    { name: 'unlit', type: 'boolean', value: '' },
  ];

  currMaterialData: any = [];

  SelectedObj_MaterialJson: any = [];

  selectedObj: any = null;

  constructor() {}

  ngOnInit(): void {
    this.engine = new Engine(this.canvas.nativeElement, true);
    this.scene = new Scene(this.engine);

    // creating camera
    this.camera = this.createCamera(this.scene);

    // allow mouse deplacement
    this.camera.attachControl(this.canvas.nativeElement, true);

    // creating minimal scean
    this.createScene(this.scene, this.canvas.nativeElement);

    // running babylonJS
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    this.scene.onPointerObservable.add((pointerInfo: any) => {
      switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
          //alert(1);

          if (pointerInfo.pickInfo.pickedMesh) {
            this.selectedObj = pointerInfo.pickInfo.pickedMesh;
            // alert(pointerInfo.pickInfo.pickedMesh.name);
            let formatArray = JSON.stringify(this.materialFormatData);
            this.currMaterialData = JSON.parse(formatArray);
            this.loadSideProperty();
          }

          break;
      }
    });
  }

  createCamera(scene: Scene) {
    const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);

    camera.setTarget(Vector3.Zero());

    return camera;
  }

  createScene(scene: Scene, canvas: HTMLCanvasElement) {
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const sphere: any = Mesh.CreateSphere('sphere', 16, 2, scene);
    sphere.position.y = 1;
    sphere.name = 'sphere1';

    sphere.material = new BABYLON.PBRMaterial('sphereMat', scene);
    sphere.material.albedoColor = new BABYLON.Color3(1.0, 0.766, 0.336);
    sphere.material.metallic = 1.0; // set to 1 to only use it from the metallicRoughnessTexture
    sphere.material.roughness = 1.0; // set to 1 to only use it from the metallicRoughnessTexture
    sphere.material.reflectionTexture =
      BABYLON.CubeTexture.CreateFromPrefilteredData(
        '/textures/environment.dds',
        scene
      );
    sphere.material.metallicTexture = new BABYLON.Texture(
      '/textures/mr.jpg',
      scene
    );
    sphere.material.useRoughnessFromMetallicTextureAlpha = false;
    sphere.material.useRoughnessFromMetallicTextureGreen = true;
    sphere.material.useMetallnessFromMetallicTextureBlue = true;

    const box: any = BABYLON.MeshBuilder.CreateBox(
      'box',
      { height: 2, width: 2 },
      scene
    );
    box.position.y = 1;
    box.position.x = 3;
    box.name = 'box1';
    box.material = new BABYLON.PBRMaterial('boxMat', scene);
    box.material.albedoColor = new BABYLON.Color3(1.0, 0.766, 0.336);
    box.material.metallic = 1.0; // set to 1 to only use it from the metallicRoughnessTexture
    box.material.roughness = 1.0; // set to 1 to only use it from the metallicRoughnessTexture
    box.material.useRoughnessFromMetallicTextureAlpha = false;
    box.material.useRoughnessFromMetallicTextureGreen = true;
    box.material.useMetallnessFromMetallicTextureBlue = true;

    const cylinder: any = BABYLON.MeshBuilder.CreateCylinder('cylinder', {});
    cylinder.position.y = 1;
    cylinder.position.x = -3;
    cylinder.name = 'cylinder';
    cylinder.material = new BABYLON.PBRMaterial('cylinderMat', scene);
    cylinder.material.albedoColor = new BABYLON.Color3(1.0, 0.766, 0.336);
    cylinder.material.metallic = 1.0; // set to 1 to only use it from the metallicRoughnessTexture
    cylinder.material.roughness = 1.0; // set to 1 to only use it from the metallicRoughnessTexture

    cylinder.material.useRoughnessFromMetallicTextureAlpha = false;
    cylinder.material.useRoughnessFromMetallicTextureGreen = true;
    cylinder.material.useMetallnessFromMetallicTextureBlue = true;

    Mesh.CreateGround('ground', 6, 6, 2, scene);
  }

  loadSideProperty() {
    this.currMaterialData.forEach((item: any) => {
      if (item.type === 'Color3') {
        if (this.selectedObj.material[item.name]) {
          item.value = this.selectedObj.material[item.name].toHexString();
        } else {
          item.value = '';
        }
      }

      if (item.type === 'Texture') {
        if (this.selectedObj.material[item.name]) {
          if (item.parent) {
            // item.value = this.selectedObj.material[item.parent][item.name].url;
            let data = this.selectedObj.material[item.parent];
            item.value = data
              ? this.selectedObj.material[item.parent][item.name].url
              : '';
          } else {
            item.value = this.selectedObj.material[item.name].url;
          }

          item.isTextureEnabled = true;
        }
      }
      if (item.type === 'boolean') {
        if (item.parent) {
          // item.value = this.selectedObj.material[item.parent][item.name];
          let data = this.selectedObj.material[item.parent];
          item.value = data
            ? this.selectedObj.material[item.parent][item.name]
            : '';
        } else {
          item.value = this.selectedObj.material[item.name];
        }
      }

      if (item.type === 'Number') {
        if (item.parent) {
          let data = this.selectedObj.material[item.parent];
          item.value = data
            ? this.selectedObj.material[item.parent][item.name]
            : '';
        } else {
          item.value = this.selectedObj.material[item.name];
        }
      }
    });
  }

  onInputColorChange(event: any, item: any) {
    this.selectedObj.material[item.name] = BABYLON.Color3.FromHexString(
      event.target.value
    );
  }

  onAddTexture(event: any, item: any) {
    this.selectedObj.material[item.name] = new Texture(
      'assets/images/texture2.jpg',
      this.scene
    );

    // event.target.setAttribute('src', 'assets/images/texture2.jpg');
    item.isTextureEnabled = true;

    item.value = 'assets/images/texture2.jpg';
  }

  onToggleTexture(event: any, item: any) {
    if (event.target.checked === true) {
      let img = event.target.previousSibling.getAttribute('src');
      this.selectedObj.material[item.name] = new Texture(img, this.scene);
    } else {
      this.selectedObj.material[item.name] = null;
    }
    //this.selectedObj.material[item.name] = event.target.checked;
  }

  onBooleanInputChange(event: any, item: any) {
    if (item.parent) {
      this.selectedObj.material[item.parent][item.name] = event.target.checked;
    } else {
      this.selectedObj.material[item.name] = event.target.checked;
    }

    item.value = event.target.checked;
  }

  onInputNumberChange(event: any, item: any) {
    if (item.parent) {
      this.selectedObj.material[item.parent][item.name] = event.target.value;
    } else {
      this.selectedObj.material[item.name] = event.target.value;
    }

    item.value = event.target.value;
  }

  loadMaterialsProperty() {}
}
