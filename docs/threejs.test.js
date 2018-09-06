"use strict";

window.main = function () {

    var scene, camera, renderer;
    var geometry, material, object, composer;
    var container = void 0;

    function run() {

        container = document.getElementById("container");

        init();
        animate();
    }

    function init() {

        var width = container.clientWidth,
            height = container.clientHeight,
            aspect = width / height;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffd24d);

        //camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        //camera.position.z = 100;
        //camera.position.y = 10;


        var d = 10;
        camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        camera.position.set(-200, 200, 200);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        var light = new THREE.AmbientLight(0xffd24d);
        scene.add(light);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-1, 0, 1);
        scene.add(directionalLight);

        geometry = new THREE.BoxGeometry(10, 3, 10, 8, 8, 8);
        material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.0,
            wireframe: false
        });

        var modifier = new THREE.BufferSubdivisionModifier();
        var modified = modifier.modify(geometry);

        object = new THREE.Object3D();

        var addMesh = function addMesh(_ref) {
            var x = _ref.x,
                y = _ref.y,
                z = _ref.z;

            var mesh = new THREE.Mesh(modified, material);
            mesh.position.y = y;
            object.add(mesh);
        };

        addMesh({y: -3.3});
        addMesh({y: 0});
        addMesh({y: 3.3});

        var circleMesh = new THREE.CircleGeometry(0.75, 16);
        var circleMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.0,
            wireframe: false
        });
        var circle = new THREE.Mesh(circleMesh, circleMaterial);
        circle.position.x = 0;
        circle.position.y = -3.2;
        circle.position.z = 5.001;

        object.add(circle);

        scene.add(object);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        container.appendChild(renderer.domElement);

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

            this.timers.forEach(timer => {
                timer.diffTime = this.worldTime - timer.startTime;
                timer.diff = timer.diffTime >= timer.period ? timer.period : timer.diffTime;
                timer.diffScaled = timer.diff / timer.period;
            });

            // run callback for each timer
            this.timers.forEach(timer => {
                if (timer.constant) timer.constant({clock: clock, timer: timer});
                if (timer.timeout && timer.diffTime >= timer.period) timer.timeout({clock: this, timer: timer});
            });

            // remove any that have expired
            this.timers = this.timers.filter(timer => timer.diff < timer.period);
        };

        addConstant(period, timer = {}) {

            let P = this.addTimeout(period, timer);
            P.watch = (cb) => {
                timer.constant = cb;
                return P;
            };

            return P;


        }

        addTimer(timer) {
            timer.startTime = this.worldTime;
            timer.diffTime = 0;
            timer.diff = 0;
            timer.diffScaled = 0;
            this.timers.push(timer);
        }

        update() {
            this.currentTime = new Date().getTime();
            this.worldTime = this.currentTime - this.timeBegin;

            this.updateTimers();
        }

        addTimeout(period, timer = {}) {

            timer.startTime = this.worldTime;
            timer.diffTime = 0;
            timer.diff = 0;
            timer.diffScaled = 0;
            timer.period = period;


            let P = new Promise((res) => {
                timer.timeout = res;
            });

            this.addTimer(timer);

            return P;
        }
    }

    var clock = new Clock();

    var addCallbackTimer = function addCallbackTimer() {

        var axis = Math.random() * 3 | 0;

        var direction = Math.random() > 0.5 ? 1 : -1;

        direction = direction * Math.PI / 2.0;

        var rotationAxis = new THREE.Vector3(axis == 0 ? direction : 0, axis == 1 ? direction : 0, axis == 2 ? direction : 0);

        clock.addTimeout(2000)
            .then(() =>
                clock.addConstant(500, {startRot: object.rotation.clone()})
                    .watch(({timer}) => {
                        object.rotation.x = timer.startRot.x + rotationAxis.x * timer.diffScaled;
                        object.rotation.y = timer.startRot.y + rotationAxis.y * timer.diffScaled;
                        object.rotation.z = timer.startRot.z + rotationAxis.z * timer.diffScaled;
                    }).then(() => addCallbackTimer())
            );
    };

    addCallbackTimer();

    function animate() {
        clock.update();
        renderer.render(scene, camera);

        requestAnimationFrame(animate);
    }

    return {run: run};
}();
