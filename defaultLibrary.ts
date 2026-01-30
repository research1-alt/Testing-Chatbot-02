
import { StoredFile } from './utils/db';

/**
 * MODULE 1: MATEL POWER TRAIN (12V SYSTEM)
 */
const matelContent = `
# TECHNICAL MANUAL: MATEL POWER TRAIN (12V)
... (Existing Matel Content) ...
## 1. Operational Procedures & Notes

### Power Flow System
1. **Aux Battery to FAB** (Fuse Box Input).
2. **FAB (Fuse Box Output)** to Emergency Switch input.
3. **Emergency Switch Output** to Ignition Switch Input.
4. **Ignition Switch Output** pin no 2 to MCU Relay at Pin no 30.

### Vehicle Start Sequence
- **Vehicle On Sequence:** 12V From aux Battery to FAB(Fuse Box Aux Battery INput), FAB (Output) to Emergency Switch input , Emergency Switch Output to Ignition Switch Input. Ignition Switch Have 2 Step for Power Distribution.
- **Step 1 (Key Turn):** Main 48V Battery turns ON. Cluster ON(Depend Upon Aux Battery).
- **Step 2 (Key Turn):** MCU turns ON. DC-output Relay On, Regen Relay got 12V, BFNR Switch got 12V(Depend Upon Aux Battery).
- ** So in both Condition if any function is depend on Aux Battery (12V) and not getting on First Check the Aux Battery Voltage After that another things.
- **About Cluster:** If we are Sloki Cluster, Sloki CLuster getting on if Aux Battery Volage Between 11V-14.3V, If Aux Battery Voltage is less or above than given range cluster will not getting on.
- ** Sloki Cluster also give to Digital output (Ground) once Cluster getting on. 1st Ground - 1second after cluster get power . 2nd Ground - After 3 Second of Cluster get Power.
- **Virya Cluster:- If we are using Virya cluster instead of Sloki, there is no delay option in cluster also all the relay which is operated through Delay will be operated by Common ground so when we are using sloki cluster we are getting delays and respected relays will be operated by delay but if we are using virya cluster we need to give ground to respected relay.
- ** If we are using Virya Cluster instead of Sloki Cluster in Matel Vehicle, there is 1 more coupler named VC. This Coupler include Ground at both Pin. so just connect this coupler with Delay coupler.
**Important Note on Odometer Saving:**
This sequence is critical for saving the odometer reading correctly. 
- **Startup:** Main Battery must turn on in Step 1, then MCU in Step 2.
- **Shutdown:** First MCU must turn off, then the Main Battery.
If this sequence fails, the odometer reading will not be saved. Check the Main Battery and MCU Relay sequence if issues persist.

### MCU Working Condition
1. MCU must receive **12V from the MCU Relay**.
2. **BFGNR Switch** must receive 12V from the Ignition Switch.
3. Put the vehicle in any mode (Forward, Boost, Gradient, or Reverse).
4. Once the mode appears in the Cluster, apply throttle gradually.
5. If the vehicle does not move, re-check the previous points.

### MCU Working Sequence
1- MCU get 48V 
2- MCU get 12V Ignition
3- After Working above both Condition BFGNR Switch get 12V. 
4- Throttle, Brake Pot and Encoder get 5V Supply From MCU. 

---

## 2. Troubleshooting: Vehicle Not Moving

1. **Check MCU Ignition:** Ensure it is ON.
   - If MCU is OFF, check if the MCU Relay is receiving power.
   - Check **12V at Pin 30**. If present, check **Pin 87a**.
   - If Pin 30 has no supply, check previous connections.
   - If Pin 30 has supply but Pin 87a does not:
     - Check the relay coil using a multimeter for supply between **Pin 86 & 85**.
     - If supply is present, check if the charger is connected or if an "Immobilize" command was given.
     - Remove charger or clear the immobilize command if necessary.

2. **Check MCU Fuse Box (FMCU):**
   - Check if both points of the fuse box have supply.
   - If the fuse is blown, replace it.
   - If both points have supply but MCU is still OFF, check continuity between the **Fuse Box output** and **MCU Pin 1 & 10**.
   - Replace wiring harness if continuity is missing.

3. **Check BFGNR Switch:**
   - Must have **12V from Ignition Switch Pin 2**.
   - If Pin 2 has 12V but BFGNR switch does not, check continuity between these points.
   - If continuity is missing, replace wiring or use a jumper from Ignition Switch Pin 2 to BFGNR Pin 1.

4. **Check Error Codes:** Check the Cluster for any visible error codes and follow specific resolution steps for that code.

---

## 3. Basic Technical Information: Matel MCU

- **MCU KSI:** 12V.
- **BFGNR Working:** 12V.
- **Throttle, Brake Pot & Encoder:** 5V.
- **Data Transmission:** 2 CAN Wires.
- **Modes:** 4 (Forward, Boost, Gradient, Reverse).
- **Operating Voltage:** 42V to 60V.
- **Throttle Voltage Range:** 0.8V to 4V.If any case throttle signal have more then 4 volt without giving throttle check throttle ground there will be a chance throttle ground is missing
- **Brake Pot Voltage:** Set between 0.6V – 0.8V (Operational range 0.6V to 4V).

---

## 4. Relay Specifications (Matel Power Train)

### 1. DC Output Relay (RDC_Output) - 12V, 5-Pin
- **Type:** RB6
- **Purpose:** Distributes 12V from DC-DC converter to components and Aux battery.
- **Pin 30:** 12V Input from DC Converter (via F12V fuse).
- **Pin 87:** 12V Output to components & Aux Battery charging.
- **Pin 87a:** 12V Output to Cluster Relay (during charging).
- **Pin 86:** 12V from Ignition Switch Pin 2.
- **Pin 85:** Cluster delay pin 2 (if using SLOKI Cluster).

### 2. Aux Battery Charging Relay - 48V, 5-Pin
- **Type:** RB6
- **Purpose:** Manages 12V Aux battery charging from the 48V system.
- **Operation:** Activates only when the charger is connected.
- **Pin 30:** 12V Supply from DC Converter.
- **Pin 87:** Output to Aux Battery (via 7.5A fuse).
- **Pin 86:** 48V Input from terminal box via Fuse Box.
- **Pin 85:** Ground from Charging Cutoff Connector Pin 2.

### 3. Regen Relay - 12V, 5-Pin
- **Type:** RB3
- **Purpose:** Glows the brake light during Regen activation.
- **Pin 30:** 12V Output to Brake Light.
- **Pin 87 & 86:** 12V Input from Ignition Switch Pin 2.
- **Pin 85:** Ground signal from VCU Pin 4.

### 4. 48V Battery Ignition Relay (R48VBatt) - 12V, 4-Pin
- **Type:** RB3
- **Purpose:** Engages the Main 48V Battery.
- **Pin 30 & 87:** Connected to Batt 6W terminals Pin 1 & 3.
- **Pin 86:** 12V from Ignition Switch Pin 3.
- **Pin 85:** Ground from Cluster Delay Pin 1.

### 5. Cluster Relay - 12V, 5-Pin
- **Type:** RB3
- **Purpose:** Controls power to the instrument cluster.
- **Pin 30:** Output to Cluster Meter.
- **Pin 87a:** Input from DC output Relay (during charging).
- **Pin 86:** Input from Ignition Switch Pin 3.
- **Pin 87:** 12V Supply from Ignition Switch Pin 3.
- **Pin 85:** Common Ground.

### 6. MCU Relay - RB3
- **Purpose:** Controls the wake-up for the MCU.
- **Pin 87a:** 12V Output to MCU wake-up (Orange wire).
- **Pin 30 & 86:** Looped; 12V input from Ignition Switch Pin 2.
- **Pin 85:** Ground from Charging Cutoff or Telematics.

---

## 5. Matel MCU Pin Positions

### MCU Connector 1
- **Pin 1:** From Ignition (12V Operated).
- **Pin 7:** XGND (Ground) to Encoder Pin 1.
- **Pin 8:** XGND (Ground) to Encoder Pin 7.
- **Pin 10:** From Ignition (12V Operated).
- **Pin 11:** CAN High.
- **Pin 12:** CAN Low.
- **Pin 15:** Cos N to Encoder Pin 4.
- **Pin 16:** Cos P to Encoder Pin 3.
- **Pin 17:** Sin P to Encoder Pin 5.
- **Pin 18:** Sin N to Encoder Pin 6.
- **Pin 19:** XDRP (5V to Encoder) to Encoder Pin 2.
- **Pin 20:** Motor Temperature to Encoder Pin 8.

### MCU Connector 2
- **Pin 1:** Reverse Mode.
- **Pin 2:** Throttle First Signal.
- **Pin 3:** Forward Mode.
- **Pin 4:** Ground to Regen Relay.
- **Pin 6:** Neutral Mode.
- **Pin 8:** Boost Mode.
- **Pin 9:** XGND (Ground from Controller).
- **Pin 10:** XDRP (5V from Controller).
- **Pin 11:** 2nd Throttle Signal.
- **Pin 12:** Gradient Mode.
- **Pin 14:** Brake Pot Signal.

---

## 6. Diode Test Procedure (Using Multimeter)

1. **Prepare Multimeter:** Set to **Diode Mode** (🔺|◄).
2. **Isolate MCU:** Disconnect all external connections.
3. **First Test Sequence:**
   - Red probe (+) to MCU 48V **Negative** terminal.
   - Black probe (-) to Phase R, then Y, then B.
4. **Second Test Sequence:**
   - Black probe (-) to MCU 48V **Positive** terminal.
   - Red probe (+) to Phase R, then Y, then B.
5. **Readings:**
   - A reading around **0.4V** indicates the circuit is OK.
   - A reading of **0.0V** (Short) or **OL** (Open) indicates damage.

---

## 7. Basic Connection

1. **BFGNR Switch Pin no 1 - 12V input from Ignition Switch Pin no 2, Mode Switch Input.
2. **BFGNR Switch Pin no 2 - 12V Output to MCU Connector 2, at Pin no 3 For Forward Mode.
3. **BFGNR Switch Pin no 3 - 12V Output to MCU Connector 2, at Pin no 8 For Boost Mode.
4. **BFGNR Switch Pin no 4 - 12V Output to MCU Connector 2, at Pin no 6 For Neutral Mode.
5. **BFGNR Switch Pin no 5 - 12V Output to MCU Connector 2, at Pin no 1 For Reverse Mode.
6. **BFGNR Switch Pin no 6 - 12V Output to MCU Connector 2, at Pin no 12 For Gradient Mode.
 Note. If any Mode is not Working please check these ablve given point.

`;

