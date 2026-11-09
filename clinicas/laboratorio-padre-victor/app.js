/* Laboratório Padre Victor — interações e cena 3D */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: fica sólido depois do topo ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    header.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.55);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Revelação ao rolar ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Cena 3D ---------- */
  var sceneEl = document.getElementById("scene");
  var canvas = document.getElementById("scene-canvas");
  if (!sceneEl || !canvas) return;

  function start() {
    if (!window.THREE) return; // mantém o fallback em CSS
    try { initScene(window.THREE); } catch (err) { /* WebGL indisponível: fallback em CSS */ }
  }
  if (window.THREE) start(); else window.addEventListener("load", start);

  function initScene(THREE) {
    var isSmall = window.matchMedia("(max-width: 959px)").matches;
    var isCoarse = window.matchMedia("(pointer: coarse)").matches;
    var dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: dpr < 2,
      powerPreference: isSmall ? "low-power" : "high-performance"
    });
    renderer.setPixelRatio(dpr);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, isSmall ? 13 : 12.5);

    /* Ambiente para reflexos de vidro, gerado na hora (sem baixar HDR) */
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    var envGeo = new THREE.SphereGeometry(10, 32, 16);
    var colors = [];
    var pos = envGeo.attributes.position;
    var top = new THREE.Color("#d9fff9"), bottom = new THREE.Color("#04201f"), c = new THREE.Color();
    for (var i = 0; i < pos.count; i++) {
      var t = (pos.getY(i) / 10 + 1) / 2;
      c.copy(bottom).lerp(top, Math.pow(t, 1.6));
      colors.push(c.r, c.g, c.b);
    }
    envGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    envScene.add(new THREE.Mesh(envGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    var panelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var p1 = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.2), panelMat);
    p1.position.set(-3, 6, 3); p1.lookAt(0, 0, 0); envScene.add(p1);
    var p2 = new THREE.Mesh(new THREE.PlaneGeometry(3, 6), new THREE.MeshBasicMaterial({ color: 0x7fe7da }));
    p2.position.set(7, 0, -2); p2.lookAt(0, 0, 0); envScene.add(p2);
    var envTex = pmrem.fromScene(envScene, 0.02).texture;
    scene.environment = envTex;
    envGeo.dispose(); pmrem.dispose();

    var key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(-4, 6, 6);
    scene.add(key, new THREE.AmbientLight(0x6fd6ca, 0.35));

    /* Materiais */
    var glass = new THREE.MeshPhysicalMaterial({
      color: 0xd8fbf6, metalness: 0.15, roughness: 0.08,
      clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.35,
      transparent: true, opacity: 0.94
    });
    var accent = new THREE.MeshPhysicalMaterial({
      color: 0x0e8f8a, metalness: 0.35, roughness: 0.18,
      clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2
    });
    var bondMat = new THREE.MeshPhysicalMaterial({
      color: 0xbfe9e3, metalness: 0.6, roughness: 0.25, envMapIntensity: 1
    });

    /* Molécula: anel hexagonal + ramificações */
    var seg = isSmall ? 28 : 48;
    var molecule = new THREE.Group();
    var atoms = [];
    var R = 1.55;
    for (var k = 0; k < 6; k++) {
      var a = (k / 6) * Math.PI * 2;
      atoms.push({ p: new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, Math.sin(a * 2) * 0.25), r: 0.48, m: k % 2 ? glass : accent });
    }
    var branches = [
      [0, 2.15, 0.4, 0.38], [3, 2.0, -0.5, 0.42], [1, 1.9, 0.6, 0.32], [4, 2.2, -0.3, 0.36]
    ];
    var bonds = [];
    for (var j = 0; j < 6; j++) bonds.push([j, (j + 1) % 6]);
    branches.forEach(function (b) {
      var base = atoms[b[0]].p;
      var dir = base.clone().setZ(0).normalize();
      atoms.push({ p: base.clone().add(dir.multiplyScalar(b[1] - R + 1.2)).setZ(b[2]), r: b[3], m: glass });
      bonds.push([b[0], atoms.length - 1]);
    });

    var sphereGeo = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.66));
    atoms.forEach(function (at, idx) {
      var mesh = new THREE.Mesh(sphereGeo, at.m);
      mesh.position.copy(at.p);
      mesh.scale.setScalar(at.r);
      mesh.userData = { base: at.p.clone(), phase: idx * 0.9 };
      molecule.add(mesh);
    });

    var cylGeo = new THREE.CylinderGeometry(0.07, 0.07, 1, isSmall ? 10 : 16, 1, true);
    var up = new THREE.Vector3(0, 1, 0);
    bonds.forEach(function (bd) {
      var a1 = atoms[bd[0]].p, a2 = atoms[bd[1]].p;
      var mid = a1.clone().add(a2).multiplyScalar(0.5);
      var dir = a2.clone().sub(a1);
      var bond = new THREE.Mesh(cylGeo, bondMat);
      bond.position.copy(mid);
      bond.scale.set(1, dir.length(), 1);
      bond.quaternion.setFromUnitVectors(up, dir.normalize());
      molecule.add(bond);
    });

    /* Órbita */
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.018, 8, isSmall ? 96 : 160),
      new THREE.MeshBasicMaterial({ color: 0x8fe3d8, transparent: true, opacity: 0.45 })
    );
    ring.rotation.set(1.15, 0.2, 0);
    var orbiter = new THREE.Mesh(sphereGeo, accent);
    orbiter.scale.setScalar(0.16);

    var rig = new THREE.Group();
    rig.add(molecule, ring, orbiter);
    scene.add(rig);

    /* Partículas (poeira de gelo) */
    var count = isSmall ? 180 : 520;
    var pGeo = new THREE.BufferGeometry();
    var pArr = new Float32Array(count * 3);
    for (var n = 0; n < count; n++) {
      var rr = 3 + Math.random() * 6;
      var th = Math.random() * Math.PI * 2;
      var ph = Math.acos(2 * Math.random() - 1);
      pArr[n * 3] = rr * Math.sin(ph) * Math.cos(th);
      pArr[n * 3 + 1] = rr * Math.cos(ph) * 0.7;
      pArr[n * 3 + 2] = rr * Math.sin(ph) * Math.sin(th) - 2;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
    var dots = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xbff5ec, size: isSmall ? 0.05 : 0.04, transparent: true, opacity: 0.7,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(dots);

    /* Tamanho */
    function resize() {
      var w = sceneEl.clientWidth, h = sceneEl.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Garante que a molécula caiba em telas estreitas (360px+)
      var fit = Math.max(1, 1.05 / camera.aspect);
      camera.position.z = (isSmall ? 13 : 12.5) * Math.min(fit, 1.6);
      camera.updateProjectionMatrix();
    }
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(sceneEl);
    else window.addEventListener("resize", resize);
    resize();

    /* Interação: ponteiro no desktop, rolagem em todos */
    var target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    if (!isCoarse) {
      window.addEventListener("pointermove", function (e) {
        target.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
        target.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
      }, { passive: true });
    }
    var scrollP = 0;
    window.addEventListener("scroll", function () {
      scrollP = Math.min(window.scrollY / (window.innerHeight || 1), 1.2);
    }, { passive: true });

    /* Loop com pausa fora da tela */
    var running = false, visible = true, last = 0, elapsed = 0;
    var clock = new THREE.Clock();

    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      // ~30 fps em celulares para poupar bateria
      if (isSmall && now - last < 32) return;
      last = now;
      var dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;
      render(elapsed);
    }

    function render(t) {
      cur.x += (target.x - cur.x) * 0.05;
      cur.y += (target.y - cur.y) * 0.05;

      rig.rotation.y = t * 0.18 + cur.x + scrollP * 1.4;
      rig.rotation.x = -0.25 + cur.y + Math.sin(t * 0.4) * 0.06 + scrollP * 0.3;
      rig.position.y = Math.sin(t * 0.7) * 0.12 + scrollP * 1.2;
      var s = 1 - scrollP * 0.18;
      rig.scale.setScalar(s);

      molecule.children.forEach(function (m) {
        if (!m.userData.base) return;
        m.position.y = m.userData.base.y + Math.sin(t * 1.2 + m.userData.phase) * 0.05;
      });

      var oa = t * 0.9;
      orbiter.position.set(Math.cos(oa) * 3.6, 0, Math.sin(oa) * 3.6).applyEuler(ring.rotation);
      dots.rotation.y = t * 0.02;

      renderer.render(scene, camera);
    }

    function play() {
      if (running || reduceMotion) return;
      running = true; clock.getDelta();
      requestAnimationFrame(frame);
    }
    function pause() { running = false; }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) play(); else pause();
      }).observe(sceneEl);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause(); else if (visible) play();
    });

    render(0.6);
    sceneEl.classList.add("is-ready");
    play();
  }
})();
