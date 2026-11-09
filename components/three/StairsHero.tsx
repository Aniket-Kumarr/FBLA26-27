"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * "Keep climbing" — a chrome coin stamped with the CLT CommunityHub logo hops up an
 * endless staircase. The motion is physical: anticipation crouch, ballistic arc
 * (constant forward speed + gravity), whole flips so the logo always lands upright,
 * trampoline steps, damped secondary bounces and a settling wobble. The camera
 * follows the coin with a soft lag. Each landing lights the step and pops a real
 * community milestone. Shadows + contact shading + bloom. Pauses offscreen.
 */

// Big steps, few in frame — keeps the eye on the coin
const W = 1.95; // step run
const H = 1.18; // step rise
const D = 6.4; // step depth
const BLOCK_H = 22;
const N = 14; // blocks kept alive
const R = 0.56; // coin radius
const T = 0.15; // coin thickness
const COIN_Z = 1.6;
const GRAVITY = 22; // for the post-landing bounces (world units / s²)
const BASE_YAW = -0.75; // coin turned so the logo faces the camera at an angle

const MILESTONES = [
  { title: "Joined a club", org: "CAIVO", color: "#5eead4" },
  { title: "Found a tutor", org: "STEMReach", color: "#a5b4fc" },
  { title: "Volunteered", org: "Snack Packs for Hope", color: "#fda4af" },
  { title: "Ran a charity race", org: "Stride Forward Foundation", color: "#ffffff" },
  { title: "Took a class", org: "AP Computer Science Principles", color: "#a5b4fc" },
  { title: "Supported a non-profit", org: "ESSAM", color: "#fda4af" },
  { title: "Learned with peers", org: "ESL Teen Tutors", color: "#5eead4" },
  { title: "Started your own club", org: "on CLT CommunityHub", color: "#ffffff" },
];

const SPARK_VERTEX = /* glsl */ `
  attribute float aAlpha;
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (12.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vAlpha = aAlpha;
  }
`;
const SPARK_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.8) * vAlpha;
    gl_FragColor = vec4(uColor * 2.2, a);
  }