/**
 * MODULE 2: VIRYA GEN 1 - OLD WIRING
 */
const viryaGen1OldContent = `
# TECHNICAL MANUAL: VIRYA GEN 1 - OLD WIRING
... (Existing Virya Gen 1 Old Content) ...

## 1. Operational Procedures & Notes

### Power Flow System
1. **Aux Battery to FAB** (Fuse Box Input).
2. **FAB (Fuse Box Output)** to Emergency Switch input.
3. **Emergency Switch Output** to Ignition Switch Input.
4. **48 V From Terminal Box** to MCU Relay at Pin no 30.
5. **48V From Terminal Box to FDCI Diode** then S48V then MCU relay at pin no 30.

### Vehicle Start Sequence
- **Step 1 (Key Turn):** Main 48V Battery turns ON. Cluster ON.
- **Step 2 (Key Turn):** DC-output Relay On, Reverse Relay gets 12V.
- **Important:** When turning on the Vehicle at the first step, the Battery turns on first. After that, the terminal box has 48V supply. This 48V goes to the MCU Relay and then to the MCU at **pin no 1 & 2** for wake-up.

### MCU Working Condition
1. Main battery getting on.
2. MCU receives **48V after from Terminal Box via MCU Relay**.
3. **BFGNR Switch** gets Ground from **Common Ground line**.
4. Put the vehicle in any mode (Forward, Boost, Gradient or Reverse).
5. Once the Mode is in Cluster, give throttle gradually to move.

---

## 2. Troubleshooting: Vehicle Not Moving
1. Check if the **Main Battery** is getting on or not.
2. Check if **MCU Ignition** is on or off. Check **MCU Relay**.
3. Check **BFNR Input ground signal**.
4. Check **Throttle Input (5V)** supply and **Throttle Signal (0.8V)**.

---

## 3. Basic Information: Virya Gen 1 MCU
1. **MCU KSI:** 48V.
2. **BFGNR Working:** Ground.
3. **Throttle, Brake Pot & Encoder:** 5V.
4. **Data Transmission:** 2 Can Wire (Common Can).
5. **MCU Internal Can:** 2 Can Wire.
6. **Modes:** 3 (Forward, Boost, and Reverse).
7. **Operating Range:** 42V to 60V.
8. **Throttle Signal Range:** 0.8V to 4V.
9. **Brake Pot Set Point:** 0.6V – 0.8V.
10. **Brake Pot Range:** 0.6V to 4V.
11. **Cluster is getting on During Charging by DC output.


---

## 4. Relay Specifications & Operations

### A. Key Base Relay (48V Operating Range)
- **Purpose:** To operate 12V components using Aux Battery.
- **Pin 85:** Connected with Common Ground (Black).
- **Pin 86:** 48V Supply from CDIL Relay Pin 87a (Active only at Key ON).
- **Pin 30:** 12V Supply from Aux Battery via Fuse Box.
- **Pin 87:** 12V Supply going to 12V Component.
- **Working:** Once relay gets 48V and Ground, it connects Pin 30 & 87 to allow 12V component operation.
- **Note:** Relay does NOT get 48V during charging; Aux Battery is separate from 12V components then.

### B. Aux Charging Relay (48V Operating Range)
- **Purpose (Key On):** Components use 12V power from DC Converter.
- **Purpose (Charging):** For Aux Battery charging.
- **Pin 85:** Connected with Common Ground.
- **Pin 86:** 48V Supply from CDIL Relay Pin 87 (Active only during Charging).
- **Pin 30:** 12V Supply from DC Converter output via Fuse Box.
- **Pin 87:** 12V Supply to Aux Battery via Fuse Box.
- **Pin 87a:** 12V Supply to Key Base Relay Pin 87 and 12V components.
- **Working (Key On):** Relay is OFF (no 48V); 12V flows from Pin 30 to Pin 87a.
- **Working (Charging):** Relay gets 48V and turns ON; 12V flows from Pin 30 to Pin 87 to charge Aux Battery.

### C. CDIL Relay (48V Operating Range)
- **Purpose (Key On):** Turn on MCU Ignition.
- **Purpose (Charging):** Disconnect MCU and charge Aux Battery.
- **Pin 85:** Connected with Charging Cutoff Wire & IOT.
- **Pin 86:** 48V coming from MCU Pin 2.
- **Pin 30:** Loop with same relay Pin 86.
- **Pin 87a:** 48V supply to MCU Pin 4 and Key Base Relay Pin 86.
- **Pin 87:** 48V supply to Aux Charging Relay Pin 86.
- **Working (Key On):** Relay has 48V but no ground (coil off); 48V flows from Pin 30 to Pin 87a to wake up MCU.
- **Working (Charging/Immobilize):** Relay gets ground and turns ON; 48V flows to Pin 87 for charging, cutting supply to MCU (Pin 87a).

---

## 5. Circuitry & Connections

### Fuse Box Belongings
1. **F12V (15 Amp):** For DC Converter Output (12V).
2. **FAB (15 Amp):** For Aux Battery Protection.
3. **FDCI (7.5 Amp):** For DC Converter Input (48V).

### Vehicle Ignition Circuit (Virya Gen 1 Old)
- Path: **Batt 6W** → **Emergency Switch** (Red-Yellow) → **Ignition Switch** (Red-Yellow) → **Batt 6W** (Pink).
- *Note:* This harness uses 48V Battery Ignition for both switches.

### Mode Switch (BFNR) Connections
- **Pin 2:** 12V Supply from Aux via Fuse Box.
- **Pin 1:** 12V Supply to MCU at Pin 5 (Gray).
- **Pin 3:** 12V Supply to MCU at Pin 15 and 48V12V connector at Pin 3 (White).
- **Pin 4:** 12V Supply to MCU at Pin 13 (Orange-Green).

### MCU Pin Layout (Y4A Series MCU)
| Pin | Used | Wire Colour | Purpose |
|---|---|---|---|
| 1 | Throttle input | Red/White | 5V Supply to Throttle |
| 2 | 48V Controller Output | Red/Black | 48V Supply to CDIL Relay |
| 3 | Throttle Ground | Black/White | Ground to Throttle |
| 4 | MCU 48V Input | Orange/White | MCU ignition Signal (48V) |
| 5 | Boost Mode | Gray | Boost Mode Signal (12V) |
| 6 | Brake Pot Ground | Black/White | Ground For Brake Pot |
| 7 | Brake Pot 5V | Green/Yellow | 5V Supply to brake Pot |
| 8 | Throttle Signal | Green/White | Throttle Signal to MCU |
| 9 | MCU Internal Can Low | Blue/Black | MCU Internal Can Low |
| 10 | Brake Pot Signal | Green/Black | Brake Pot Signal to MCU |
| 12 | Can High | Yellow | Can High Signal to MCU |
| 13 | Forward Mode | Orange/Green | Forward Mode Signal (12V) |
| 14 | Can Low | Green | Can Low Signal to MCU |
| 15 | Reverse Mode | White | Reverse Mode Signal (12V) |
| 16 | MCU Internal Can High | Blue/Brown | MCU Internal Can High |

### External Connections
- **IOT/Telematics:** Pin 1 (Can High), Pin 2 (12V DC), Pin 3 (12V Aux), Pin 4 (Immobilize - Ground to CDIL), Pin 5 (Ground), Pin 6 (Can Low).
- **Common Can Line:** High (Yellow) to MCU 12/Batt 6w 6/Cluster 4. Low (Green) to MCU 14/Batt 6w 5/Cluster 2.

`;

