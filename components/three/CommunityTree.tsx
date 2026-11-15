"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/components/a11y/A11yProvider";
import { CONNECTED_ORGS, FALLING_NONPROFITS, type TreeOrg } from "@/lib/communityTree";

/**
 * Half a canopy. The left side is every business on the hub, tied together.
 * The right side is bare — Charlotte that is not connected yet.
 * One leaf drops at a time and is a single non-profit, the way the staircase
 * names one organization per step.
 */

const LEFT = CONNECTED_ORGS.length;
const DROPS = FALLING_NONPROFITS;

/** Tips of one half of the canopy. Negative x is the connected side. */
function canopy(count: number, side: -1 | 1) {
  const pts: THREE.Vector3[] = [];
  const cols = Math.max(3, Math.round(Math.sqrt(count)));
  const rows = Math.ceil(count / cols);
  let i = 0;
  for (let r = 0; r < rows; r++) {
    const v = rows === 1 ? 0.5 : r / (rows - 1);
    const y = 2.7 + v * 4.6;
    const width = 1.6 + Math.sin(v * Math.PI) * 2.5;
    const inRow = Math.min(cols, count - i);
    for (let c = 0; c < inRow; c++) {
      const u = inRow === 1 ? 0.55 : 0.18 + (c / (inRow - 1)) * 0.82;
      const x = side * (0.55 + u * width);
      const z = (c - (inRow - 1) / 2) * 0.72 + Math.sin(r * 1.7 + c) * 0.18;
      pts.push(new THREE.Vector3(x, y, z));
      i++;
    }
  }
  return pts;
}

