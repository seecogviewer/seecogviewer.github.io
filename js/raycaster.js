var pickPosition, pickHelper;

pickPosition = {x: 0, y: 0};

class PickHelper_first_try {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }
    
    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {

      //console.log('yuppers!');

      let notElec = true;
      for (let ii=0; notElec; ii++) {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[ii].object;
        notElec = this.pickedObject.type !== 'Electrode';
      }

      if (!notElec) {
        // save its color
        this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        console.log(this.pickedObject);
        console.log(this.pickedObjectSavedColor);
        // set its emissive color to flashing red/yellow
        //this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
      }

    }
  }
}

class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
    clearPickPosition();
  }
  pick(normalizedPosition, scene, camera) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }
    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children,true);
    if (intersectedObjects.length) {
      let tempPicked = intersectedObjects[0].object;
      //this.pickedObject = intersectedObjects[0].parent;
      if (tempPicked.type === 'elecText') {
        this.pickedObject = tempPicked.parent.children[0];
      } else {
        this.pickedObject = tempPicked;
      }
      console.log(this.pickedObject);
      this.pickedObject.material.emissive.setHex(0xFF0000);
      //console.log('yuppers!');
    }
  }
}

function getCanvasRelativePosition(event) {
  const canvas = sc.scenes.threeD.renderer.domElement;
  const rect = canvas.getBoundingClientRect();
  //console.log(rect);
  return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height,
  };
}

function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    const canvas = sc.scenes.threeD.renderer.domElement;
    pickPosition.x = (pos.x / canvas.width) * 2 - 1;
    pickPosition.y = (pos.y / canvas.height) * -2 + 1; // note we flip Y
}

function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    pickPosition.x = -100000;
    pickPosition.y = -100000;
}