/**
 * MODULE 3: VIRYA GEN 1 - NEW WIRING (AIS 156)
 */
const viryaGen1NewContent = `
# TECHNICAL MANUAL: VIRYA GEN 1 - AIS 156 (NEW WIRING)
... (Existing Virya Gen 1 New Content) ...
## 1. Operational Circuitry & Power Flow

### Vehicle Ignition Circuit (AIS 156)
- **Primary Source:** The **Aux Battery** is the main source for Battery Ignition & MCU Ignition.
- **Critical Note:** If the Aux Battery is discharged, the vehicle will NOT turn ON.
- **Path:** Aux Battery (+) → FAB (7.5A Fuse) → Emergency Switch (Pin 1 to Pin 2) → Ignition Switch (Pin 1).
- **Ignition Switch Outputs:**
    - From Pin 2: 12V to **RDC Output (Pin 86)** and **BFNR Switch (Pin 2)**.
    - From Pin 3: 12V to **R48VBatt (Pin 86)** and **Rcluster (Pin 86)**.

### Fuse Box Belongings & Uses
1. **FB Conv (15A):** Fuse for DC Converter Output (12V). Handles max load on DC output.
2. **FB Aux (7.5A):** Fuse for Aux Battery Protection.
3. **FH2 (7.5A):** Fuse for DC Converter Input (48V).
4. **FAB (1A):** 12V Aux Connector protection near Batt 6W Connector.

---

## 2. Relay Specifications & Logic

### A. Cluster Relay (12V 5-Pin Micro)
- **Purpose:** Turns on the cluster during Key ON and Charging.
- **Pin 30:** 12V Output to Cluster Meter (White/Red).
- **Pin 87:** 12V input from Ignition Switch Pin 3 (Pink/Yellow).
- **Pin 87a:** 12V Input from DC Converter Output Relay Pin 87a (Only during charging).
- **Pin 86:** Signal from Ignition/Charging.
- **Pin 85:** Common Ground.
- **Working:** During Key ON, it gets 12V from Ignition and ground, turning on the cluster via Aux Battery. During Charging, it gets 12V via Pin 87a from the DC Output relay.

### B. 48V Battery Ignition Relay (R48VBatt / RB3) (12V 4-Pin)
- **Purpose:** Engages the Main 48V Battery.
- **Pin 30:** Pink wire.
- **Pin 87:** Red/Yellow wire (to Batt 6W).
- **Pin 86:** 12V from Ignition Switch Pin 3 (Pink/Yellow).
- **Pin 85:** Ground from Cluster Delay .1.
- **Working:** Energized by ignition switch to short the battery ignition wires and turn on the 48V battery.

### C. MCU Relay (Virya Gen 1) (48V 5-Pin RB6)
- **Purpose:** Controls MCU wake-up and handles Charging/Immobilize cutoff.
- **Pin 30 & 86:** 48V Supply from Junction Box via FDCI Fuse.
- **Pin 87a:** 48V Output to MCU wake-up (MCU Pin 4).
- **Pin 85:** Ground from Charging Cutoff or IOT (Immobilizer).
- **Working:** During Drive (Key ON), relay is OFF (no ground), allowing 48V to flow to MCU Pin 4. During Charging or Immobilize, the relay gets ground, turns ON, and CUTS the supply to the MCU.

### D. DC Output Relay (RDC_Output) (12V 5-Pin)
- **Purpose:** Charges Aux Battery and operates 12V components.
- **Pin 30:** 12V Supply from DC Converter output via Fuse Box F12V.
- **Pin 87:** 12V Output to 12V components and Aux Battery charging.
- **Pin 87a:** 12V Supply to Cluster Relay at Pin 87a (Charging time only).
- **Pin 86:** 12V from Ignition Switch (I02).
- **Pin 85:** Ground from Cluster Delay .2.
- **Working:** During Key ON, relay connects Pin 30 to Pin 87. During Charging, relay is OFF, connecting Pin 30 to Pin 87a to power the cluster.

### E. Aux Charging Relay (RAB) (48V 4-Pin RB6)
- **Purpose:** Specifically for Aux Battery charging during external vehicle charging.
- **Pin 30:** 12V Supply from DC Converter via F12V.
- **Pin 87:** 12V Output to Aux Battery charging.
- **Pin 86:** 48V from Controller 16-Pin Connector Pin 2.
- **Pin 85:** Ground from Charging Cutoff Connector during charging.

---

## 3. Connections & Pin Layouts

### Mode Switch (BFNR) Connection
1. **Pin 2:** 12V Supply from Ignition Switch Pin 2.
2. **Pin 1:** 12V Supply to MCU Pin 5 (Gray).
3. **Pin 3:** 12V Supply to MCU Pin 15 and 48V12V connector Pin 3 (White).
4. **Pin 4:** 12V Supply to MCU Pin 13 (Orange-Green).

### Y4A Series MCU Pin Layout
| Pin | Used | Wire Colour | Purpose |
|---|---|---|---|
| 1 | Throttle input | Red/White | 5V Supply to Throttle |
| 2 | 48V Controller Output | Red/Black | 48V Supply to CDIL Relay |
| 3 | Throttle Ground | Black/White | Ground to Throttle |
| 4 | MCU 48V Input | Orange/White | MCU ignition Signal (48V) |
| 5 | Boost Mode | Gray | Boost Mode Signal to MCU (12V) |
| 6 | Brake Pot Ground | Black/White | Ground for Brake Pot |
| 7 | Brake Pot 5V | Green/Yellow | 5V Supply to Brake Pot |
| 8 | Throttle Signal | Green/White | Throttle Signal to MCU |
| 9 | MCU Internal Can Low | Blue/Black | MCU Internal Can Low |
| 10 | Brake Pot Signal | Green/Black | Brake Pot Signal to MCU |
| 12 | Can High | Yellow | Can High Signal to MCU |
| 13 | Forward Mode | Orange/Green | Forward Mode Signal to MCU (12V) |
| 14 | Can Low | Green | Can Low Signal to MCU |
| 15 | Reverse Mode | White | Reverse Mode Signal to MCU (12V) |
| 16 | MCU Internal Can High | Blue/Brown | MCU Internal Can High |

### Diode Uses
1. **CID:** Converter Input Diode (in 48V line) for single direction current flow.
2. **ADC:** Used for Aux Battery Charging through DC Converter Output (12V).

---

## 4. Functional Systems

### Charging Cutoff System
- When the charger is connected, the Charger Side Loop connects to the Vehicle Side Cutoff Connector.
- The **MCU Relay** gets ground at Pin 85.
- Since Pin 86 is connected to 48V, the relay activates and **CUTS the MCU KSI signal**. The vehicle cannot move.
- Simultaneously, the **Aux Charging Relay** gets ground and turns ON to charge the Aux Battery.

- Note:- If we are Using Taehwa Motor with Curtis Controller- Please remove shielding wire From Encoder Coupler also Please swap Motor Phase wire U & W. if After swaping vehicle is getting jerk connect motor phase wire in his previous condition.

`;

