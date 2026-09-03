import{c as i,bE as m,bF as y,j as d,m as h,bG as M,l as x,bH as k,bI as c}from"./index-C4zRtTNe.js";import{r as u}from"./react-vendor-S6w1S69P.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=i("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=i("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=i("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);function C(t){const e=m(()=>y(t)),{isStatic:n}=u.useContext(d);if(n){const[,o]=u.useState(t);u.useEffect(()=>e.on("change",o),[])}return e}function p(t,e){const n=C(e()),o=()=>n.set(e());return o(),h(()=>{const s=()=>x.preRender(o,!1,!0),a=t.map(r=>r.on("change",s));return()=>{a.forEach(r=>r()),M(o)}}),n}const b=t=>t&&typeof t=="object"&&t.mix,g=t=>b(t)?t.mix:void 0;function I(...t){const e=!Array.isArray(t[0]),n=e?0:-1,o=t[0+n],s=t[1+n],a=t[2+n],r=t[3+n],f=k(s,a,{mixer:g(a[0]),...r});return e?f(o):f}function V(t){c.current=[],t();const e=p(c.current,t);return c.current=void 0,e}function q(t,e,n,o){if(typeof t=="function")return V(t);const s=typeof e=="function"?e:I(e,n,o);return Array.isArray(t)?l(t,s):l([t],([a])=>s(a))}function l(t,e){const n=m(()=>[]);return p(t,()=>{n.length=0;const o=t.length;for(let s=0;s<o;s++)n[s]=t[s].get();return e(n)})}export{L as B,B as C,j as I,q as a,C as u};
