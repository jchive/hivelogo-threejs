'use strict';

window.main = function () {

    let scene, camera, renderer;
    let geometry, material, cube, objects;
    let container = void 0;

    function run() {

        objects = [];

        container = document.getElementById("container");

        init();
        animate();
    }

    function init() {

        const width = container.clientWidth,
            height = container.clientHeight,
            aspect = width / height;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffd24d);

        let d = 10;
        camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 10000);
        camera.position.set(-200, 200, 200);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const light = new THREE.AmbientLight(0xffd24d);
        scene.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-1, 0, 1);
        scene.add(directionalLight);

        material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.0,
            wireframe: false
        });

        cube = new THREE.Object3D();

        const materials = {
            'cube': new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 0.0}),
            'white': new THREE.MeshStandardMaterial({emissive: 0xffffff, metalness: 0.0}),
            'orange': new THREE.MeshStandardMaterial({emissive: 0xff8000, metalness: 0.0}),
            'yellow': new THREE.MeshStandardMaterial({emissive: 0xffff00, metalness: 0.0}),
            'red': new THREE.MeshStandardMaterial({emissive: 0xff0000, metalness: 0.0}),
            'green': new THREE.MeshStandardMaterial({emissive: 0x00ff00, metalness: 0.0}),
            'blue': new THREE.MeshStandardMaterial({emissive: 0x0000ff, metalness: 0.0})
        };

        const addCube = function addCube(x, y, z) {

            const object = new THREE.Object3D();

            const geometry = new THREE.BoxGeometry(3.3, 3, 3.3, 4, 4, 4);

            //let modifier = new THREE.BufferSubdivisionModifier(0);
            //let modified = modifier.modify(geometry);

            const mesh = new THREE.Mesh(geometry, materials.cube);

            const positionMatrix = new THREE.Matrix4().makeTranslation(x, y, z);

            mesh.geometry.applyMatrix(positionMatrix);

            const distance = Math.sqrt(3.3 * 3.3) / 1.9999; //1.7001;

            let createFace = function createFace(color, Zrotation, Yrotation, Xrotation, x, y, z) {
                const face = new THREE.CircleGeometry(2.1, 4);
                const faceMesh = new THREE.Mesh(face, color);

                const rotationMatrix = new THREE.Matrix4().makeRotationZ(Zrotation);
                const rotationMatrix2 = new THREE.Matrix4().makeRotationY(Yrotation);
                const rotationMatrix3 = new THREE.Matrix4().makeRotationX(Xrotation);
                const offsetMatrix = new THREE.Matrix4().makeTranslation(x * distance, y * distance, z * distance);

                faceMesh.geometry.applyMatrix(rotationMatrix);
                faceMesh.geometry.applyMatrix(rotationMatrix2);
                faceMesh.geometry.applyMatrix(rotationMatrix3);
                faceMesh.geometry.applyMatrix(offsetMatrix);
                faceMesh.geometry.applyMatrix(positionMatrix);

                object.add(faceMesh);
            };

            createFace = function createFace() {
            };

            if (x < 0) {
                createFace(materials.red, -Math.PI / 4.0, -Math.PI / 2.0, 0, -1, 0, 0);
            } else if (x > 0) {
                createFace(materials.orange, -Math.PI / 4.0, Math.PI / 2.0, 0, 1, 0, 0);
            }

            if (y < 0) {
                createFace(materials.yellow, -Math.PI / 4.0, 0, Math.PI / 2.0, 0, -1, 0);
            } else if (y > 0) {
                createFace(materials.white, -Math.PI / 4.0, 0, -Math.PI / 2.0, 0, 1, 0);
            }

            if (z < 0) {
                createFace(materials.green, -Math.PI / 4.0, Math.PI, 0, 0, 0, -1);
            } else if (z > 0) {
                createFace(materials.blue, -Math.PI / 4.0, 0, 0, 0, 0, 1);
            }

            mesh.verticesNeedUpdate = true;

            object.add(mesh);

            object.pos = new THREE.Vector3(x, y, z);

            cube.add(object);

            objects.push(object);
        };

        const addSection = function addSection(offsetY) {

            for (let x = 0; x < 3; ++x) {
                for (let z = 0; z < 3; ++z) {

                    if (offsetY !== 0 || x !== 1 || z !== 1) {
                        addCube((x - 1) * 3.3, offsetY, (z - 1) * 3.3);
                    }
                }
            }
        };

        addSection(-3.3);
        addSection(0.0);
        addSection(3.3);

        const circleMesh = new THREE.CircleGeometry(0.75, 16);
        const circleMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.0,
            wireframe: false
        });
        circleMesh.applyMatrix(new THREE.Matrix4().makeTranslation(0, -3.2, 5.001));

        const circle = new THREE.Mesh(circleMesh, circleMaterial);

        objects[5].add(circle);
        scene.add(cube);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        container.appendChild(renderer.domElement);
    }

    function limitPosition(p) {
        if (p < -0.5) return -3.3;
        if (p > 0.5) return 3.3;
        return 0;
    }

    function selectFace(_ref) {
        const x = _ref.x,
            y = _ref.y,
            z = _ref.z;

        let compare = void 0;

        if (x != 0) {
            if (x < 0) compare = function compare(p) {
                return p.x < 0;
            }; else compare = function compare(p) {
                return p.x > 0;
            };
        } else if (y != 0) {
            if (y < 0) compare = function compare(p) {
                return p.y < 0;
            }; else compare = function compare(p) {
                return p.y > 0;
            };
        } else {
            if (z < 0) compare = function compare(p) {
                return p.z < 0;
            }; else compare = function compare(p) {
                return p.z > 0;
            };
        }

        return objects.filter(function (object) {
            return compare(object.pos);
        });
    }

    function selectAxis(axis, side) {

        const face = axis.clone().multiplyScalar(side);

        return {
            axis: axis,
            face: face,
            objects: selectFace(face)
        };
    }

    class Clock {
        constructor() {
            this.timeBegin = new Date().getTime();
            this.currentTime = this.timeBegin;
            this.worldTime = 0;
            this.timers = [];

        }

        get world() {
            return this.worldTime;
        }

        updateTimers() {
            // calculate 'diff' for each timer

            this.timers.forEach(_ => {
                _.diffTime = this.worldTime - _.startTime;
                _.diff = _.diffTime >= _.period ? _.period : _.diffTime;
                _.diffScaled = _.diff / _.period;
            });

            // run callback for each timer
            this.timers.forEach(timer => {
                if (timer.diffTime >= timer.period) {
                    if (timer.timeout) timer.timeout({clock: clock, timer: timer});
                } else {
                    if (timer.constant) timer.constant({clock: clock, timer: timer});
                }
            });

            // remove any that have expired
            this.timers = this.timers.filter(_ => _.diff < _.period);

        };

        addTimer(timer) {
            timer = Object.assign({
                startTime: this.worldTime,
                diffTime: 0,
                diff: 0,
                diffScaled: 0,
                period: 0
            }, timer);

            this.timers.push(timer);
        }

        update() {
            this.currentTime = new Date().getTime();
            this.worldTime = this.currentTime - this.timeBegin;

            this.updateTimers();
        }
    }

    var clock = new Clock();
    const triggerTime = clock.world;

    const rotateAxis = function rotateAxis(axis, amount) {

        axis.objects.forEach(function (object) {
            object.setRotationFromAxisAngle(axis.axis, amount * Math.PI / 2.0);
        });

        return axis;
    };

    // force the object and any descendants to apply the matrix to any geometry and reset their own matrix to identity
    function bakeMatrixIntoGeometry(object, matrix) {
        if (object.geometry) object.geometry.applyMatrix(matrix);
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        if (object.children) object.children.forEach(function (obj) {
            return bakeMatrixIntoGeometry(obj, matrix);
        });
    }

    const addCallbackTimer = function addCallbackTimer() {
        const repeat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;


        clock.addTimer({
            period: 250,
            timeout: () => {

                let selectedAxis = 0;
                let side = 1;

                selectedAxis = Math.random() * 3 | 0;
                side = Math.random() > 0.5 ? 1 : -1;

                const direction = Math.random() > 0.5 ? 1 : -1;

                const axis = new THREE.Vector3().setComponent(selectedAxis, 1);
                const axisObjects = selectAxis(axis, side);

                clock.addTimer({
                    period: 250,
                    constant: ({timer}) => {
                        rotateAxis(axisObjects, timer.diffScaled * direction);
                    },

                    timeout: ({timer}) => {
                        rotateAxis(axisObjects, timer.diffScaled * direction);

                        axisObjects.objects.forEach(function (object) {

                            object.updateMatrix();
                            object.pos = object.pos.applyMatrix4(object.matrix);
                            object.pos.x = limitPosition(object.pos.x);
                            object.pos.y = limitPosition(object.pos.y);
                            object.pos.z = limitPosition(object.pos.z);

                            bakeMatrixIntoGeometry(object, object.matrix.clone());
                        });

                        if (repeat) addCallbackTimer();
                    }
                });
            }
        });
    };

    clock.addTimer({
        timeout: function timeout() {
            return addCallbackTimer();
        }
    });

    //addCallbackTimer();

    function animate() {
        clock.update();

        requestAnimationFrame(animate);

        renderer.render(scene, camera);
    }

    return {run: run};
}();
//# sourceMappingURL=threejs.rubiks.js.map