/**
 * MODULE 4: VIRYA GEN 2 POWER TRAIN
 */
const viryaGen2Content = `
# TECHNICAL MANUAL: VIRYA GEN 2 POWER TRAIN
... (Existing Virya Gen 2 Content) ...
## 1. Operational Procedures & Notes

### Power Flow System
1. **Aux Battery to FAB** (Fuse Box Input).
2. **FAB (Fuse Box Output)** to Emergency Switch input.
3. **Emergency Switch Output** to Ignition Switch Input.
4. **48 V From Terminal Box** to MCU Relay at Pin no 30.
5. **48V From Terminal Box to FDCI Diode** then S48V then MCU relay at pin no 30.

### Vehicle Start Sequence
- **Step 1 (Key Turn):** Main 48V Battery turns ON. Cluster ON.
- **Step 2 (Key Turn):** DC-output Relay On, Reverse Relay gets 12V.
- **Critical Logic:** When turning on the Vehicle at the first step, the Battery turns on first. After that, the terminal box has 48V supply. This 48V goes to the MCU Relay and then to the **MCU at pin no 1 & 2** for wake-up.

### MCU Working Condition
1. Main battery must be ON.
2. MCU receives **48V from Terminal Box via MCU Relay**.
3. **BFGNR Switch** receives Ground from Common Ground line.
4. Once the Mode is visible in the Cluster (Forward, Boost, Gradient, or Reverse), give throttle gradually to move.
5. If the vehicle does not move, re-verify points 1-3.

---

## 2. Troubleshooting: Vehicle Not Moving

### Initial Checks
1. Check if the **Main Battery** is turning on.
2. Check if **MCU Ignition** is on or off. Check the **MCU Relay**.
3. Check the **BFNR Input ground signal**.
4. Check **Throttle Input (5V)** supply and **Throttle Signal (0.8V)**.

### Detailed MCU Relay Diagnostics
- If MCU is off, check if MCU Relay is getting power.
- Check **48V at Pin 30**. If present, check **Pin 87a**.
- If Pin 30 has supply but 87a doesn't:
    - Check relay coil supply between **Pin 86 & 85**.
    - If coil has supply but 87a is dead: check if Charger is connected or if an **Immobilize command** is active.
    - Remove charger or remove immobilize command via IOT/Team member.
- If Pin 87a has supply:
    - Check **FMCU (MCU Fuse Box)**. Both points must have supply.
    - If fuse is blown, replace it.
    - If FMCU points have supply but MCU is off, check continuity between **Fuse Box output and MCU Pin 1 & 2**.

---

## 3. Relay Specifications (Virya Gen 2)

### 1. DC Output Relay (RDC_Output) - RB6 (12V, 5-Pin)
- **Purpose:** Distributes 12V power from DC-DC converter to components and Aux battery.
- **Pin 30:** 12V Input from DC Converter (via F12V fuse).
- **Pin 87:** 12V Output to 12V components & Aux Battery charging.
- **Pin 87a:** 12V Output to Cluster Relay (for charging time).
- **Pin 86:** 12V from Ignition Switch Pin 2.
- **Pin 85:** Connected to Common Ground (Virya Cluster).
- **Operation:** Provides 12V to components when vehicle is ON. During charging, relay stays OFF (no 12V coil supply), allowing DC output to go to Cluster via Pin 87a.

### 2. Aux Battery Charging Relay - RB6 (48V, 5-Pin)
- **Purpose:** Manages 12V Aux battery charging from the 48V system.
- **Operation:** Activates only when vehicle is connected to a charger.
- **Pin 30:** 12V Supply from DC Converter.
- **Pin 87:** Output to Aux Battery (via 7.5A fuse).
- **Pin 86:** 48V input from terminal box via Fuse Box.
- **Pin 85:** Ground from Charging Cutoff Connector Pin 2.

### 3. 48V Battery Ignition Relay (R48VBatt) - RB3 (12V, 4-Pin)
- **Purpose:** Engages the Main 48V battery.
- **Pin 30 & 87:** Connected to Batt 6W terminals Pin 1 & 3.
- **Pin 86:** 12V from Ignition Switch Pin 3.
- **Pin 85:** Ground from Cluster Delay Pin 1 (Sloki) or Common Ground (Virya).

### 4. Reverse Relay - RB3 (12V, 4-Pin)
- **Purpose:** Activates reverse tail lamp.
- **Pin 30:** 12V Supply from DC output Relay Pin 30.
- **Pin 87:** Output to Reverse Lamp (White) by 48v12V Connector.
- **Pin 86:** 12V Supply from Ignition Switch Pin 2.
- **Pin 85:** Ground from BFNR Switch during Reverse Mode (through Diode).

### 5. Cluster Relay - RB3 (12V, 5-Pin)
- **Purpose:** Controls power to the instrument cluster (AIS 156).
- **Pin 30:** Output to Cluster Meter.
- **Pin 87a:** Input from DC output Relay during charging.
- **Pin 86:** Input from Ignition Switch Pin 3.
- **Pin 85:** Common Ground.
- **Pin 87:** 12V Supply from Ignition Switch Pin 3.

### 6. MCU Relay - RB6
- **Purpose:** Controls the wake-up of the MCU.
- **Pin 30:** 48V output to MCU wake-up (Orange wire).
- **Pin 87a & 86:** Looped; 48V input from FDCI fuse (Gray wire).
- **Pin 85:** Ground from Charging Cutoff or Telematics (Immobilizer).
- **Operation:** Relay is normally OFF during Drive (supply goes to MCU). Relay turns ON to CUT supply during Charging or Immobilization.

---

## 4. E-Box Connector Pin Descriptions (23-Pin Amp Seal)
- **Connector Part Number:** 770680-1 (TE Connectivity)

| Pin | Description | Detail / Supply Detail |
|---|---|---|
| **1** | Controller Input Supply - Main | 48V from Terminal Block / Connector |
| **2** | Controller Input Supply - Interlock | 48V from Terminal Block / Connector |
| **3** | CAN HIGH | Software Flashing & Diagnosis |
| **4** | CAN LOW | Software Flashing & Diagnosis |
| **5** | FORWARD Switch I/P | 48V B- |
| **6** | BOOST Switch I/P | 48V B- |
| **7** | REVERSE Switch I/P | 48V B- |
| **8** | Throttle and Footbrake Supply | 5V from Controller |
| **9** | Throttle Pot - Wiper | Input to Controller |
| **10** | Brake Pot - Wiper | Input to Controller |
| **11** | CAN HIGH | Vehicle Communication |
| **12** | CAN LOW | Vehicle Communication |
| **13** | Encoder Power Supply | 5V from Controller |
| **14** | Motor Thermistor | Input to Controller |
| **15** | Encoder Sine | Input to Controller |
| **16** | Encoder Cosine | Input to Controller |
| **17** | Encoder 0V | 5V GND from Controller |
| **23** | Encoder Cable Shield | Not applicable |

---

## 5. Basic Technical Info (Virya Gen 2)
- **MCU KSI:** 48V.
- **BFGNR Working:** Ground based.
- **Throttle / Encoder:** 5V.
- **CAN:** 2 Wire for Data (Common) + 2 Wire for Internal MCU.
- **Modes:** 3 (Forward, Boost, and Reverse).
- **Voltage Range:** 42V to 60V.
- **Throttle Signal Range:** 0.8V to 4V.
- **Brake Pot Set Point:** 0.6V – 0.8V.
- **Brake Pot Range:** 0.6V to 4V.

`;