`;

function radialTexture(stops: [number, string][], size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Horizontal alpha ramp: opaque at u=1, clear at u=0 (used for contact shading). */
function rampTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 4;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 256, 0);
  grd.addColorStop(0, "rgba(0,0,0,0)");
  grd.addColorStop(0.6, "rgba(0,0,0,0.25)");
  grd.addColorStop(1, "rgba(0,0,0,0.85)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 4);
  return new THREE.CanvasTexture(c);
}

export default function StairsHero({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const label = labelRef.current;
    if (!mount || !label) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    } catch {
      return; // CSS fallback glow stays visible
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.6);
    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    mount.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 12, 24);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    // viewed from the left and above, looking down the climb
    const camOffset = new THREE.Vector3(-7.6, 6.6, 12.4);
    const camTarget = new THREE.Vector3(1.1, 1.0, 0.4);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(d: T) => (disposables.push(d), d);

    // ---------- Studio environment (for chrome reflections) ----------
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    disposables.push(envRT, pmrem);

    // ---------- Lights ----------
    scene.add(new THREE.HemisphereLight(0x50557f, 0x000000, 0.06));
    // faint fill from the left so the shadowed risers keep a hint of form
    const fill = new THREE.DirectionalLight(0xb8bfe8, 0.22);
    fill.position.set(-8, 6, 6);
    scene.add(fill);
    // main light: a tight pool that tracks the coin, from the upper right, casting
    // each higher step's shadow across the tread below
    const spot = new THREE.SpotLight(0xffffff, 450, 40, 0.36, 0.95, 1.5);
    spot.castShadow = true;
    spot.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    spot.shadow.camera.near = 6;
    spot.shadow.camera.far = 40;
    spot.shadow.bias = -0.0004;
    spot.shadow.normalBias = 0.03;
    scene.add(spot, spot.target);
    const SPOT_OFFSET = new THREE.Vector3(10.5, 14, 5);
    const rim = new THREE.DirectionalLight(0x8b93ff, 1.8);
    rim.position.set(7, 5, -8);
    scene.add(rim);
    const coinLight = new THREE.PointLight(0xc7d2fe, 4, 4, 2);
    scene.add(coinLight);

    // ---------- Steps ----------
    const blockGeo = track(new RoundedBoxGeometry(W * 0.992, BLOCK_H, D, 5, 0.07));
    blockGeo.translate(0, -BLOCK_H / 2, 0); // top surface at y = 0
    const blockMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x17161f, // dark, near-neutral with a hint of violet
        roughness: 0.6,
        metalness: 0.08,
        clearcoat: 0.35,
        clearcoatRoughness: 0.5,
        envMapIntensity: 0.08,
      })
    );
    const edgeGeo = track(new THREE.BoxGeometry(W * 0.9, 0.012, 0.012));
    const glowTex = track(
      radialTexture([
        [0, "rgba(255,255,255,0.9)"],
        [0.3, "rgba(165,180,252,0.45)"],
        [0.7, "rgba(94,234,212,0.08)"],
        [1, "rgba(0,0,0,0)"],
      ])
    );
    const glowGeo = track(new THREE.PlaneGeometry(W * 1.6, D * 0.9));
    glowGeo.rotateX(-Math.PI / 2);

    // contact shading where each tread meets the next riser (fake ambient occlusion)
    const ramp = track(rampTexture());
    const aoMat = track(
      new THREE.MeshBasicMaterial({ map: ramp, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
    );
    const treadAOGeo = track(new THREE.PlaneGeometry(W * 0.45, D));
    treadAOGeo.rotateX(-Math.PI / 2); // lies on the tread; ramp darkens toward +x (the riser)
    const riserAOGeo = track(new THREE.PlaneGeometry(0.5, D)); // on the riser, dark at its foot
    riserAOGeo.rotateZ(-Math.PI / 2);
    riserAOGeo.rotateY(-Math.PI / 2);

    type Block = {
      group: THREE.Group;
      glowMat: THREE.MeshBasicMaterial;
      edgeMat: THREE.MeshBasicMaterial;
      glow: number;
      dy: number; // trampoline displacement
      vy: number; // trampoline velocity
    };
    const blocks: Block[] = [];
    for (let j = 0; j < N; j++) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(blockGeo, blockMat);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const treadAO = new THREE.Mesh(treadAOGeo, aoMat);
      treadAO.position.set(W / 2 - (W * 0.45) / 2, 0.004, 0);
      group.add(treadAO);
      const riserAO = new THREE.Mesh(riserAOGeo, aoMat);
      riserAO.position.set(-W / 2 - 0.004, -H + 0.25, 0);
      group.add(riserAO);

      const edgeMat = track(new THREE.MeshBasicMaterial({ color: 0xc7d2fe, transparent: true, opacity: 0.16 }));
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.set(0, -0.03, D / 2 + 0.002);
      group.add(edge);

      const glowMat = track(
        new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(0, 0.006, COIN_Z - 0.4);
      group.add(glow);
      scene.add(group);
      blocks.push({ group, glowMat, edgeMat, glow: 0, dy: 0, vy: 0 });
    }
    const blockAt = (i: number) => blocks.find((b) => b.group.userData.i === i);

    // ---------- Coin with the CLT logo ----------
    let redrawStill: (() => void) | null = null;
    const logoTex = new THREE.TextureLoader().load("/ct.png", () => redrawStill?.());
    logoTex.colorSpace = THREE.SRGBColorSpace;
    logoTex.anisotropy = 8;
    disposables.push(logoTex);
    const coinGeo = track(new THREE.CylinderGeometry(R, R, T, 96, 1));
    coinGeo.rotateX(Math.PI / 2); // faces point at the camera (+z / -z)
    const sideMat = track(new THREE.MeshPhysicalMaterial({ color: 0xc9cce0, metalness: 1, roughness: 0.16, envMapIntensity: 1.2 }));
    const faceMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xb9bdd6,
        metalness: 1,
        roughness: 0.28,
        envMapIntensity: 1.0,
        bumpMap: logoTex,
        bumpScale: 6,
        emissive: 0xa5b4fc,
        emissiveMap: logoTex,
        emissiveIntensity: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
      })
    );
    const coin = new THREE.Mesh(coinGeo, [sideMat, faceMat, faceMat]);
    coin.castShadow = true;
    const coinPivot = new THREE.Group(); // squash/stretch lives here (never rotates)
    coinPivot.add(coin);
    scene.add(coinPivot);

    const haloTex = track(
      radialTexture(
        [
          [0, "rgba(199,210,254,0.55)"],
          [0.4, "rgba(129,140,248,0.18)"],
          [1, "rgba(0,0,0,0)"],
        ],
        128
      )
    );
    const haloMat = track(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(2.8);
    scene.add(halo);

    const rippleGeo = track(new THREE.RingGeometry(R * 0.92, R * 1.02, 64));
    rippleGeo.rotateX(-Math.PI / 2);
    const rippleMat = track(new THREE.MeshBasicMaterial({ color: 0xc7d2fe, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    scene.add(ripple);
    let rippleT = 1;
    let rippleStep = 0;

    // ---------- Spark trail ----------
    const SP = small ? 50 : 90;
    const sPos = new Float32Array(SP * 3);
    const sAlpha = new Float32Array(SP);
    const sSize = new Float32Array(SP);
    const sparks = Array.from({ length: SP }, () => ({ life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, cam: 0 }));
    const sparkGeo = track(new THREE.BufferGeometry());
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    sparkGeo.setAttribute("aAlpha", new THREE.BufferAttribute(sAlpha, 1));
    sparkGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
    const sparkMat = track(
      new THREE.ShaderMaterial({
        uniforms: { uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color(0xc7d2fe) } },
        vertexShader: SPARK_VERTEX,
        fragmentShader: SPARK_FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    sparkPoints.frustumCulled = false;
    scene.add(sparkPoints);
    let sparkCursor = 0;

    // ---------- Floating dust (drifts upward) ----------
    const DU = small ? 140 : 240;
    const dPos = new Float32Array(DU * 3);
    for (let i = 0; i < DU; i++) {
      dPos[i * 3] = (Math.random() - 0.5) * 26;
      dPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      dPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
    }
    const dustGeo = track(new THREE.BufferGeometry());
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    dustGeo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(DU).map(() => 0.12 + Math.random() * 0.3), 1));
    dustGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(DU).map(() => 2 + Math.random() * 4), 1));
    const dustMat = track(
      new THREE.ShaderMaterial({
        uniforms: { uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color(0x8b93c9) } },
        vertexShader: SPARK_VERTEX,
        fragmentShader: SPARK_FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    scene.add(dust);

    // ---------- Post-processing ----------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.6, 0.88);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ---------- Sizing / composition ----------
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w / 2, h / 2);
      camera.aspect = w / h;
      if (camera.aspect > 1.2) camera.setViewOffset(w, h, -w * 0.2, -h * 0.02, w, h);
      else camera.clearViewOffset();
      camera.zoom = camera.aspect < 1 ? 0.62 + camera.aspect * 0.25 : 1;
      camera.updateProjectionMatrix();
      redrawStill?.();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ---------- Interaction ----------
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // ---------- Milestone label ----------
    const titleEl = label.querySelector<HTMLElement>("[data-title]")!;
    const orgEl = label.querySelector<HTMLElement>("[data-org]")!;
    const dotEl = label.querySelector<HTMLElement>("[data-dot]")!;
    let milestone = 0;
    let labelStep = -1;
    let labelAge = 99;
    const showMilestone = (step: number) => {
      const m = MILESTONES[milestone++ % MILESTONES.length];
      titleEl.textContent = m.title;
      orgEl.textContent = m.org;
      dotEl.style.background = m.color;
      dotEl.style.boxShadow = `0 0 12px 2px ${m.color}`;
      labelStep = step;
      labelAge = 0;
    };
    const tmpV = new THREE.Vector3();
    const placeLabel = (cam: number) => {
      const visible = labelAge < 1.5;
      const fadeIn = Math.min(1, labelAge / 0.25);
      const fadeOut = 1 - Math.max(0, (labelAge - 1.15) / 0.35);
      label.style.opacity = visible ? String(Math.max(0, fadeIn * fadeOut)) : "0";
      if (!visible) return;
      tmpV.set((labelStep - cam) * W, (labelStep - cam) * H + R * 2 + 0.85 + labelAge * 0.1, COIN_Z);
      tmpV.project(camera);
      const x = (tmpV.x * 0.5 + 0.5) * mount.clientWidth;
      const y = (-tmpV.y * 0.5 + 0.5) * mount.clientHeight;
      label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%) scale(${0.9 + fadeIn * 0.1})`;
    };

    // ---------- Coin state machine ----------
    // rest  → crouch (anticipation) → air (ballistic) → land (bounces + wobble) → rest …
    type Phase = "rest" | "crouch" | "air" | "land";
    const coinState = {
      phase: (reduceMotion ? "rest" : "crouch") as Phase,
      t: 0,
      step: 1, // the step the coin is on (or launched from)
      span: 1, // steps covered by the current jump
      airTime: 0.62,
      apex: 1.1,
      restFor: 0.5,
      roll: 0, // multiples of 2π at rest → logo upright
      rollFrom: 0,
      bounceY: 0, // height above the tread after landing
      bounceV: 0,
      squash: 0, // >0 squash, <0 stretch (spring-driven)
      squashV: 0,
      wobble: 0, // settling rock (radians)
      wobbleV: 0,
      lastSpan: 1,
    };
    let camS = coinState.step; // camera follows the coin's progress (in step units)

    const startJump = () => {
      const big = coinState.lastSpan === 1 && Math.random() < 0.2;
      coinState.span = big ? 2 : 1;
      coinState.lastSpan = coinState.span;
      coinState.airTime = big ? 0.86 : 0.6 + Math.random() * 0.06;
      coinState.apex = big ? 1.85 : 1.0 + Math.random() * 0.2;
      coinState.rollFrom = coinState.roll;
      coinState.phase = "air";
      coinState.t = 0;
      const from = blockAt(coinState.step);
      if (from) from.vy += 1.4; // the step springs up as it releases the coin
      coinState.squash = -0.14; // stretch on take-off
      coinState.squashV = 0;
    };

    const land = () => {
      coinState.step += coinState.span;
      coinState.phase = "land";
      coinState.t = 0;
      coinState.roll = coinState.rollFrom - Math.PI * 2 * coinState.span; // whole flips → logo upright
      const impact = coinState.span === 2 ? 1.35 : 1;
      const blk = blockAt(coinState.step);
      if (blk) {
        blk.vy -= 2.5 * impact; // trampoline dip
        blk.glow = 1;
      }
      coinState.bounceY = 0;
      coinState.bounceV = 2.4 * impact; // first rebound
      coinState.squash = 0.26 * impact;
      coinState.squashV = 0;
      coinState.wobble = 0;
      coinState.wobbleV = 3.2 * impact; // rocks as it settles
      rippleT = 0;
      rippleStep = coinState.step;
      showMilestone(coinState.step);
    };

    // ---------- Animation ----------
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    let camX = 0;
    let camY = 0;

    const renderFrame = (dt: number) => {
      const rect = mount.getBoundingClientRect();
      const scrollP = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
      const cs = coinState;
      cs.t += dt;

      // --- coin progress (in step units) and height above its base tread ---
      let progress = cs.step;
      let airY = 0;
      let airS = 0;
      if (cs.phase === "crouch") {
        // anticipation: compress into the step before pushing off
        cs.squash += (0.18 - cs.squash) * Math.min(1, dt * 18);
        if (cs.t > 0.14) startJump();
      } else if (cs.phase === "air") {
        airS = Math.min(1, cs.t / cs.airTime);
        // ballistic: constant forward speed + parabolic height (constant gravity)
        progress = cs.step + cs.span * airS;
        airY = cs.span * H * airS + 4 * cs.apex * airS * (1 - airS);
        cs.roll = cs.rollFrom - Math.PI * 2 * cs.span * airS; // steady spin, whole flips
        if (airS >= 1) land();
      } else if (cs.phase === "land") {
        // damped secondary bounces on the (springy) tread
        cs.bounceV -= GRAVITY * dt;
        cs.bounceY += cs.bounceV * dt;
        if (cs.bounceY < 0) {
          cs.bounceY = 0;
          if (cs.bounceV < -0.9) {
            const v = -cs.bounceV;
            cs.bounceV = v * 0.38; // restitution
            cs.squash = Math.min(0.22, v * 0.07);
            const blk = blockAt(cs.step);
            if (blk) blk.vy -= v * 0.35;
          } else cs.bounceV = 0;
        }
        if (cs.bounceV === 0 && cs.bounceY === 0 && Math.abs(cs.wobble) < 0.01 && cs.t > 0.5) {
          cs.phase = "rest";
          cs.t = 0;
          cs.restFor = 0.25 + Math.random() * 0.35;
        }
      } else if (cs.phase === "rest") {
        if (!reduceMotion && cs.t > cs.restFor) {
          cs.phase = "crouch";
          cs.t = 0;
          const blk = blockAt(cs.step);
          if (blk) blk.vy -= 0.7; // coin presses into the step before it jumps
        }
      }

      // squash/stretch + wobble springs
      if (cs.phase !== "crouch") {
        cs.squashV += (-260 * cs.squash - 14 * cs.squashV) * dt;
        cs.squash += cs.squashV * dt;
      }
      cs.wobbleV += (-120 * cs.wobble - 8 * cs.wobbleV) * dt;
      cs.wobble += cs.wobbleV * dt;

      // --- camera follows the coin with a soft lag ---
      camS += (progress - camS) * (1 - Math.exp(-dt * 3.2));
      const cam = camS;

      // --- blocks: window of logical steps around the camera + trampoline springs ---
      const startI = Math.floor(cam) - 5;
      blocks.forEach((b, j) => {
        const i = startI + ((((j - startI) % N) + N) % N);
        if ((b.group.userData.i as number | undefined) !== i) {
          b.group.userData.i = i;
          b.glow = 0;
          b.dy = 0;
          b.vy = 0;
        }
        for (let s = 0; s < 3; s++) {
          const h = dt / 3;
          b.vy += (-170 * b.dy - 7.5 * b.vy) * h;
          b.dy += b.vy * h;
        }
        b.group.position.set((i - cam) * W, (i - cam) * H + b.dy, 0);
        b.glow = Math.max(0, b.glow - dt * 0.8);
        b.glowMat.opacity = b.glow * 0.5;
        b.edgeMat.opacity = 0.14 + b.glow * 0.8;
      });

      // --- place the coin ---
      const base = blockAt(cs.step);
      const baseDy = cs.phase === "air" ? (base ? base.dy * (1 - airS) : 0) : base ? base.dy : 0;
      const cx = (progress - cam) * W;
      const cy = (cs.step - cam) * H + baseDy + R + (cs.phase === "air" ? airY : cs.bounceY) - cs.squash * R;
      coinPivot.position.set(cx, cy, COIN_Z);
      const sq = Math.max(-0.2, Math.min(0.3, cs.squash));
      coinPivot.scale.set(1 + sq * 0.55, 1 - sq, 1 + sq * 0.3);
      // tilt toward the camera mid-air, rock while settling
      const airTilt = cs.phase === "air" ? Math.sin(airS * Math.PI) * 0.35 : 0;
      coin.rotation.set(0.1, BASE_YAW + airTilt, cs.roll + cs.wobble);

      coinLight.position.set(cx - 0.4, cy + 0.8, COIN_Z + 1.4);
      halo.position.set(cx, cy, COIN_Z - 0.5);
      haloMat.opacity = 0.1 + (cs.phase === "air" ? Math.sin(airS * Math.PI) * 0.16 : 0);

      // spotlight tracks the coin so it's always the brightest thing on screen
      spot.target.position.set(cx, cy - R, COIN_Z - 0.6);
      spot.position.copy(spot.target.position).add(SPOT_OFFSET);

      // sparks while airborne
      if (cs.phase === "air" && !reduceMotion) {
        for (let k = 0; k < 2; k++) {
          const s = sparks[sparkCursor++ % SP];
          s.life = 1;
          s.cam = cam;
          s.x = cx - 0.25 + (Math.random() - 0.5) * 0.3;
          s.y = cy + (Math.random() - 0.5) * 0.45;
          s.z = COIN_Z + (Math.random() - 0.5) * 0.3;
          s.vx = -0.4 - Math.random() * 0.5;
          s.vy = 0.15 + Math.random() * 0.35;
          s.vz = (Math.random() - 0.5) * 0.4;
        }
      }
      for (let i = 0; i < SP; i++) {
        const s = sparks[i];
        if (s.life > 0) {
          s.life -= dt * 1.4;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.z += s.vz * dt;
        }
        const shift = cam - s.cam; // stay put in the world as the camera moves
        sPos[i * 3] = s.x - shift * W;
        sPos[i * 3 + 1] = s.y - shift * H;
        sPos[i * 3 + 2] = s.z;
        sAlpha[i] = Math.max(0, s.life);
        sSize[i] = 3 + s.life * 6;
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkGeo.attributes.aAlpha.needsUpdate = true;
      sparkGeo.attributes.aSize.needsUpdate = true;

      // ripple rides the landing step
      rippleT = Math.min(1, rippleT + dt * 1.3);
      const rb = blockAt(rippleStep);
      ripple.position.set((rippleStep - cam) * W, (rippleStep - cam) * H + 0.012 + (rb ? rb.dy : 0), COIN_Z);
      ripple.scale.setScalar(1 + rippleT * 2.4);
      rippleMat.opacity = (1 - rippleT) * 0.45;

      for (let i = 0; i < DU; i++) {
        dPos[i * 3 + 1] += dt * 0.22;
        if (dPos[i * 3 + 1] > 8) dPos[i * 3 + 1] = -8;
      }
      dustGeo.attributes.position.needsUpdate = true;

      // camera: parallax + recede on scroll
      camX += (pointer.x * 0.9 - camX) * Math.min(1, dt * 2);
      camY += (-pointer.y * 0.6 - camY) * Math.min(1, dt * 2);
      camera.position.set(camOffset.x + camX, camOffset.y + camY + scrollP * 1.5, camOffset.z + scrollP * 4);
      camera.lookAt(camTarget);

      labelAge += dt;
      composer.render(dt);
      placeLabel(cam);
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      renderFrame(Math.min(clock.getDelta(), 0.05));
    };
    const start = () => {
      if (reduceMotion || raf || !visible || document.hidden) return;
      clock.getDelta();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    redrawStill = () => {
      if (!raf) renderFrame(0);
    };
    if (reduceMotion) {
      showMilestone(1);
      labelAge = 0.6;
      renderFrame(0);
    } else start();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(mount);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      redrawStill = null;
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      composer.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={mountRef} className={`relative ${className}`} aria-hidden="true">
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-2xl border border-white/15 bg-black/70 px-4 py-2.5 opacity-0 shadow-[0_12px_40px_-12px_rgba(165,180,252,0.45)] backdrop-blur-md"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="flex items-center gap-2.5">
          <span data-dot className="h-2 w-2 rounded-full" />
          <span data-title className="text-sm font-semibold text-white" />
        </div>
        <span data-org className="mt-0.5 block pl-[18px] text-xs font-medium text-gray-400" />
      </div>
    </div>
  );
}
