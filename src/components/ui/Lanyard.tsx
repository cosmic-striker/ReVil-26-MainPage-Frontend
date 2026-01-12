/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame, ThreeElement } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer, Html } from '@react-three/drei';
import Chatbot from '@/components/ui/Chatbot';
import { Bot } from 'lucide-react';
import {
    BallCollider,
    CuboidCollider,
    Physics,
    RigidBody,
    useRopeJoint,
    useSphericalJoint,
    RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

// Assets loaded from public folder
const cardGLB = '/card.glb';
const lanyard = '/Revil_logo_exact.png';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
    interface ThreeElements {
        meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
        meshLineMaterial: Omit<ThreeElement<typeof MeshLineMaterial>, 'args'> & { args?: any };
    }
}

interface LanyardProps {
    position?: [number, number, number];
    gravity?: [number, number, number];
    fov?: number;
    transparent?: boolean;
}

export default function Lanyard({
    position = [-20, 0, 25],
    gravity = [0, -40, 0],
    fov = 20,
    transparent = true
}: LanyardProps) {
    const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);

    const initialPosition = useRef(position);

    useEffect(() => {
        const handleResize = (): void => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
            <Canvas
                camera={{ position: initialPosition.current, fov }}
                dpr={[1, 1.5]} // Cap max DPR at 1.5 for performance
                gl={{ alpha: transparent, antialias: false }} // Disable default antialias (dpr handles it)
                onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
            >
                <CameraRig position={position} />
                <ambientLight intensity={Math.PI} />
                <Physics gravity={gravity} timeStep={1 / 60}>
                    <Band isMobile={isMobile} />
                </Physics>
                <Environment blur={0.75}>
                    <Lightformer
                        intensity={2}
                        color="white"
                        position={[0, -1, 5]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={3}
                        color="white"
                        position={[-1, -1, 1]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={3}
                        color="white"
                        position={[1, 1, 1]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={10}
                        color="white"
                        position={[-10, 0, 14]}
                        rotation={[0, Math.PI / 2, Math.PI / 3]}
                        scale={[100, 10, 1]}
                    />
                </Environment>
            </Canvas>
        </div>
    );
}

function CameraRig({ position }: { position: [number, number, number] }) {
    useFrame((state, delta) => {
        const easing = 0.5; // Softer ease for "nice effect"
        state.camera.position.lerp(new THREE.Vector3(...position), easing * delta);
    });
    return null; // This component strictly controls the camera
}

interface BandProps {
    maxSpeed?: number;
    minSpeed?: number;
    isMobile?: boolean;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }: BandProps) {
    // Using "any" for refs since the exact types depend on Rapier's internals
    const band = useRef<any>(null);
    const fixed = useRef<any>(null);
    const j1 = useRef<any>(null);
    const j2 = useRef<any>(null);
    const j3 = useRef<any>(null);
    const card = useRef<any>(null);

    const vec = new THREE.Vector3();
    const ang = new THREE.Vector3();
    const rot = new THREE.Vector3();
    const dir = new THREE.Vector3();

    const segmentProps: any = {
        type: 'dynamic' as RigidBodyProps['type'],
        canSleep: true,
        colliders: false,
        angularDamping: 4,
        linearDamping: 4
    };

    // const { nodes, materials } = useGLTF(cardGLB) as any;
    const texture = useTexture(lanyard);
    const [curve] = useState(
        () =>
            new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
    );
    const [dragged, drag] = useState<false | THREE.Vector3>(false);
    const [hovered, hover] = useState(false);

    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1.5]);
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1.5]);
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1.5]);
    useSphericalJoint(j3, card, [
        [0, 0, 0],
        [0, 0.9, 0]
    ]);

    useEffect(() => {
        if (hovered) {
            document.body.style.cursor = dragged ? 'grabbing' : 'grab';
            return () => {
                document.body.style.cursor = 'auto';
            };
        }
    }, [hovered, dragged]);

    useFrame((state, delta) => {
        if (dragged && typeof dragged !== 'boolean') {
            vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
            dir.copy(vec).sub(state.camera.position).normalize();
            vec.add(dir.multiplyScalar(state.camera.position.length()));
            [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
            card.current?.setNextKinematicTranslation({
                x: vec.x - dragged.x,
                y: vec.y - dragged.y,
                z: vec.z - dragged.z
            });
        }
        if (fixed.current) {
            [j1, j2].forEach(ref => {
                if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
                const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
                ref.current.lerped.lerp(
                    ref.current.translation(),
                    delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
                );
            });
            curve.points[0].copy(j3.current.translation());
            curve.points[1].copy(j2.current.lerped);
            curve.points[2].copy(j1.current.lerped);
            curve.points[3].copy(fixed.current.translation());
            band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
            ang.copy(card.current.angvel());
            rot.copy(card.current.rotation());
            card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
        }
    });

    curve.curveType = 'chordal';
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    return (
        <>
            <group position={[0, 4, 0]}>
                <RigidBody ref={fixed} {...segmentProps} type={'fixed' as RigidBodyProps['type']} />
                <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody
                    position={[2, 0, 0]}
                    ref={card}
                    {...segmentProps}
                    type={dragged ? ('kinematicPosition' as RigidBodyProps['type']) : ('dynamic' as RigidBodyProps['type'])}
                >
                    <CuboidCollider args={[0.74, 1.05, 0.01]} />
                    <group
                        scale={1.5}
                        position={[0, 0, -0.05]}
                        onPointerOver={() => hover(true)}
                        onPointerOut={() => hover(false)}
                        onPointerUp={(e: any) => {
                            e.target.releasePointerCapture(e.pointerId);
                            drag(false);
                        }}
                        onPointerDown={(e: any) => {
                            e.target.setPointerCapture(e.pointerId);
                            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
                        }}
                    >
                        {/* Placeholder for missing card.glb */}
                        <mesh>
                            <boxGeometry args={[0.8, 1.125, 0.05]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.5} envMapIntensity={1.5} />
                        </mesh>

                        {/* 3D Chatbot Interface - Desktop Only */}
                        {/* 3D Chatbot Interface - Desktop vs Icon - Mobile */}
                        <Html
                            transform
                            wrapperClass="html-screen"
                            scale={isMobile ? 0.3 : 0.17}
                            position={[0, 0, 0.05]}
                            rotation={[0, 0, 0]}
                            zIndexRange={[100, 0]}
                        >
                            {isMobile ? (
                                <div className="w-[100px] h-[100px] flex items-center justify-center bg-black rounded-full border-2 border-white/20 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                                    <Bot size={60} className="text-primary animate-pulse" />
                                </div>
                            ) : (
                                <div className="w-[300px] h-[422px] bg-black" onPointerDown={(e) => e.stopPropagation()}>
                                    <Chatbot is3D={true} />
                                </div>
                            )}
                        </Html>
                        {/* 
                        <mesh geometry={nodes.card.geometry}>
                            <meshPhysicalMaterial
                                map={materials.base.map}
                                map-anisotropy={16}
                                clearcoat={isMobile ? 0 : 1}
                                clearcoatRoughness={0.15}
                                roughness={0.9}
                                metalness={0.8}
                            />
                        </mesh>
                        <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
                        <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
                        */}
                    </group>
                </RigidBody>
            </group>
            <mesh ref={band}>
                <meshLineGeometry />
                <meshLineMaterial
                    color="white"
                    depthTest={false}
                    resolution={[600, 600]} // Reduced for performance
                    useMap={1}
                    map={texture}
                    repeat={[-3, 1]}
                    lineWidth={0.8}
                />
            </mesh>
        </>
    );
}