/**
 * MODULE 5: MASTER ERROR DIAGNOSTIC MANUAL (ERR-01 TO ERR-60)
 */
const masterErrorContent = `
# OSM MASTER ERROR DIAGNOSTIC MANUAL

## Error Mapping Table
This table provides a quick mapping of error numbers to their descriptions as displayed on the vehicle LCD.

| Error Number | Fault Description | Displayed in LCD |
|--------------|-------------------|------------------|
| 1 | Battery Fault | Err-1 |
| 2 | Battery Over Temperature | Err-2 |
| 3 | Battery Severe Over Temperature | Err-3 |
| 4 | Battery Under Temperature | Err-4 |
| 5 | Battery Severe Under Temperature | Err-5 |
| 6 | Battery Severe Over Voltage | Err-6 |
| 7 | Battery Over Voltage | Err-7 |
| 8 | Battery Under Voltage | Err-8 |
| 9 | Battery Severe Under Voltage | Err-9 |
| 10 | MOSFET Failure | Err-10 |
| 11 | Pre-charge Failure | Err-11 |
| 12 | Severe Dock Pos Temperature | Err-12 |
| 13 | Severe Dock Neg Temperature | Err-13 |
| 14 | Over Dock Pos Temperature | Err-14 |
| 15 | Over Dock Neg Temperature | Err-15 |
| 16 | Less Battery During Key On | Err-16 |
| 17 | Less Battery During Drive | Err-17 |
| 18 | Permanent Dock Pos Temp | Err-18 |
| 19 | Permanent Dock Neg Temp | Err-19 |
| 20 | MCU Communication | Err-20 |
| 21 | EV In Sense Malfunction | Err-21 |
| 30 | Controller Fault | Err-30 |
| 31 | Controller Overcurrent | Err-31 |
| 32 | Current Sensor Fault | Err-32 |
| 33 | Pre-charge Failed | Err-33 |
| 34 | Controller Severe Under temp | Err-34 |
| 35 | Controller Severe Over temp | Err-35 |
| 36 | Severe B+ Undervoltage | Err-36 |
| 37 | Severe KSI Undervoltage | Err-37 |
| 38 | Severe B+ Overvoltage | Err-38 |
| 39 | Severe KSI Overvoltage | Err-39 |
| 40 | Controller Over temp Cutback | Err-40 |
| 41 | B+ Undervoltage Cutback | Err-41 |
| 42 | B+ Overvoltage Cutback | Err-42 |
| 43 | 5V Supply Failure | Err-43 |
| 44 | Motor Temp Hot Cutback | Err-44 |
| 45 | Motor Temp Sensor Fault | Err-45 |
| 46 | Main Contactor Open/Short | Err-46 |
| 47 | Sin/Cos Sensor Fault | Err-47 |
| 48 | Motor Phase Open | Err-48 |
| 49 | Main Contactor Welded | Err-49 |
| 50 | Main Contactor Did not Close | Err-50 |
| 51 | Throttle wiper High | Err-51 |
| 52 | Throttle wiper Low | Err-52 |
| 53 | EEPROM Failure | Err-53 |
| 54 | VCL Run Time Error | Err-54 |
| 55 | Motor Characterization fault | Err-55 |
| 56 | Encoder Pulse Count Fault | Err-56 |
| 57 | Encoder LOS | Err-57 |
| 58 | Brake Wiper High | Err-58 |
| 59 | Brake Wiper Low | Err-59 |
| 60 | High Pedal Disable | Err-60 |


## Diagnostic Procedures
[STEP 1] Identify the Error Code on the LCD.
[STEP 2] Cross-reference below for definition and troubleshooting.

## Error-01: Battery Fault
- **Definition:** Battery common fault.
- **Occurrence Condition:** 
  1. It comes along with a another Error
- **Troubleshooting:**
  1.Check another Error
  2. If there is not any another Error. Update to supplier.

## Error-02: Battery Over Temperature
- **Definition:** Battery temperature is above normal safe range.
- **Occurrence Condition:**
  1. Due to high Discharging current rate.
  2. Due to Battery Internal loose connection.
  3. MCU Pushing High Regen Current.
  4. Battery Temperature sensor not working.
- **Troubleshooting:**
  1. Check Discharging current rate. If Found as per required that's ok.
  2. Replace the Battery Pack.
  3. Check and update to MCU Team.
  4. Update to supplier.

## Error-03: Battery Severe Over Temperature
- **Definition:** Battery temperature has crossed the critical safe limit, risk of damage or fire.
- **Occurrence Condition:** 
 "1. Due to high Discharging current rate. 
  2. Due to Battery Internal loose connection.
  3. MCU Pushing High Regen Current.
  4. Battery Temperature sensor not working."

- **Troubleshooting:** 
  Check Ambient Temp and Compare with Battery temperature.
   1. Check Discharging current rate. If Found as per required that's ok.
   2. Replace the Battery Pack.
   3. Check and update to MCU Team.
   4. Update to supplier."

## Error-04: Battery Under Temperature
- **Definition:** Battery is below the safe operating range.
- **Occurrence Condition:** 
  1. Battery temp sensor not Working.
  2. Ambient temp is too low to operate Battery.
- **Troubleshooting:** 
  Check Ambient Temp and Compare with Battery temperature.
  1. If there is more Temp Difference. Update to Supplier, may be Battery Temp Sensor not Working.
  2. If Both are same than hold some time to increase Battery temp.

## Error-05: Battery Severe Under Temperature
- **Definition:** Battery temperature has fallen well below the critical safe limit.
- **Occurrence Condition:** 
  1. Higher regen Current.
  2. Unauthorized Charger using.
- **Troubleshooting:** 
  Check Ambient Temp and Compare with Battery temperature.
  1. Check Regen Current Value.
  2. Use Authorized Charger.

## Error-06: Battery Severe Over Voltage
- **Definition:** Battery voltage has crossed the critical maximum limit.
- **Occurrence Condition:**
  1. Higher regen Current.
  2. Battery Over Charge.
  3. Charging Full Indication.
- **Troubleshooting:**
  1. Check Regen Current Value.
  2. After Charging Hold the Vehicle For Some Time. It will be normal after Some Time.

## Error-07: Battery Over Voltage
- **Definition:** Battery voltage is above normal safe range.
- **Occurrence Condition:** 
  1.Higher regen Current.
  2. Battery Over Charge.
  3. Charging Full Indication."
 Less Battery Remaining.
- **Troubleshooting:** 
  1. Check Regen Current Value.
  2. After Charging Hold the Vehicle For Some Time. It will be normal after Some Time."

## Error-08: Battery Under Voltage
- **Definition:** Battery voltage has dropped below safe range.
- **Occurrence Condition:** 
  1. Battery is in Idle Condition from a long time.
  2. Less Battery Remaining.
- **Troubleshooting:** 
  1. Charge the Battery Pack.

## Error-09: Battery Severe Under Voltage
- **Definition:** Battery voltage is far below the critical limit.
- **Occurrence Condition:** 
  1. Battery is in Idle Condition from a long time.
- **Troubleshooting:** 
  1.Try to Charge the Battery Pack. 
  If not Charging Update to supplier or Charge using slow Charger."

## Error-10: MOSFET Failure
- **Definition:** Power MOSFET (used in BMS/inverter) stops working due to short circuit, open circuit, or thermal damage.
- **Occurrence Condition:** 
  1. Current Spike during Drive.
- **Troubleshooting:** NA
  1. Turn off Vehicle and Update to Battery Supplier.

## Error-11: Pre-charge Failure
- **Definition:** Battery Internal Failure
- **Occurrence Condition:** 
  1. Internal Misshaping in Battery.
- **Troubleshooting:** 
  1. Remove all the connection. 
  2. Turn on Battery Separately. If still getting Error, Update to Supplier."

## Error-12: Severe Dock Pos Temperature
- **Definition:** Bus Bar High Temp (+ve)
- **Occurrence Condition:** NA
- **Troubleshooting:** NA

## Error-13: Severe Dock Neg Temperature
- **Definition:** Bus Bar High Temp (-ve)
- **Occurrence Condition:** NA
- **Troubleshooting:** NA

## Error-14: Over Dock Pos Temperature
- **Definition:** Bus Bar Cut off Over Temp +ve
- **Occurrence Condition:** NA  
- **Troubleshooting:** NA
  
## Error-15: Over Dock Neg Temperature
- **Definition:** Bus Bar Cut off Over Temp -ve
- **Occurrence Condition:** NA
- **Troubleshooting:** NA

## Error-16: Less Battery During Key On
- **Definition:** If SOC <20%, When Ignition ON
- **Occurrence Condition:** 
  1. Battery SOC Less than 20% 
- **Troubleshooting:** 
  1. Charge the Battery Pack. If Battery is not Charging use another charger. May be Can Communication not stablished between Battery and Charger.

## Error-17: Less Battery During Drive
- **Definition:** If SOC <20%, While Drive
- **Occurrence Condition:** 
  1. Less Battery Voltage. 
- **Troubleshooting:** 
  1. Charge the Battery Pack.

## Error-18: Permanent Dock Pos Temp
- **Definition:** Recurring temp fault
- **Occurrence Condition:** NA
- **Troubleshooting:** NA

## Error-19: Permanent Dock Neg Temp
- **Definition:** Recurring temp fault
- **Occurrence Condition:** NA
- **Troubleshooting:** NA

## Error-20: MCU Communication
- **Definition:** NO Communication with MCU - Consider Mode ID from Controller ID-1826FF81, at Starting Bit 56, Length 3, Intel,
- **Occurrence Condition:** 
  1. Battery not getting MCU Can.
  2. FW Related Issue."
- **Troubleshooting:**
  1. Check MCU Can is Coming in Common Can Line.
  2. Check at Battery Can Point. 
  If both Points have MCU Can but still Error comes than update to Supplier."

## Error-21: EV In Sense Malfunction
- **Definition:** Reverse current detected
- **Occurrence Condition:** NA
- **Troubleshooting:**NA

## Error-22: EV out Sense Malfunction
- **Definition:** Output voltage/current not sensed
- **Occurrence Condition:** Na
  - **Troubleshooting:** NA
  
## Error-27: Battery Thermal Runaway Alert
- **Definition:** As per the Battery Condition
- **Occurrence Condition:** 
  1-Battery is at his higher temp Range. 
  2- Temp Sensor Issue."
- **Troubleshooting:**
  1. Stop the Vehicle for Some time and Check Battery Voltage is going to down or not.
  2. If temp is still same, update to supplier."

## Error-28: Battery Thermal Runaway
- **Definition:** As per the Battery Condition
- **Occurrence Condition:** 
  1- Battery higher Internal Temp.
  2. Temp Sensor Not working."
- **Troubleshooting:**
  1. Turn off Vehicle and Check Battery Temp.
  If temp is Below 60 Degree and you still get the Error, Update to Supplier.
  2- Update to Supplier.

## Error-29: Peak Current Warning
- **Definition:** If current continuous demand more then the limit
- **Occurrence Condition:** 
  1. MCU Using Continuous high Current.
  2. Wheel Jammed.
- **Troubleshooting:**
  1. Check Continuous Drive Current Value. 
  2. Check Wheels are loose or not.
  Both Condition Matters Drive Current should be less than Battery Drive current limit also wheel should be Free."

## Error-31: Controller Overcurrent
- **Definition:** Motor current exceeded controller rated maximum
- **Occurrence Condition:** 
  1. Controller heatsink may be dirty / mudded.
  2. Regen current not accepted by the battery.
  3. Vehicle is overloaded or Wheel Jammed.
  4. UVW terminal  Loose Connection / External Short of UVW cable / burnt / continuity
  5. Motor parameters may be mistuned.
- **Troubleshooting:** 
  1. Allow controller to warm up to normal operating temperature.
  2. Check Motor U, V W cable connections
  2. Check for throttle release, then the Error comes-it is  battery Issue.
  3. Auto characterize the Motor
  4. Check for freeness of wheels ,If not rotating freely ,Make it free
  5. Check the motor shaft for its free rotation.-If Motor shaft is Jammed - Replace the Motor.
  6. If you check everything is clear but still getting the Error, Immerdiatly update to supplier.
  
## Error-32: Current Sensor Fault
- **Definition:** Current sensor auto-zero value outside of allowed range
- **Occurrence Condition:** 
  1. External Short for U, V and W Cable.
- **Troubleshooting:** 
  1. if the short found- Remove Short.
  2. No Short found - Replace the controller"

## Error-33: Pre charge Failed
- **Definition:** Capacitor voltage did not rise above 5V at power up
- **Occurrence Condition:** 
  1. When there is any additional Load connected in 48V Line
  2. Internal failure in controller"
- **Troubleshooting:** 
  1. Check battery connection for reverse polarity, or check internal / external short circuit across the DC link
  2. if no issue found - Replace the controller and check"

## Error-34: Controller Severe Under temperature
- **Definition:** Controller heatsink (or junctions, capacitors, PCB) has reached critical low temperature, and the controller has shut down.
- **Occurrence Condition:** 
- **Troubleshooting:** 
  1. Allow controller to warm up to normal operating temperature

## Error-35: Controller Severe Over temperature
- **Definition:** Controller heatsink (or junctions, capacitors, PCB) has reached critical high temperature, and the controller has shut down.
- **Occurrence Condition:**
  1. Controller heatsink may be dirty / mudded
  2. Controller heat sink is rigidly not mounted to controller.
  3. Vehicle is overloaded"
- **Troubleshooting:** 
  1. check for Heat Sink is covered with dirt/Mud- Clean Heat Sink.
  2. check for Heat sink is properly mounted
  3. Remove the Additional Load and allow the controller to cool down"

## Error-36: Severe B+ Undervoltage
- **Definition:** MCU Voltage is far below the critical limit.
- **Occurrence Condition:**
  1. Battery voltage has dropped below critical level
- **Troubleshooting:** 
  1. Charge battery or check DC link voltage is within controller operating range

## Error-37: Severe KSI Undervoltage
- **Definition:** MCU KSI Voltage is below normal safe range.
- **Occurrence Condition:** 
  1. Battery voltage is less than rated minimum voltage for controller for longer than 1sec
- **Troubleshooting:**
  1. Charge battery or check DC link voltage is within controller operating range


## Error-38: Severe B+ Overvoltage
- **Definition:** MCU KSI Voltage is far Upper the critical limit.
- **Occurrence Condition:** 
  1. Capacitor voltage is greater than rated maximum voltage for controller for longer than 1sec.
- **Troubleshooting:** 
  1. Charge battery or check DC link voltage is within controller operating range. 

## Error-39: Severe KSI Overvoltage
- **Definition:** MCU KSI Voltage is above normal safe range.
- **Occurrence Condition:** 
  1. Battery voltage is greater than the configured Over Voltage limit for longer than the protection delay
- **Troubleshooting:**
  1. Charge battery or check DC link voltage is within controller operating range

## Error-40: Controller Over temperature Cutback
- **Definition:** Controller heatsink (or junctions, capacitors, PCB) has reached critical high temperature, and the controller has shut down.
- **Occurrence Condition:** 
  1. Controller heatsink may be dirty / mudded
  2. Controller heat sink is rigidly not mounted to controller.
  3. Vehicle is overloaded.
- **Troubleshooting:**
  1. check for Heat Sink is covered with dirt/Mud- Clean Heat Sink.
  2. check for Heat sink is properly mounted
  3. Remove the Additional Load and allow the controller to cool down"

## Error-41: B+ Undervoltage Cutback
- **Definition:** NA
- **Occurrence Condition:**
  1. During running, vehicle reached to low SOC.
  2. During Running, Battery KSI is going to OFF.
- **Troubleshooting:**
  1. Check the Battery Pack voltages. Also check the Battery KSI Signal and Battery Voltage Signal in CAN.

## Error-42: B+ Overvoltage Cutback
- **Definition:** Battery voltage is greater than the configured Over Voltage limit for longer than the protection delay
- **Occurrence Condition:** 
  1. Normal operation. Fault shows that regen braking currents elevated the battery voltage during regen braking. Controller is performance limited at this voltage.
  2. Battery parameters are misadjusted. 
  3. Battery resistance too high for given regen current. 
  4. Battery disconnected while regen braking
- **Troubleshooting:**
  1. check for the voltage between 2 and 5 in encoder connector and shall be 12V
  2. check for the temperature resistance between pin 2 and 5 of the encoder connector of the motor side as per PT1000.
  Note:- This is declared only when the Controller is running in regen.
  3. Check all the given occurrence condition. if It's still continue update to supplier immedately.

## Error-43: 5V Supply Failure
- **Definition:** 5V Supply for Analog Signal Missing
- **Occurrence Condition:** 
  1. 1- Short in Throttle, POT or Encoder Connection.
- **Troubleshooting:**
  1. Check the voltage between Pin 1 & 5 of  Encoder Connector
  2. Check for short in Brake POT or Throttle connection"

## Error-44: Motor Temp Hot Cutback
- **Definition:** Motor in thermal cutback
- **Occurrence Condition:** 
  1. Encoder connector wire damaged or cut
  2. Motor temperature resistor failure
  3. Vehicle over loded.
- **Troubleshooting:**
  1. check the encoder connector wiring.
  2. Check the voltage between Pin 2 & 5 of  Encoder Connector
  3. check for additional load and allow the motor to cool down"

## Error-45: Motor Temp Sensor Fault
- **Definition:** Motor Temperature input not available
- **Occurrence Condition:**
  1. Encoder connector wire damaged or cut
  2. Motor temperature resistor failure"
- **Troubleshooting:**
  1. check for the voltage between 2 and 5 in encoder connector and shall be 12V
  2. check for the temperature resistance between pin 2 and 5 of the encoder connector of the motor side as per PT1000."

## Error-46: Main Contactor Open/Short
- **Definition:** Line contactor not closed
- **Occurrence Condition:** 
  1. contactor coil connection issue
  2. Contactor rust"
- **Troubleshooting:** 
  1. check for coil connections
  2. check for rust
  3. check the coil voltage"

## Error-47: Sin/Cos Sensor Fault
- **Definition:** Sin/Cos Values out of range with warning
- **Occurrence Condition:**
  1. Encoder wires damaged / Pin back out
  2. Wheels are Jammed"
 Line contactor open circuit - contactor did not close when the coil is energized
- **Troubleshooting:**
  1. Check for sin/cos sensor, wiring and encoder configuration
  2. Check for wheel freeness."

## Error-48: Motor Phase Open
- **Definition:** Motor controller unable to maintain control of motor currents
- **Occurrence Condition:** 
  1. Encoder angle misalignment
  2. UVW cable loose connections
  3. Encoder connector Pin back out"
- **Troubleshooting:** 
  1. Check for motor cable and encoder connector wiring.
  2. Motor characterization to be done."

## Error-49: Main Contactor Welded
- **Definition:** Line contactor appears to be closed when the coil is NOT energized
- **Occurrence Condition:** 
  1. 1. Contactor tips got physically short.
- **Troubleshooting:**
  1. Check line contactor hasn't welded / closed and the wiring is correct

## Error-50: Main Contactor Did not Close
- **Definition:** Line contactor open circuit - contactor did not close when the coil is energized
- **Occurrence Condition:** 
  1. When the contactor tip  is oxidized or burnt
  2. Battery connection issue"
- **Troubleshooting:** 
  1. Check line contactor operation and wiring
  2. Check for Battery Power connections"

## Error-51: Throttle wiper High
- **Definition:** Throttle signal voltage high as per define upper limit.
- **Occurrence Condition:** 
  1. Throttle Wires are disconnected / shorted.
- **Troubleshooting:**
  1. Check for wiring and configuration is correct or n ot. If analogue input is not used the range should be set to the minimum and maximum limits 
 
## Error-52: Throttle wiper Low
- **Definition:** Throttle signal voltage low as per define low limit.
- **Occurrence Condition:** 
  1. Throttle Wires are disconnected / shorted.
- **Troubleshooting:** 
  1. Check for wiring and configuration is correct or not. If analogue input is not used the range should be set to the minimum and maximum limits

## Error-53: EEPROM Failure
- **Definition:** Bad NVM Data.
- **Occurrence Condition:** 
  1. EEPROM or flash configuration data corrupted and data can not be recovered.
- **Troubleshooting:** 
  1. If firmware has recently been updated, revert to previous version. Contact Virya for support.

## Error-54: VCL Run Time Error
- **Definition:** VCL code encountered a runtime
- **Occurrence Condition:** 
  1. VCL code encountered a runtime
 - **Troubleshooting:** 
  1. Update to Supplier

## Error-55: Motor Characterization fault
- **Definition:** characterization failed during characterization process
- **Occurrence Condition:** 
  1. 1. Motor characterization failed during characterization process. 
- **Troubleshooting:** 
  1. Update to Supplier.

## Error-56: Encoder Pulse Count Fault
- **Definition:** NA
- **Occurrence Condition:** 
  1. Encoder Steps parameter does not match the actual motor encoder.
- **Troubleshooting:**
  1. Update to Supplier.

## Error-57: Encoder LOS
- **Definition:** Encoder supply is disconnected.
- **Occurrence Condition:** 
  1. Encoder input supply is disconnected or no supply from Controller due to wire cut
- **Troubleshooting:** 
  1. Check encoder wiring - especially shielding and routing of encoder cables.
  2. Encoder connector terminal PIN back out.

## Error-58: Brake POT Engage
- **Definition:** During drive, brake pot is applied.
- **Occurrence Condition:** 
  1. When the Throttle is in active and the brake Pot is pressed
- **Troubleshooting:** 
  1. Brake Pedal always to be in release condition during the throttle active

## Error-59: Brake POT fault
- **Definition:** Brake POT input voltage outside of configured range.
- **Occurrence Condition:** 
  1. Brake Wires are disconnected / shorted
- **Troubleshooting:** 
  1. Check for wiring and configuration is correct or not. If analogue input is not used the range should be set to the minimum and maximum limits

## Error-60: High Pedal Disable
- **Definition:** Any drive switch or throttle will be in active at vehicle Power ON.
- **Occurrence Condition:** 
  1. When the vehicle Power ON condition
  2. When the Main Battery will switched OFF / ON"
- **Troubleshooting:**
  1. Put the drive switch to N position.
  2. Release the Throttle before turning ON

`;

