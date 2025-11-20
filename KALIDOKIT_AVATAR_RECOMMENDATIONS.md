# 🎭 KalidoKit Avatar Recommendations

## ⚠️ Important Finding

Based on the [KalidoKit GitHub repository](http://github.com/yeemachine/kalidokit), **KalidoKit's official examples use VRM models**, not Ready Player Me. This is why you're experiencing rotation issues!

## 🎯 Recommended Avatar Sources (KalidoKit Compatible)

### 1. **VRM Models** ⭐ BEST CHOICE - Officially Supported by KalidoKit

**Why VRM?**
- KalidoKit's official examples use VRM models
- VRM is specifically designed for VTuber/avatar applications
- Bone naming and coordinate systems are optimized for KalidoKit
- No rotation issues - works out of the box!

**Where to Get VRM Models:**

1. **VRoid Hub** (Free, Official)
   - Website: https://hub.vroid.com/
   - **Best for**: Anime-style avatars
   - Free VRM models created by the community
   - Direct download as VRM format
   - **Note**: VRM files need to be converted to GLB for Three.js

2. **VRoid Studio** (Create Your Own)
   - Website: https://vroid.com/studio
   - Create custom VRM avatars
   - Free software
   - Export as VRM, then convert to GLB

3. **Booth.pm** (Paid/Free)
   - Website: https://booth.pm/
   - Search: "VRM"
   - Mix of free and paid VRM models
   - High quality options

**Converting VRM to GLB:**
- Use **Blender** with VRM addon
- Or use online converters (search "VRM to GLB converter")

### 2. **Mixamo Models** (Second Best)

**Why Mixamo?**
- Uses standard bone naming (`mixamorig:Head`, etc.)
- KalidoKit supports Mixamo naming
- Professional quality
- Free with Adobe account

**Where to Get:**
- Website: https://www.mixamo.com/
- Download as FBX
- Convert FBX → GLB using Blender

### 3. **Ready Player Me** (Current - Has Issues)

**Why It's Problematic:**
- Uses Mixamo-compatible naming (should work)
- BUT: Bone orientations/coordinate systems may differ
- Requires complex axis inversions (causing your leg issues)
- Not officially tested by KalidoKit

**If You Want to Continue with Ready Player Me:**
- The bone names ARE correct (Mixamo-compatible)
- The issue is in rotation application, not bone mapping
- We need to fix the rotation transformations (work in progress)

## 📋 Bone Naming Comparison

### KalidoKit Expects (from VRM/Mixamo):
```
Hips, Spine, Neck, Head
LeftShoulder, LeftArm, LeftForeArm, LeftHand
RightShoulder, RightArm, RightForeArm, RightHand
LeftUpLeg, LeftLeg, LeftFoot
RightUpLeg, RightLeg, RightFoot
```

### Ready Player Me Uses (Mixamo-compatible):
```
Hips, Spine, Neck, Head
LeftShoulder, LeftArm, LeftForeArm, LeftHand
RightShoulder, RightArm, RightForeArm, RightHand
LeftUpLeg, LeftLeg, LeftFoot
RightUpLeg, RightLeg, RightFoot
```

**✅ The bone names ARE correct!** The issue is in how rotations are applied.

## 🔧 Current Status

### What's Working:
- ✅ Bone detection (18 bones mapped correctly)
- ✅ KalidoKit is calculating rotations correctly
- ✅ Model loads successfully

### What's Not Working:
- ❌ Leg rotations are inverted/upside down
- ❌ Need axis corrections for Ready Player Me

### Why VRM Would Be Better:
- ✅ No axis corrections needed
- ✅ Works out of the box with KalidoKit
- ✅ Tested and verified by KalidoKit developers
- ✅ Coordinate systems match perfectly

## 🎯 Recommendation

**For best results with KalidoKit, use VRM models!**

1. **Get a VRM model from VRoid Hub**
2. **Convert VRM → GLB** (using Blender or online converter)
3. **Upload as Custom GLB/GLTF Model**
4. **It should work without rotation issues!**

## 🔄 Alternative: Fix Ready Player Me

If you want to stick with Ready Player Me:
- We need to continue debugging the rotation transformations
- The bone names are correct, but rotations need axis corrections
- This is more complex and may require trial-and-error

## 📚 Resources

- **KalidoKit GitHub**: http://github.com/yeemachine/kalidokit
- **VRM Specification**: https://vrm.dev/
- **VRoid Hub**: https://hub.vroid.com/
- **Mixamo**: https://www.mixamo.com/

---

**Bottom Line**: For the smoothest experience with KalidoKit, use VRM models. They're what KalidoKit was designed for!

