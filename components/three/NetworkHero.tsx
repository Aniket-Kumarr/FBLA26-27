"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * "Community constellation" — a rotating network of glowing nodes (people/clubs)
 * linked to their nearest neighbours, with light pulses travelling along links.
 * Pauses when offscreen or the tab is hidden, still frame for reduced motion.
 */

const POINT_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uTwinkle;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = mix(1.0, 0.6 + 0.4 * sin(uTime * 1.7 + aPhase), uTwinkle);
    gl_PointSize = aSize * uPixelRatio * tw * (9.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vAlpha = tw * mix(0.18, 1.0, smoothstep(-10.5, -5.5, mv.z));
  }
`;

const POINT_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float a = pow(core, 2.2) + smoothstep(0.12, 0.0, d) * 0.6;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const WHITE = new THREE.Color("#ffffff");
const INDIGO = new THREE.Color("#a5b4fc");
const TEAL = new THREE.Color("#5eead4");

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,0.9)");
  grd.addColorStop(0.25, "rgba(165,180,252,0.35)");
  grd.addColorStop(0.6, "rgba(94,234,212,0.08)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function NetworkHero({ className = "", centered = false }: { className?: string; centered?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 6.5, 11);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const root = new THREE.Group();
    scene.add(root);
    const disposables: { dispose: () => void }[] = [];

    const N = small ? 150 : 240;
    const R = 2.25;
    const nodes: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const jitter = 1 + (Math.random() - 0.5) * 0.14;
      nodes.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(R * jitter));
    }

    const pointUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uTwinkle: { value: reduceMotion ? 0 : 1 },
    };
    const pointMaterial = new THREE.ShaderMaterial({
      uniforms: pointUniforms,
      vertexShader: POINT_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(pointMaterial);

    const nodeGeo = new THREE.BufferGeometry();
    const nodePos = new Float32Array(N * 3);
    const nodeSize = new Float32Array(N);
    const nodePhase = new Float32Array(N);
    const nodeColor = new Float32Array(N * 3);
    nodes.forEach((v, i) => {
      v.toArray(nodePos, i * 3);
      const hub = Math.random() < 0.08;
      nodeSize[i] = hub ? 22 + Math.random() * 10 : 7 + Math.random() * 7;
      nodePhase[i] = Math.random() * Math.PI * 2;
      const roll = Math.random();
      (roll < 0.7 ? WHITE : roll < 0.88 ? INDIGO : TEAL).toArray(nodeColor, i * 3);
    });
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
    nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(nodeSize, 1));
    nodeGeo.setAttribute("aPhase", new THREE.BufferAttribute(nodePhase, 1));
    nodeGeo.setAttribute("aColor", new THREE.BufferAttribute(nodeColor, 3));
    disposables.push(nodeGeo);
    root.add(new THREE.Points(nodeGeo, pointMaterial));

    const edges: [number, number][] = [];
    const seen = new Set<string>();
    for (let i = 0; i < N; i++) {
      const dists: { j: number; d: number }[] = [];
      for (let j = 0; j < N; j++) if (j !== i) dists.push({ j, d: nodes[i].distanceToSquared(nodes[j]) });
      dists.sort((a, b) => a.d - b.d);
      for (let k = 0; k < 3; k++) {
        const j = dists[k].j;
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([i, j]);
        }
      }
    }
    const linePos = new Float32Array(edges.length * 6);
    const lineCol = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], e) => {
      nodes[a].toArray(linePos, e * 6);
      nodes[b].toArray(linePos, e * 6 + 3);
      const c = Math.random() < 0.8 ? WHITE : INDIGO;
      c.toArray(lineCol, e * 6);
      c.toArray(lineCol, e * 6 + 3);
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending });
    disposables.push(lineGeo, lineMat);
    root.add(new THREE.LineSegments(lineGeo, lineMat));

    const P = small ? 28 : 48;
    const pulses = Array.from({ length: P }, () => ({ edge: Math.floor(Math.random() * edges.length), t: Math.random(), speed: 0.25 + Math.random() * 0.45 }));
    const pulseGeo = new THREE.BufferGeometry();
    const pulsePos = new Float32Array(P * 3);
    const pulseCol = new Float32Array(P * 3);
    for (let i = 0; i < P; i++) (i % 2 ? TEAL : INDIGO).toArray(pulseCol, i * 3);
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3));
    pulseGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(P).fill(16), 1));
    pulseGeo.setAttribute("aPhase", new THREE.BufferAttribute(new Float32Array(P).map(() => Math.random() * 6.28), 1));
    pulseGeo.setAttribute("aColor", new THREE.BufferAttribute(pulseCol, 3));
    disposables.push(pulseGeo);
    root.add(new THREE.Points(pulseGeo, pointMaterial));
    const tmp = new THREE.Vector3();
    const updatePulses = (dt: number) => {
      for (let i = 0; i < P; i++) {
        const p = pulses[i];
        p.t += p.speed * dt;
        if (p.t >= 1) {
          const end = edges[p.edge][1];
          const next = edges.findIndex(([a], idx) => a === end && idx !== p.edge);
          p.edge = next >= 0 ? next : Math.floor(Math.random() * edges.length);
          p.t = 0;
        }
        const [a, b] = edges[p.edge];
        tmp.lerpVectors(nodes[a], nodes[b], p.t).toArray(pulsePos, i * 3);
      }
      pulseGeo.attributes.position.needsUpdate = true;
    };
    updatePulses(0);

    const coreGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xa5b4fc, wireframe: true, transparent: true, opacity: 0.12 });
    disposables.push(coreGeo, coreMat);
    const core = new THREE.Mesh(coreGeo, coreMat);
    root.add(core);

    const glowTex = makeGlowTexture();
    const glowMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 });
    disposables.push(glowTex, glowMat);
    const glow = new THREE.Sprite(glowMat);
    glow.scale.setScalar(5.2);
    root.add(glow);

    const rings = new THREE.Group();
    root.add(rings);
    const satellites: { mesh: THREE.Mesh; radius: number; speed: number; angle: number }[] = [];
    const satGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    disposables.push(satGeo, satMat);
    [
      { radius: 3.05, tiltX: 1.25, tiltZ: 0.35, speed: 0.35, color: 0xffffff, opacity: 0.16 },
      { radius: 3.45, tiltX: 1.75, tiltZ: -0.55, speed: -0.22, color: 0x5eead4, opacity: 0.12 },
    ].forEach((cfg) => {
      const g = new THREE.Group();
      g.rotation.set(cfg.tiltX, 0, cfg.tiltZ);
      const ringGeo = new THREE.TorusGeometry(cfg.radius, 0.005, 6, 220);
      const ringMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: cfg.opacity });
      disposables.push(ringGeo, ringMat);
      g.add(new THREE.Mesh(ringGeo, ringMat));
      const sat = new THREE.Mesh(satGeo, satMat);
      g.add(sat);
      satellites.push({ mesh: sat, radius: cfg.radius, speed: cfg.speed, angle: Math.random() * 6.28 });
      rings.add(g);
    });

    const Dn = small ? 200 : 400;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(Dn * 3);
    for (let i = 0; i < Dn; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 22;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(Dn).map(() => 2 + Math.random() * 3), 1));
    dustGeo.setAttribute("aPhase", new THREE.BufferAttribute(new Float32Array(Dn).map(() => Math.random() * 6.28), 1));
    dustGeo.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(Dn * 3).fill(0.75), 3));
    disposables.push(dustGeo);
    const dust = new THREE.Points(dustGeo, pointMaterial);
    scene.add(dust);

    let offsetX = 0;
    let redrawStill: (() => void) | null = null;
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      offsetX = !centered && camera.aspect > 1.15 ? Math.min(2.6, 1.1 * camera.aspect) : 0;
      root.scale.setScalar(camera.aspect > 1.15 ? 1 : 0.82);
      redrawStill?.();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const clock = new THREE.Clock();
    let spin = 0;
    let tiltX = 0;
    let tiltY = 0;
    let raf = 0;
    let visible = true;

    const renderFrame = (dt: number) => {
      const t = clock.elapsedTime;
      pointUniforms.uTime.value = t;
      spin += dt * 0.09;
      tiltY += (pointer.x * 0.35 - tiltY) * Math.min(1, dt * 3);
      tiltX += (pointer.y * 0.25 - tiltX) * Math.min(1, dt * 3);
      root.rotation.set(0.25 + tiltX, spin + tiltY, 0);
      core.rotation.set(-t * 0.15, -t * 0.22, 0);
      satellites.forEach((s) => {
        s.angle += s.speed * dt;
        s.mesh.position.set(Math.cos(s.angle) * s.radius, Math.sin(s.angle) * s.radius, 0);
      });
      rings.rotation.y = t * 0.04;
      dust.rotation.y = t * 0.01;
      updatePulses(dt);
      root.position.set(offsetX, 0, 0);
      renderer.render(scene, camera);
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
    if (reduceMotion) renderFrame(0);
    else start();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
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
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [centered]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