/**
 * MODULE 6: BATTERY & SYSTEM HARDWARE SPECIFICATIONS
 */
const hardwareSpecsContent = `
# OSM BATTERY & HARDWARE SPECIFICATIONS

## 1. Battery Make & Specifications
### Exicom Battery
- Make & Trade Name - Exicom Energy Systems Pvt. Ltd.
- Model No - 2040506
- Weight - 90 KG
- Cell Configuration in Pack - 16S 2P
- Module Configuration in Pack - NA
- Capacity: 10.75 KWH / 210 Ah
- Operating Range: 46 V to 58.4 V
- KSI Voltage: 52V
- Nominal Voltage: 51.2V
- BMS Make - Exicom




### Exponent Battery
- Make & Trade Name - Exponent Energy E- Pack
- Model No - E-Pack 5188 - TG1
- Weight - 104 KG
- Cell Configuration in Pack - Module to Pack
- Module Configuration in Pack - 8s Module, 2 Module in Series, 2 Modules in parallel
- Capacity: 8.8 KWH / 172ah
- Operating Range: 47.2V - 58V
- KSI Voltage: 5V (Drops to 2.5V-3V when KSI connected)
- Nominal Voltage: 51.2V
- BMS Make - Exponent Energy



### Clean Battery
- Make & Trade Name - RTCXFC Industries Pvt Ltd 
- Model No - FLO 150 
- Weight - 120 KG
- Cell Configuration in Pack - 15S 1P 
- Module Configuration in Pack - NA
- Capacity: 15.1 KWH / 314Ah
- Operating Range: 43.5V to 54.75V
- Nominal Voltage:  48V 
- BMS Make - RTCXFC Industries Pvt Ltd 


## 2. CAN Bus Termination Logic
- **120 Ohm Termination:** Available in Cluster and MCU.
- **60 Ohm Termination:** Expected reading when all components (Parallel) are connected.
- **Note:** If charging the 48V pack disconnected from the vehicle, add a 120 Ohm resistance to the Battery CAN line.

## 3. Cluster Comparison
- **Sloki Cluster:** Features additional sensing for 12V input and an in-built delay option (1s and 3s grounds) for controlled startup.
- **Virya Cluster:** Basic functionality and tell-tale indicators. Suitable for standard monitoring without delay requirements.
`;

