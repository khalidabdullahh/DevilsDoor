# 🏃 Physics Engine Kinematics & Verlet Rope Simulation

> **Vault Hub**: [[⛩️_00_MASTER_INDEX]]  
> **Related**: [[Prompt_02_Responsive_Physics_&_SubPixel_Collisions]], [[Prompt_05_Official_6_Hero_Roster_&_Verlet_Cloth_Scarf]]

---

## 📐 Kinematics Mathematical Specifications

### 1. Jump Kinematics & Variable Height
- Upward Impulse: $v_{y0} = -520\text{ px/s}$
- Gravity Acceleration: $g = 1450\text{ px/s}^2$
- Theoretical Jump Peak Height:
  $$h_{\text{peak}} = \frac{v_{y0}^2}{2g} = \frac{(-520)^2}{2 \times 1450} \approx 93.24\text{ px}$$
- Time to Peak:
  $$t_{\text{peak}} = \frac{|v_{y0}|}{g} = \frac{520}{1450} \approx 0.358\text{ s}$$

---

## 🧣 9-Node Verlet Cloth Scarf Mathematics

For each node $i \in \{1, 2, \dots, 8\}$:
$$\vec{x}_i^{(t+\Delta t)} = \vec{x}_i^{(t)} + (\vec{x}_i^{(t)} - \vec{x}_i^{(t-\Delta t)}) \cdot \gamma + \vec{a}_{\text{ext}} \Delta t^2$$

where $\gamma = 0.92$ is the aerodynamic drag damping factor and $\vec{a}_{\text{ext}} = (w_x, g_{\text{cloth}})$.

### Distance Constraint Relaxation
For segment $(i, i+1)$ with target length $L_0 = 7\text{px}$:
$$\Delta \vec{d} = \vec{x}_{i+1} - \vec{x}_i, \quad d = \|\Delta \vec{d}\|$$
$$\vec{x}_i \gets \vec{x}_i + \frac{1}{2} \left(\frac{d - L_0}{d}\right) \Delta \vec{d}, \quad \vec{x}_{i+1} \gets \vec{x}_{i+1} - \frac{1}{2} \left(\frac{d - L_0}{d}\right) \Delta \vec{d}$$

---
*Related: [[⛩️_00_MASTER_INDEX]], [[Playable_Shinobi_Roster_Dossier]]*
