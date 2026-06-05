import { Suspense, useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'

// ─── Mesh: blue glass material ────────────────────────────────────────────────
function PawnMesh() {
  const groupRef  = useRef()
  const scaledRef = useRef(false)

  const raw = useLoader(OBJLoader, '/chess-pawn/pawn.obj')
  const obj = useMemo(() => raw.clone(true), [raw])

  useEffect(() => {
    if (!obj) return
    const mat = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color('#1a5fc0'),
      roughness:          0.10,
      metalness:          0.30,
      clearcoat:          1,
      clearcoatRoughness: 0.3,
      reflectivity:       0,
      envMapIntensity:    1.8,
      transparent:        true,
      opacity:            1,
    })
    obj.traverse(c => { if (c.isMesh) c.material = mat })
  }, [obj])

  useFrame(() => {
    if (scaledRef.current || !groupRef.current) return
    const box = new THREE.Box3().setFromObject(groupRef.current)
    if (box.isEmpty()) return
    const size = box.getSize(new THREE.Vector3())
    if (size.y < 0.001) return
    const center = box.getCenter(new THREE.Vector3())
    const s = 2.2 / size.y
    groupRef.current.scale.setScalar(s)
    groupRef.current.position.set(-center.x * s, -center.y * s, -center.z * s)
    scaledRef.current = true
  })

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0.09]}>
      <primitive object={obj} />
    </group>
  )
}

// ─── Rig: section-aware X + Z-tilt, float-only vertical motion ───────────────
function PawnRig() {
  const { viewport } = useThree()
  const posRef  = useRef()
  const tiltRef = useRef()

  const clock    = useRef(0)
  const scrollVh = useRef(
    typeof window !== 'undefined' ? window.scrollY / (window.innerHeight || 1) : 0
  )

  const cur = useRef({ posX: 0, posY: 0, tiltZ: 0, op: 1 })
  const initialized = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      scrollVh.current = window.scrollY / (window.innerHeight || 1)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); initialized.current = false }
  }, [])

  useFrame((_, delta) => {
    if (!posRef.current || !tiltRef.current) return
    const k = 1 - Math.exp(-4.0 * delta)
    clock.current += delta

    const sp = scrollVh.current

    // S1(sp<0.5)  S2(0.5–1.5)  S3(sp≥1.5 — stays here)
    const X0 = Math.min(viewport.width * 0.4, 0)
    const targX     = sp < 0.5 ? X0
                    : sp < 1.5 ? -2
                    : -Math.min(viewport.width * 0.25, 3)

    const targTiltZ = sp < 0.5 ? 0
                    : sp < 1.5 ? -(Math.PI / 6)
                    : (Math.PI / 12)

    const targOp = 1

    // Exits upward the instant you scroll past S3; multiplier makes it vanish fast
    const targY = sp < 0.5 ? 0
                : sp < 1.5 ? 1
                : -0.2 + Math.max(0, sp - 2.0) * viewport.height * 2

    if (!initialized.current) {
      cur.current.posX  = targX
      cur.current.posY  = targY
      cur.current.tiltZ = targTiltZ
      cur.current.op    = targOp
      initialized.current = true
    } else {
      cur.current.posX  += (targX     - cur.current.posX)  * k
      cur.current.posY  += (targY     - cur.current.posY)  * k
      cur.current.tiltZ += (targTiltZ - cur.current.tiltZ) * k
      cur.current.op    += (targOp    - cur.current.op)    * k
    }

    // Float tied to tilt: full when upright (section 1), zero when tilted (section 2)
    const floatScale = Math.max(0, 1 - Math.abs(cur.current.tiltZ) / (Math.PI / 6))
    const floatY = Math.sin(clock.current * 0.8) * 0.10 * floatScale

    posRef.current.position.x   = cur.current.posX
    posRef.current.position.y   = cur.current.posY + floatY
    // Fixed 3/4-view Y angle so the pawn shows depth, not a flat silhouette
    tiltRef.current.rotation.y  = 0.45
    tiltRef.current.rotation.z  = cur.current.tiltZ
    posRef.current.scale.setScalar(cur.current.op)
    posRef.current.visible       = cur.current.op > 0.02
  })

  return (
    <group ref={posRef}>
      <group ref={tiltRef}>
        <Suspense fallback={null}>
          <PawnMesh />
        </Suspense>
      </group>
    </group>
  )
}

// ─── Scene ───────────────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect"   intensity={4}   position={[ 3,  4,  5]} scale={[10, 10, 1]} color="#ffffff" />
        <Lightformer form="rect"   intensity={2.5} position={[-5,  1,  3]} scale={[ 4, 10, 1]} color="#4a9eff" />
        <Lightformer form="rect"   intensity={2}   position={[ 4, -1, -4]} scale={[ 8,  5, 1]} color="#1565c0" />
        <Lightformer form="circle" intensity={2.2} position={[ 0,  5,  2]} scale={[ 5,  5, 1]} color="#a8d4ff" />
      </Environment>

      <ambientLight intensity={0.18} />
      <directionalLight position={[-5, 8, 6]} intensity={2.4} color="#fff8f0" />
      <pointLight position={[2, -3, 5]} intensity={1.4} color="#4a9eff" decay={2} />

      <PawnRig />
    </>
  )
}

// ─── Full-screen fixed canvas (desktop only) ──────────────────────────────────
export default function ChessPawn3D() {
  const wrapperRef = useRef(null)
  const [show, setShow] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  )
  useEffect(() => {
    const onResize = () => setShow(window.innerWidth >= 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  if (!show) return null

  return (
    <div ref={wrapperRef} style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
      <Canvas
        eventSource={wrapperRef}
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 8], fov: 36 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
