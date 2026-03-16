"use client"

import { useMemo, useRef } from "react"
import { extend, useFrame } from "@react-three/fiber"
import * as THREE from "three"

class PlanetMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color("#6482e6") },
        color2: { value: new THREE.Color("#3657b9") },
        color3: { value: new THREE.Color("#6353df") },
        color4: { value: new THREE.Color("#d6fffd") },  
        color5: { value: new THREE.Color("#84a6e6") }, 
        lightDir: { value: new THREE.Vector3(1,1,1).normalize() }
      },

      vertexShader: `
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        void main() {
          vPos = position;
          vNormal = normal;
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,

      fragmentShader: `
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 color4;
        uniform vec3 color5;
        uniform vec3 lightDir;

        vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
        vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
        vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}

        float snoise(vec3 v){
          const vec2 C=vec2(1.0/6.0,1.0/3.0);
          const vec4 D=vec4(0.0,0.5,1.0,2.0);

          vec3 i=floor(v+dot(v,C.yyy));
          vec3 x0=v-i+dot(i,C.xxx);

          vec3 g=step(x0.yzx,x0.xyz);
          vec3 l=1.0-g;
          vec3 i1=min(g.xyz,l.zxy);
          vec3 i2=max(g.xyz,l.zxy);

          vec3 x1=x0-i1+C.xxx;
          vec3 x2=x0-i2+C.yyy;
          vec3 x3=x0-D.yyy;

          i=mod289(i);
          vec4 p=permute(
            permute(
              permute(
                i.z+vec4(0.0,i1.z,i2.z,1.0)
              )+i.y+vec4(0.0,i1.y,i2.y,1.0)
            )+i.x+vec4(0.0,i1.x,i2.x,1.0)
          );

          vec4 j=p-49.0*floor(p/49.0);
          vec4 x_=floor(j/7.0);
          vec4 y_=floor(j-7.0*x_);
          vec4 x=x_*0.142857142857+0.0714285714286;
          vec4 y=y_*0.142857142857+0.0714285714286;
          vec4 h=1.0-abs(x)-abs(y);

          vec4 b0=vec4(x.xy,y.xy);
          vec4 b1=vec4(x.zw,y.zw);

          vec4 s0=floor(b0)*2.0+1.0;
          vec4 s1=floor(b1)*2.0+1.0;
          vec4 sh=-step(h,vec4(0.0));

          vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
          vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;

          vec3 p0=vec3(a0.xy,h.x);
          vec3 p1=vec3(a0.zw,h.y);
          vec3 p2=vec3(a1.xy,h.z);
          vec3 p3=vec3(a1.zw,h.w);

          vec4 norm=inversesqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
          p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;

          vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
          m=m*m;

          return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
        }

        float fbm(vec3 p){
          float v=0.0;
          float a=0.5;
          vec3 shift = vec3(100.0);

          for(int i=0;i<6;i++){
            v+=a*snoise(p);
            p = p * 2.0 + shift;
            a*=0.5;
          }

          return v;
        }

        float ridgedNoise(vec3 p) {
          return 1.0 - abs(snoise(p));
        }

        float ridgedFbm(vec3 p) {
          float v = 0.0;
          float a = 0.5;
          vec3 shift = vec3(100.0);

          for(int i=0;i<5;i++){
            v += a * ridgedNoise(p);
            p = p * 2.0 + shift;
            a *= 0.5;
          }

          return v;
        }

        void main(){
          vec3 p = vPos * 2.0;

          float terrain1 = fbm(p * 0.4 + time * 0.01);
          float terrain2 = ridgedFbm(p * 2.8 - time * 0.005);
          float terrain3 = snoise(p * 1.6 + time * 0.02) * 0.3;

          float combinedTerrain = terrain1 * 0.7 + terrain2 * 0.2 + terrain3 * 0.1;

          float biome = snoise(vPos * 0.3 + time * 0.003);
          float height = smoothstep(-0.3, 0.8, combinedTerrain + biome * 0.2);

          vec3 col;
          if (height < 0.3) {
            col = mix(color1, color2, height * 3.33);
          } else if (height < 0.6) {
            col = mix(color2, color3, (height - 0.3) * 3.33);
          } else if (height < 0.8) {
            col = mix(color3, color4, (height - 0.6) * 5.0);
          } else {
            col = mix(color4, color5, (height - 0.8) * 5.0);
          }

          if (biome > 0.3) {
            col = mix(col, color5, biome * 0.3);
          }

          vec3 normal = normalize(vNormal);
          float light = max(dot(normal, lightDir), 0.0);
          float shadow = smoothstep(0.0, 0.2, light);

          float rim = pow(1.0 - dot(normal, vec3(0,0,1)), 4.0);
          vec3 rimColor = mix(color3, color5, 0.5);

          col *= 0.3 + shadow * 0.7;
          col += rim * rimColor * 0.1;

          float sparkle = pow(max(dot(normal, normalize(vec3(1,1,1))), 0.0), 20.0);
          col += sparkle * color5 * 0.05;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    })
  }
}

extend({ PlanetMaterial })

export default function Planet() {
  const ref = useRef<THREE.Mesh>(null)
  const material = useMemo(() => new PlanetMaterial(), [])

  useFrame((state) => {
    if (!ref.current) return

    ref.current.rotation.y += 0.002
    material.uniforms.time.value = state.clock.elapsedTime
  })

  return (
    <mesh ref={ref} material={material}>
      <sphereGeometry args={[1.5, 256, 256]} />
    </mesh>
  )
}