/**
 * MODULE 7: PCAN TOOL STARTING PROCESS
 */
const pcanToolContent = `
# PCAN TOOL OPERATIONAL GUIDE

[STEP 1] Connect USB-to-CAN hardware to PC and vehicle (CAN_H/CAN_L).
[STEP 2] Launch PCAN View software.
[STEP 3] Set Baud Rate to 500 kbit/s (Standard for OSM).
[STEP 4] Start Monitoring. Check columns: CAN-ID, Length, Data, Cycle Time.
[STEP 5] To Log: Go to "Trace" -> "Start Message Trace" (Red Record Button).
[STEP 6] Stop Log: "Trace" -> "Stop Trace".
[STEP 7] Save as .trc file for technical analysis.
`;

export const ALL_DEFAULT_LIBRARIES: StoredFile[] = [
  { name: 'Module-Matel-12V.md', content: matelContent, size: 0, lastModified: Date.now() },
  { name: 'Module-Virya-Gen1-Old.md', content: viryaGen1OldContent, size: 0, lastModified: Date.now() },
  { name: 'Module-Virya-Gen1-AIS156.md', content: viryaGen1NewContent, size: 0, lastModified: Date.now() },
  { name: 'Module-Virya-Gen2.md', content: viryaGen2Content, size: 0, lastModified: Date.now() },
  { name: 'Module-Master-Error-Diagnostics.md', content: masterErrorContent, size: 0, lastModified: Date.now() },
  { name: 'Module-Hardware-Battery-Specs.md', content: hardwareSpecsContent, size: 0, lastModified: Date.now() },
  { name: 'Module-PCAN-Tool-Guide.md', content: pcanToolContent, size: 0, lastModified: Date.now() }
];