export default function CommunityTree({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const label = labelRef.current;
    if (!mount || !label) return;
    const titleEl = label.querySelector("[data-title]") as HTMLElement;
    const orgEl = label.querySelector("[data-org]") as HTMLElement;
    const dotEl = label.querySelector("[data-dot]") as HTMLElement;

    const reduceMotion = prefersReducedMotion();
    const small = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    mount.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.045);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    camera.position.set(0.2, 4.4, 14.5);
    camera.lookAt(0, 3.6, 0);

    scene.add(new THREE.HemisphereLight(0xc7d2fe, 0x0a0a0a, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(4, 10, 8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x5eead4, 0.28);
    fill.position.set(-6, 4, 2);
    scene.add(fill);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(d: T) => (disposables.push(d), d);

    const bark = track(new THREE.MeshStandardMaterial({ color: 0xcbb89a, roughness: 0.86, metalness: 0.04 }));
    const bare = track(new THREE.MeshStandardMaterial({ color: 0x3a3f4d, roughness: 0.9, metalness: 0.02 }));

    const trunk = new THREE.Mesh(track(new THREE.CylinderGeometry(0.28, 0.46, 7.4, 10)), bark);
    trunk.position.y = 3.5;
    scene.add(trunk);

    const leftEnds = canopy(LEFT, -1);
    const rightEnds = canopy(7, 1);

    const addBranch = (end: THREE.Vector3, material: THREE.Material) => {
      const start = new THREE.Vector3(0, end.y * 0.42, 0);
      const mid = new THREE.Vector3(end.x * 0.42, end.y * 0.78, end.z * 0.35);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const tube = new THREE.Mesh(track(new THREE.TubeGeometry(curve, 10, 0.055, 5, false)), material);
      scene.add(tube);
    };
    leftEnds.forEach((p) => addBranch(p, bark));
    rightEnds.forEach((p) => addBranch(p, bare));

    const leafGeo = track(new THREE.SphereGeometry(0.16, 10, 8));
    const leaves: THREE.Mesh[] = leftEnds.map((p, i) => {
      const org = CONNECTED_ORGS[i];
      const mat = track(
        new THREE.MeshStandardMaterial({
          color: org.color,
          emissive: org.color,
          emissiveIntensity: 0.55,
          roughness: 0.35,
        })
      );
      const mesh = new THREE.Mesh(leafGeo, mat);
      mesh.position.copy(p);
      scene.add(mesh);
      return mesh;
    });

    // Each business is tied to its two nearest neighbours on the same half.
    const linkPos: number[] = [];
    for (let i = 0; i < leaves.length; i++) {
      const near = leaves
        .map((m, j) => ({ j, d: i === j ? Infinity : leaves[i].position.distanceTo(m.position) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      for (const n of near) {
        if (n.j < i) continue;
        const a = leaves[i].position;
        const b = leaves[n.j].position;
        linkPos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const linkGeo = track(new THREE.BufferGeometry());
    linkGeo.setAttribute("position", new THREE.Float32BufferAttribute(linkPos, 3));
    const links = new THREE.LineSegments(
      linkGeo,
      track(new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.35 }))
    );
    scene.add(links);

    const ground = new THREE.Mesh(
      track(new THREE.CircleGeometry(7.5, 40)),
      track(new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 1 }))
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const dropGeo = track(new THREE.SphereGeometry(0.2, 12, 10));
    const dropMat = track(
      new THREE.MeshStandardMaterial({ color: 0xfda4af, emissive: 0xfda4af, emissiveIntensity: 0.9, roughness: 0.3 })
    );
    const drop = new THREE.Mesh(dropGeo, dropMat);
    drop.visible = false;
    scene.add(drop);

    const ndc = new THREE.Vector3();
    let dropIndex = 0;
    let dropT = reduceMotion ? 1 : 0;
    let hold = reduceMotion ? 2 : 0;
    let from = leftEnds[0].clone();

    const showOrg = (org: TreeOrg) => {
      titleEl.textContent = org.name;
      orgEl.textContent = org.kindLabel;
      dotEl.style.background = org.color;
      dropMat.color.set(org.color);
      dropMat.emissive.set(org.color);
    };

    const beginDrop = () => {
      const org = DROPS[dropIndex % DROPS.length];
      const host = leaves.find((_, i) => CONNECTED_ORGS[i].name === org.name) ?? leaves[dropIndex % leaves.length];
      from = host.position.clone();
      showOrg(org);
      drop.visible = true;
      dropT = 0;
      hold = 0;
      dropIndex += 1;
    };

    if (DROPS.length) beginDrop();

    let raf = 0;
    let visible = true;
    const clock = new THREE.Clock();

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const placeLabel = () => {
      ndc.copy(drop.position).project(camera);
      const x = (ndc.x * 0.5 + 0.5) * mount.clientWidth;
      const y = (-ndc.y * 0.5 + 0.5) * mount.clientHeight;
      const falling = drop.visible && dropT < 1.15;
      label.style.opacity = falling ? "1" : "0";
      label.style.transform = `translate(${x + 16}px, ${y - 28}px)`;
    };

    const frame = (dt: number) => {
      if (!reduceMotion && DROPS.length) {
        if (dropT < 1) {
          dropT += dt * 0.42;
          const t = Math.min(1, dropT);
          const fall = t * t;
          drop.position.set(from.x + t * 0.35, from.y - fall * (from.y + 0.15), from.z);
          const host = leaves.find((_, i) => CONNECTED_ORGS[i].name === DROPS[(dropIndex - 1) % DROPS.length].name);
          if (host) host.scale.setScalar(1 - t * 0.85);
        } else {
          hold += dt;
          if (hold > 1.35) {
            leaves.forEach((m) => m.scale.setScalar(1));
            beginDrop();
          }
        }
      } else if (DROPS.length) {
        drop.position.set(from.x, 0.25, from.z);
        drop.visible = true;
      }
      renderer.render(scene, camera);
      placeLabel();
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      frame(Math.min(clock.getDelta(), 0.05));
    };
    frame(0);
    if (!reduceMotion) {
      clock.getDelta();
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={mountRef} className={`relative h-full w-full ${className}`}>
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap rounded-2xl border border-white/15 bg-black/70 px-4 py-2.5 opacity-0 shadow-[0_12px_40px_-12px_rgba(253,164,175,0.45)] backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <span data-dot className="h-2 w-2 rounded-full bg-rose-300" />
          <span data-title className="text-sm font-semibold text-white" />
        </div>
        <span data-org className="mt-0.5 block pl-[18px] text-xs font-medium text-gray-400" />
      </div>
    </div>
  );
}
