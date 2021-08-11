var scenery = {};
$(document).ready(function () {
    // Adding a controller for volumes
    // Make subfolders for volume function
    function planeController(obj, name, axes) {
        //debugger;
        let parentFolder = sc.datGui.objs['vol'];
        let planeFolder = parentFolder.addFolder(name);
        let origDir = obj.slice.planeDirection;
        const originalPlaneXYZ = obj.slice.planePosition;
        //debugger;
        planeFolder.add(obj, 'index', 0, obj.orientationMaxIndex, 1).name('Slice').listen();
        /*
        for (ax of axes) {
            planeFolder.add(obj.slice.planeDirection, ax, -Math.PI * 2, Math.PI * 2, 0.1).name('Rotate' + ax.toUpperCase()).onChange(function (newVal) {
                //debugger;

                obj.slice.planeDirection = new THREE.Vector3().set(this.object.x, this.object.y, this.object.z);


                // Keep
                let q = obj.slice.geometry.vertices[0];
                let r = obj.slice.geometry.vertices[1];
                let s = obj.slice.geometry.vertices[2];
                let vector1 = new THREE.Vector3().subVectors(r,q);
                let vector2 = new THREE.Vector3().subVectors(s,q);
                


                // let mag1 = Math.sqrt( (r.x-q.x)^2 + (r.y-q.y)^2 + (r.z-q.z)^2 );
                // let mag2 = Math.sqrt( (s.x-q.x)^2 + (s.y-q.y)^2 + (s.z-q.z)^2 );
                // let unitVector1 = new THREE.Vector3().copy(vector1).divideScalar(mag1);
                // let unitVector2 = new THREE.Vector3().copy(vector2).divideScalar(mag2);


                // Keep
                //let normalVector = new THREE.Vector3().crossVectors(vector1,vector2);
                //console.log(normalVector.normalize());
                
                //let magNorm = Math.sqrt( (normalVector.x-q.x)^2 + (normalVector.y-q.y)^2 + (normalVector.z-q.z)^2 );
                //let unitNormalVector = new THREE.Vector3().copy(normalVector).divideScalar(magNorm).normalize();
                // console.log(vector1);
                // console.log(vector2);
                // console.log(normalVector);
                // console.log('Units Vectors');
                //console.log(unitVector1);
                //console.log(unitVector2);
                
                


                // let originalPlaneDirection = obj.slice.planeDirection;
                
                // let newPlaneDirection = new THREE.Vector3().set(
                //     originalPlaneDirection.x - obj.slice.planeDirection.x,
                //     originalPlaneDirection.y - obj.slice.planeDirection.y,
                //     originalPlaneDirection.z - obj.slice.planeDirection.z
                // );
                // console.log('OriginalPlaneDirection: ' + originalPlaneDirection.x + ',' + originalPlaneDirection.y + ',' + originalPlaneDirection.z);
                // console.log('NormalDirection: ' + obj.slice.planeDirection.x + ',' + obj.slice.planeDirection.y + ',' + obj.slice.planeDirection.z);
                // console.log('NewPlaneDirection: ' + newPlaneDirection.x + ',' + newPlaneDirection.y + ',' + newPlaneDirection.z);
                
                // Keep
                let axCamera = sc.scenes[`${name}`].camera;
                let planeCenterXYZ = new THREE.Vector3().subVectors(originalPlaneXYZ,obj.slice.planePosition);
                let newCameraPosition = new THREE.Vector3().addVectors(planeCenterXYZ,normalVector.normalize());
                // //axCamera.position.copy(newPlaneDirection.multiplyScalar(1000));
                axCamera.position.copy(newCameraPosition);



                obj.border.helpersSlice = obj.slice;
            });
        }*/

        let visibleObj = {'visible': true};

        //planeFolder.add(obj, 'visible').name('Visible');
        // Keep plane visible in 2D scene but allow to be invisble in 3D scene
        planeFolder.add(visibleObj, 'visible').name('visible').onChange( function(chng) {
            if (chng) {
                sc.scenes.threeD.scene.add(obj.parent);
            } else {
                sc.scenes.threeD.scene.remove(obj.parent);
            }
        })
        return planeFolder;
    }

    function scenePlaneController(obj, name, axes, planePosition) {
        //debugger;
        let parentFolder = sc.datGui.objs['vol'];
        let planeFolder = parentFolder.addFolder(name);
        //debugger;
        planeFolder.add(obj.position, planePosition, -150, 150, 1).name('Slice').listen();
        for (ax of axes) {
            planeFolder.add(obj.rotation, ax, -Math.PI/2, Math.PI/2, 0.1).name('Rotate' + ax.toUpperCase()).onChange(function (newVal) {
                obj.rotation.set(this.object.x, this.object.y, this.object.z);
                //debugger;
                //obj.slice.planeDirection = new THREE.Vector3().set(this.object.x, this.object.y, this.object.z);
                //obj.border.helpersSlice = obj.slice;
            });
        }

        planeFolder.add(obj, 'visible').name('Visible');
        return planeFolder;
    }

    // Create the 2D scene for the slice
    function createPlaneScene(planesc,ax,domID) {
        let div2d = document.getElementById(domID);
        let renderer2d = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer2d.setSize(div2d.offsetWidth, div2d.offsetHeight);
        renderer2d.setClearColor(0x000000, 1);
        renderer2d.setPixelRatio(window.devicePixelRatio);
        div2d.appendChild(renderer2d.domElement);

        // Create position for line of camerapole
        let lineEnd;
        const camDist = 138;
        switch (ax) {
            case 'Sagittal':
                lineEnd = new THREE.Vector3( camDist, 0, 0 );
                break;
            case 'Coronal':
                lineEnd = new THREE.Vector3( 0, camDist, 0 );
                break;
            case 'Axial':
                lineEnd = new THREE.Vector3( 0, 0, camDist );
                break;
        }

        // Pole to mount camera
        let material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        let points = [];
        points.push(lineEnd);
        points.push( new THREE.Vector3( 0, 0, 0 ) );
        let geometry = new THREE.BufferGeometry().setFromPoints( points );
        line = new THREE.Line( geometry, material );
        line.visible = true; // Helpful in debugging cameras

        // The camera
        let camera = new AMI.OrthographicCamera(
            renderer2d.domElement.clientWidth / -2,
            renderer2d.domElement.clientWidth / 2,
            renderer2d.domElement.clientHeight / 2,
            renderer2d.domElement.clientHeight / -2,
            1,
            1000
            );
        camera.position.copy(points[0]);
        //camera.invertRows();
        line.add(camera);
        camera.position.copy(points[0]);
        camera.lookAt(0,0,0);
        planesc.add(line);

        switch (ax) {
            case 'Sagittal':
                camera.rotateZ(Math.PI/2);
                break;
            case 'Coronal':
                camera.rotateZ(Math.PI);
                break;
            case 'Axial':
                lineEnd = new THREE.Vector3( 0, 0, camDist );
                break;
        }

        // Add to global object
        sc.scenes[ax].camera = camera;
        sc.scenes[ax].renderer = renderer2d;
        sc.scenes[ax].scene = planesc;

        // Render function
        function div2dAnimate () {
            //controls.update();
            renderer2d.render(planesc, camera);
        
            requestAnimationFrame(function () {
                div2dAnimate();
            });
        }
        div2dAnimate();
    }

    // Create 2D scene
    function create2DScene(sceneInfo,ax) {
        let planeScene = new THREE.Scene();
        planeScene.add(sceneInfo['obj']);
        let stack = sceneInfo.obj.stack;
        let slice = sceneInfo.obj.slice;

        // Create renderer
        let div2d = document.getElementById(sceneInfo['dom']);
        let renderer2d = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer2d.setSize(div2d.offsetWidth, div2d.offsetHeight);
        renderer2d.setClearColor(0x000000, 1);
        renderer2d.setPixelRatio(window.devicePixelRatio);
        renderer2d.autoClear = false;
        //renderer2d.localClippingEnabled = true;
        div2d.appendChild(renderer2d.domElement);

        // Create position for line of camerapole
        let lineEnd, mycol, camPosAx, sliceAx, sign;
        const camDist = 138;
        //lineEnd = new THREE.Vector3( camDist, 0, 0 );
        switch (ax) {
            case 'Sagittal':
                lineEnd = new THREE.Vector3( camDist, 0, 0 );
                mycol = 0x00ff00;
                camPosAx = 'x';
                sliceAx = 'x';
                sign = 1;
                break;
            case 'Axial':
                lineEnd = new THREE.Vector3( 0, 0, camDist );
                mycol = 0x0000ff;
                camPosAx = 'z';
                sliceAx = 'y';
                sign = 1;
                break;
            case 'Coronal':
                lineEnd = new THREE.Vector3( 0, camDist, 0 );
                mycol = 0xff0000;
                camPosAx = 'y';
                sliceAx = 'z';
                sign = -1;
                break;
        }

        // Pole to mount camera
        let material = new THREE.LineBasicMaterial( { color: mycol } );
        let points = [];
        points.push(lineEnd);
        points.push(sceneInfo.obj.slice.position);
        //points.push( new THREE.Vector3( 0, 0, 0 ) );
        //let geometry = new THREE.BufferGeometry().setFromPoints( points );
        let geometry = new THREE.Geometry().setFromPoints( points );
        line = new THREE.Line( geometry, material );
        //line.visible = true; // Helpful in debugging cameras
        //planeScene.add(line);        

        // The camera
        let camera = new AMI.OrthographicCamera(
            renderer2d.domElement.clientWidth / -2,
            renderer2d.domElement.clientWidth / 2,
            renderer2d.domElement.clientHeight / 2,
            renderer2d.domElement.clientHeight / -2,
            Math.abs(camDist)-2, // Near, 1 or camDist+1
            Math.abs(camDist+2) //Far, 10000 or camDist-1
        );

        // Add sphere to camera to help with debugging
        const mat = new THREE.MeshLambertMaterial({color: mycol});
        const geo = new THREE.SphereBufferGeometry(2, 32, 32);
        let mesh = new THREE.Mesh(geo,mat);
        //mesh.name = ax + '_campos';
        //sc.scenes.threeD.scene.add(mesh);
        //camera.add(mesh);
        //sc.scenes.threeD.scene.add(camera);

        // Setup controls
        let controls = new AMI.TrackballOrthoControl(camera, renderer2d.domElement);
        controls.staticMoving = true;
        controls.noRotate = true;
        controls.enableRotate = true;
        controls.autoRotate = true;
        controls.enablePan = false;
        controls.enableZoom = true;
        camera.controls = controls;
        controls.update();
        sc.scenes[`${ax}`].controls = controls;

        // set camera
        let worldbb = stack.worldBoundingBox();
        let lpsDims = new THREE.Vector3(
            (worldbb[1] - worldbb[0]) / 2,
            (worldbb[3] - worldbb[2]) / 2,
            (worldbb[5] - worldbb[4]) / 2
        );

        // box: {halfDimensions, center}
        let box = {
            center: stack.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(
                lpsDims.x + 10, 
                lpsDims.y + 10, 
                lpsDims.z + 10,
            )
        };

        camera.box = box;

        // const canvas = {
        //     width: renderer2d.domElement.clientWidth,
        //     height: renderer2d.domElement.clientWidth,
        // };
        
        camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
        //debugger;
        camera.canvas.width = renderer2d.domElement.clientWidth/1.5;
        camera.canvas.height = renderer2d.domElement.clientHeight/1.5;
        camera.orientation = ax.toLowerCase();
        camera.convention = 'neuro';
        camera.update();
        //camera.fitBox(2, 1);
        // camera.position.copy(points[0]);
        // //camera.invertRows();
        // line.add(camera);
        // camera.position.copy(points[0]);
        // camera.lookAt(0,0,0);
        //planeScene.add(line);

        // Add to global object
        sc.scenes[ax].camera = camera;
        sc.scenes[ax].renderer = renderer2d;
        sc.scenes[ax].scene = planeScene;

        // Plane for clipping
        //let clipPlane = new THREE.Plane(new THREE.Vector3(0,0,0),0);

        // Define variables to help when plane movies
        let camOrigPos, planeOrigPos, camNewPos, planeNewPos;
        camOrigPos = camera.position[`${camPosAx}`];
        planeOrigPos = slice.planePosition[`${sliceAx}`];
        camNewPos = camOrigPos;
        planeNewPos = planeOrigPos;

        //Check when need to resize canvas
        function rendererSizeChecker(renderer) {
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height,false);
            }
            return needResize;
        }


        // Render function
        function div2dAnimate () {
            
            // If need to resize renderer, update camera
            if (rendererSizeChecker(renderer2d)) {
                const canvas = renderer2d.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.canvas.width = canvas.clientWidth/1.5;
                camera.canvas.height = canvas.clientHeight/1.5;
                camera.fitBox(2);
                camera.update();
                //renderer2d.setSize(div2d.offsetWidth, div2d.offsetHeight);
                //camera.updateProjectionMatrix();
            }

            // Update camera positioning
            planeNewPos = slice.planePosition[`${sliceAx}`];
            camNewPos = camOrigPos + (planeOrigPos - planeNewPos)*sign;
            camera.position[`${camPosAx}`] = camNewPos;
            planeOrigPos = planeNewPos;
            camOrigPos = camNewPos;
            //mesh.position.copy(camera.position);
            
            controls.update();
            renderer2d.clear();
            renderer2d.render(planeScene, camera);
            renderer2d.clearDepth();
            renderer2d.render(sc.elecScene,camera);
        
            requestAnimationFrame(function () {
                div2dAnimate();
            });
        }
        div2dAnimate();

    }

    // Initiate dat.gui
    function initSceneGui() {
        let sceneGui = new dat.GUI({
            autoPlace: false,
            width: 200,
            resizable: true
        });
        
        // Generic Display settings
        let dispFolder = sceneGui.addFolder('Display');
        let cam = sc.scenes.threeD.camera;
        cam['reCenterCamera'] = function () {
            this.position.x = 250;
            this.position.y = 250;
            this.position.z = 250;
        }
        dispFolder.add(cam, 'reCenterCamera').name('Recenter');
        const rendColors = {
            currentColor: 'White'
        };
        dispFolder.add(rendColors, 'currentColor', ['White', 'Black', 'PowderBlue']).name('Background').onChange(function (newColor) {
            sc.scenes.threeD.renderer.setClearColor(newColor.toLocaleLowerCase(), 1);
        });
        
        // Electrodes
        let elecsFolder = sceneGui.addFolder('Electrode Settings');
        elecsFolder.add(aes,'elecTextVisible').name('Text').listen().onChange(function() {
            // Recurse through 3D scene and if the object contains elecText, toggle it
            sc.elecScene.children.forEach(function(o){
                let elecText = o.getObjectByProperty('type', 'elecText');
                if (elecText !== undefined) {
                    elecText.visible = aes['elecTextVisible'];
                }
            });
        });
        elecsFolder.add(aes,'showSelectedElecs').name('Display Selected').listen().onChange(function() {
            // Nothing yet
        });

        // Play with controls settings
        let controlsFolder = sceneGui.addFolder('Controls');
        let threeControls = sc.scenes.threeD.controls;
        controlsFolder.add(threeControls,'rotateSpeed',0,10,0.1);
        controlsFolder.add(threeControls,'zoomSpeed',0,10,0.1);
        controlsFolder.add(threeControls,'panSpeed',0,10,0.1);
        controlsFolder.add(threeControls,'dynamicDampingFactor',0,1,0.1);
        controlsFolder.add(threeControls,'staticMoving');

        let surfsFolder = sceneGui.addFolder('Surfaces');
        let volFolder = sceneGui.addFolder('Volumes');
        sc.datGui.objs['parent'] = sceneGui;
        sc.datGui.objs['surf'] = surfsFolder;
        sc.datGui.objs['elecs'] = elecsFolder;
        sc.datGui.objs['vol'] = volFolder;
        const guiContainer = document.getElementById('sceneGui-container');
        guiContainer.appendChild(sceneGui.domElement);
    }

    // Update dat.gui dropdown options
    function updateMeshOverlay(mesh,overlayname,importing=false) {
        let meshGui = mesh.userData['gui'];
        /*let skinTypes = Object.keys( mesh.userData['overlays'] );
        let skinObj = {
            'overlay': '<new_overlay_name>'
        };*/
        let overlayobj = mesh.userData['overlays'][overlayname];
        let overlaytype = overlayobj['type'];

        // Remove any additional controllers
        let ncontrollers = meshGui.__controllers.length;
        if (ncontrollers > 2) {
            for (ii=ncontrollers-1;ii>1;ii--) {
                meshGui.__controllers[ii].remove();
            }
        }

        // Update available options in SkinTypes
        if (importing) {
            if (meshGui.__controllers.length == 2) {
                meshGui.__controllers[1].remove();
            }
            let skinTypes = Object.keys( mesh.userData['overlays'] );
            let skinObj = {
                'overlay': overlayname
            };
            let skinController = meshGui.add(skinObj,'overlay',skinTypes).name('Overlays');
            skinController.onChange(function(val) {
                updateMeshOverlay(mesh,val);
            })
        }

        //meshGui.__controllers[2].remove();
        //meshGui.add(skinObj,'overlay',skinTypes).name('Overlays');

        // If something other than default skin then add subfolder with additional options
        if (overlaytype === 'heatmap') {

            //meshGui.__controllers[2].remove();

            // Add heatmap subfolder
            //let overlayFolder = meshGui.addFolder('Overlay');

            // Set params for heatmap
            let funcLut = new THREE.Lut('cooltowarm',200);
            //debugger;
            let odata = [...overlayobj.data];
            odata = odata.sort();
            let oMin = odata[0];
            let oMax = odata[odata.length - 1];
            funcLut.setMin(oMin);
            funcLut.setMax(oMax);
            //funcLut.setMin(Math.min(...overlayobj.data));
            //funcLut.setMax(Math.max(...overlayobj.data));
            const verts = ['a','b','c'];

            // Update the material
            let cols = overlayobj.data.map(function(n){return funcLut.getColor(n)}); 
            mesh.geometry.faces.forEach(function(f){
                var jj = 0;
                for(v of verts) {
                    f.vertexColors[jj] = ( cols[f[v]] );
                    jj++;
                }
            });
            mesh.material.vertexColors = THREE.VertexColors;
            mesh.material.needsUpdate = true;
            mesh.geometry.colorsNeedUpdate = true;
            mesh.geometry.elementsNeedUpdate = true;

            // Add min and max controllers
            let minSlider = meshGui.add(funcLut,'minV',funcLut.minV, funcLut.maxV).name('Min').listen();
            minSlider.onChange(function(newMin){
                let newColors = overlayobj.data.map(function(n){ return n > newMin ? funcLut.getColor(n) : new THREE.Color(0.5,0.5,0.5)});
                mesh.geometry.faces.forEach(function(f){
                    var kk = 0;
                    for(v of verts) {
                        f.vertexColors[kk] = ( newColors[f[v]] );
                        kk++;
                    }
                });
                mesh.geometry.colorsNeedUpdate = true;
                mesh.geometry.elementsNeedUpdate = true;
            })
            let maxSlider = meshGui.add(funcLut,'maxV',funcLut.minV, funcLut.maxV).name('Max').listen();
            maxSlider.onChange(function(newMax){
                let newColors = overlayobj.data.map(function(n){ return n < newMax ? funcLut.getColor(funcLut.maxV) : funcLut.getColor(n)});
                mesh.geometry.faces.forEach(function(f){
                    var kk = 0;
                    for(v of verts) {
                        f.vertexColors[kk] = ( newColors[f[v]] );
                        kk++;
                    }
                });
                mesh.geometry.colorsNeedUpdate = true;
                mesh.geometry.elementsNeedUpdate = true;
            })

        } else if (overlaytype === 'atlas') {
            
            // Data for each vertex and corresponding colors
            let vertvals = overlayobj['data'];
            let labels = overlayobj['labels'];
            let ctable = overlayobj['ctable'];
            const verts = ['a','b','c'];
            
            // Change vertex colors to match the label
            mesh.geometry.faces.forEach(function(f){
                var jj = 0;
                for(v of verts) {
                    let label_idx = vertvals[f[v]];
                    // debugger;
                    //f.vertexColors[jj].setRGB(ctable[v][0], ctable[v][1],ctable[v][2]);
                    f.vertexColors[jj] = new THREE.Color(ctable[label_idx][0]/255, ctable[label_idx][1]/255,ctable[label_idx][2]/255);
                    jj++;
                }
            });
            mesh.material.vertexColors = THREE.VertexColors;
            mesh.material.needsUpdate = true;
            mesh.geometry.colorsNeedUpdate = true;
            mesh.geometry.elementsNeedUpdate = true;

        } else if (overlaytype === 'default') {
            mesh.material.vertexColors = false;
            mesh.material.needsUpdate = true;
            mesh.geometry.colorsNeedUpdate = true;
            mesh.geometry.elementsNeedUpdate = true;
            let dummyColor = {
                color: "#" + mesh.material.color.getHexString()
            };
            let colorChanger = meshGui.addColor(dummyColor, 'color').name('Color');
            //colorChanger.initialValue = "#" + mesh.material.color.getHexString();
            colorChanger.onChange(function (colorVal) {
                let newColor = colorVal.replace('#', '0x');
                mesh.material.color.setHex(newColor);
            });
        } else {
            // Unknown type
        }
    }

    // Adding dat.gui to the scene for meshes
    function addGui4Surf(mesh) {
        let surfFolder = sc.datGui.objs['surf'];
        let newSurfFolder = surfFolder.addFolder(mesh.name);
        newSurfFolder.add(mesh.material, 'opacity', 0, 1).name('Opacity').onChange(function(val) {
            if (val < 1) {
                mesh.material.depthWrite = false;
                mesh.material.depthTest = true;
            } else {
                mesh.material.depthWrite = true;
                mesh.material.depthTest = true;
            }
        });

        //newSurfFolder.add(mesh.material,'depthWrite').name('depthWrite').listen();
        //newSurfFolder.add(mesh.material,'depthTest').name('depthTest').listen();

        // Add skins controller
        let skinTypes = Object.keys( mesh.userData['overlays'] );
        let skinObj = {
            'overlay': 'default'
        };
        let skinController = newSurfFolder.add(skinObj,'overlay', skinTypes).name('Overlays');
        skinController.onChange(function(val) {
            updateMeshOverlay(mesh,val);
        })

        // Color controller
        /*let dummyColor = {
            color: "#" + mesh.material.color.getHexString()
        };
        let colorChanger = newSurfFolder.addColor(dummyColor, 'color').name('Color');
        //colorChanger.initialValue = "#" + mesh.material.color.getHexString();
        colorChanger.onChange(function (colorVal) {
            let newColor = colorVal.replace('#', '0x');
            mesh.material.color.setHex(newColor);
        });*/

        return newSurfFolder;
    }

    // Create scene just for electrodes
    function createElecScene() {
        let escene = new THREE.Scene();

        // Create fake electrodes
        /*function createElec(){
            const minval = -50;
            const maxval = 50;
            //const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
            const mat = new THREE.MeshLambertMaterial({color: 0xff0000});
            //const geo = new THREE.SphereBufferGeometry(2, 32, 32);
            const geo = new THREE.DodecahedronBufferGeometry(3, 0);
            const mesh = new THREE.Mesh(geo,mat);
            mesh.position.set(Math.random()*(maxval-minval)+minval,Math.random()*(maxval-minval)+minval,Math.random()*(maxval-minval)+minval);
            return mesh;
        }

        for (let ii=0;ii<100;ii++) {
            let m = createElec();
            escene.add(m);
        }*/
        const light = new THREE.AmbientLight( 0x737272 );
        escene.add(light);
        sc.elecScene = escene;
        return escene;
    }

    // Set up THREE.JS 3D scene
    function init3DScene() {
        const threeD = document.getElementById("threeDviewArea");

        // Display the legend
        aes.initLegend();

        //#region Classic ThreeJS setup
        // ThreeJS renderer
        let renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        sc.scenes.threeD.renderer = renderer;
        renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
        renderer.setClearColor(0xffffff, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Make canvas element responsize to resize
        renderer.domElement.classList.add('w3-col');
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.width = "100%";
        threeD.appendChild(renderer.domElement);

        // ThreeJS scene
        scene = new THREE.Scene();
        sc.scenes.threeD.scene = scene;

        // ThreeJS camera
        let camera = new THREE.PerspectiveCamera(45, threeD.clientWidth / threeD.clientHeight, 1, 1000);
        camera.position.x = 250;
        camera.position.y = 250;
        camera.position.z = 250;
        sc.scenes.threeD.camera = camera;
        //#endregion

        // Lighting for the scene
        let light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.copy(camera.position);
        scene.add(light);

        // AMI style trackball
        let controls = new AMI.TrackballControl(camera, renderer.domElement);
        controls.minDistance = 100;
        controls.maxDistance = 1000;
        controls.update();
        sc.scenes.threeD.controls = controls;

        var escene = createElecScene();
        sc.scenes.threeD.scene.add(escene);

        // The font to be used in THREE.js scenes
        const font = new THREE.FontLoader().parse(rawText);
        sc.font = font;

        // Change variable to indicate the viewer is switched on
        init3 = true;

        initSceneGui();

        // Enable raycasting
        // pickHelper = new PickHelper();
        // window.addEventListener('mousemove', setPickPosition);
        // window.addEventListener('mouseout', clearPickPosition);
        // window.addEventListener('mouseleave', clearPickPosition);


        //Check when need to resize canvas
        function rendererSizeChecker(renderer) {
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
            }
            return needResize;
        }

        // Run the animation loop
        const animate = () => {
            
            // If need to resize renderer, update camera
            if (rendererSizeChecker(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
            
            controls.update();
            light.position.copy(camera.position);

            // Raycaster
            //pickHelper.pick(pickPosition, escene, camera);

            renderer.render(scene, camera);

            requestAnimationFrame(function () {
                animate();
            });
        }
        animate();
    }
    
    // Package into the object scenery
    scenery.planeController = planeController;
    scenery.scenePlaneController = scenePlaneController;
    scenery.createPlaneScene = createPlaneScene;
    scenery.create2DScene = create2DScene;
    scenery.initSceneGui = initSceneGui;
    scenery.updateMeshOverlay = updateMeshOverlay;
    scenery.addGui4Surf = addGui4Surf;
    scenery.createElecScene = createElecScene;
    scenery.init3DScene = init3DScene;
});