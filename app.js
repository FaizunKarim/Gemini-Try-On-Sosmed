// Single Image State
// Format: null | { type: 'base64' | 'url', value: string, name?: string }
let uploadedImage = null;

// Initialize Upload Area
window.onload = function() {
  renderUploadGrid();
};

function onGenderChange(el) {
  if (window.showToast) {
    showToast(`Model diubah ke: ${el.value}`, 'info', 'Pengaturan Model');
  }
}

function onStyleChange(el) {
  if (window.showToast) {
    const text = el.options[el.selectedIndex].text;
    showToast(`Latar studio diubah ke: ${text}`, 'info', 'Setting Latar');
  }
}

function renderUploadGrid() {
  const container = document.getElementById('uploadGrid');
  const countText = document.getElementById('uploadedCountText');
  if (!container) return;

  container.innerHTML = '';
  const hasImg = uploadedImage !== null;

  if (hasImg) {
    countText.className = "text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200 flex items-center gap-1";
    countText.innerHTML = `<i class="fa-solid fa-circle-check text-[10px]"></i> 1 / 1 Terisi`;
  } else {
    countText.className = "text-xs text-teal-700 bg-teal-50 px-3 py-1 rounded-full font-bold border border-teal-100 flex items-center gap-1";
    countText.innerHTML = `<i class="fa-regular fa-circle text-[10px]"></i> Belum Ada Gambar`;
  }

  const slotHTML = `
    <div class="relative border-2 border-dashed ${hasImg ? 'border-teal-500 bg-teal-50/20' : 'border-slate-300 hover:border-teal-400 bg-slate-50 hover:bg-slate-100/80'} rounded-3xl p-4 flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px] cursor-pointer transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-md">
      <input type="file" id="fileInput" accept="image/*" class="hidden" onchange="handleFileSelect(event)">
      
      ${hasImg ? `
        <div class="relative w-full h-full max-h-[240px] flex items-center justify-center overflow-hidden rounded-2xl">
          <img src="${uploadedImage.value}" class="w-full h-48 sm:h-56 object-contain rounded-2xl shadow-sm">
          <div class="absolute top-2 right-2 flex gap-2">
            <button onclick="showUrlInput(event)" class="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-teal-500 text-slate-700 hover:text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors" title="Ganti dengan URL">
              <i class="fa-solid fa-link"></i>
            </button>
            <button onclick="triggerFileInput()" class="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-teal-500 text-slate-700 hover:text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors" title="Ganti dengan File">
              <i class="fa-solid fa-arrow-rotate-right"></i>
            </button>
            <button onclick="removeImage(event)" class="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-red-500 text-slate-700 hover:text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors" title="Hapus">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      ` : `
        <div class="flex flex-col items-center text-slate-400 group-hover:text-teal-600 transition-colors w-full text-center py-4" onclick="showSlotOptions(event)">
          <div class="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 border border-slate-200 group-hover:border-teal-300 group-hover:scale-105 transition-all">
            <i class="fa-solid fa-cloud-arrow-up text-2xl text-teal-600"></i>
          </div>
          <span class="text-sm font-bold text-slate-700 group-hover:text-teal-700 mb-1">Unggah Gambar Produk</span>
          <span class="text-xs text-slate-400 max-w-xs">Klik di sini untuk memilih file dari perangkat atau link URL</span>
        </div>
      `}
    </div>
    
    <!-- Options Menu Modal -->
    <div id="slotOptionsModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
            <i class="fa-solid fa-image text-teal-600"></i>
            Pilih Sumber Gambar
          </h3>
          <button onclick="closeSlotOptions()" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        <button onclick="triggerFileInput(); closeSlotOptions();" class="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-teal-50 border-2 border-slate-200 hover:border-teal-300 rounded-2xl transition-all group cursor-pointer">
          <div class="w-12 h-12 rounded-2xl bg-teal-100 group-hover:bg-teal-200 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-upload text-teal-600 text-lg"></i>
          </div>
          <div class="text-left flex-1">
            <div class="font-bold text-slate-900 text-sm">Upload dari File</div>
            <div class="text-xs text-slate-500">Pilih gambar dari perangkat Anda</div>
          </div>
          <i class="fa-solid fa-chevron-right text-slate-400 group-hover:text-teal-600"></i>
        </button>
        
        <button onclick="showUrlInputFromOptions(event)" class="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-300 rounded-2xl transition-all group cursor-pointer">
          <div class="w-12 h-12 rounded-2xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-link text-indigo-600 text-lg"></i>
          </div>
          <div class="text-left flex-1">
            <div class="font-bold text-slate-900 text-sm">Dari URL Gambar</div>
            <div class="text-xs text-slate-500">Masukkan link gambar produk</div>
          </div>
          <i class="fa-solid fa-chevron-right text-slate-400 group-hover:text-indigo-600"></i>
        </button>
      </div>
    </div>
    
    <!-- URL Input Modal -->
    <div id="urlInputModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
            <i class="fa-solid fa-link text-teal-600"></i>
            Masukkan URL Gambar
          </h3>
          <button onclick="closeUrlInput()" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <p class="text-xs text-slate-500">Masukkan link URL publik gambar produk (contoh: https://example.com/produk.jpg)</p>
        <input type="url" id="urlInput" placeholder="https://example.com/produk.jpg" class="w-full bg-white border-2 border-slate-200 p-3.5 rounded-xl text-sm font-mono focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all">
        <div class="flex gap-2 pt-2">
          <button onclick="closeUrlInput()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer">
            Batal
          </button>
          <button onclick="loadImageFromUrl()" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-3 rounded-xl text-sm transition-colors shadow-md shadow-teal-200 cursor-pointer">
            <i class="fa-solid fa-check mr-1"></i> Muat Gambar
          </button>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = slotHTML;
}

function triggerFileInput() {
  const fileInput = document.getElementById('fileInput');
  if (fileInput) fileInput.click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      if (window.showAlertModal) {
        showAlertModal({
          title: 'Ukuran File Terlalu Besar',
          message: 'Ukuran file gambar tidak boleh melebihi 5MB. Silakan kompres atau pilih gambar berukuran lebih kecil.',
          type: 'warning',
          confirmText: 'Paham'
        });
      }
      showToast("Ukuran file maksimal 5MB!", "warning", "File Terlalu Besar");
      return;
    }

    showUploadLoading(true);

    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImage = { type: 'base64', value: e.target.result, name: file.name };
      renderUploadGrid();
      showToast(`Gambar "${file.name}" berhasil diunggah!`, "success", "Unggah Berhasil");
    };
    reader.onerror = function() {
      showUploadLoading(false);
      showToast("Gagal membaca file gambar. Silakan coba lagi.", "error", "Gagal Upload");
    };
    reader.readAsDataURL(file);
  }
}

function showUploadLoading(show) {
  const container = document.getElementById('uploadGrid');
  if (!container) return;
  
  if (show) {
    container.innerHTML = `
      <div class="border-2 border-dashed border-teal-500 bg-teal-50/20 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[220px]">
        <div class="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span class="text-sm text-teal-600 font-bold">Mengunggah Gambar...</span>
      </div>
    `;
  }
}

function removeImage(event) {
  if (event) event.stopPropagation();

  if (window.showAlertModal) {
    showAlertModal({
      title: 'Hapus Gambar Produk?',
      message: 'Apakah Anda yakin ingin menghapus gambar produk yang sudah diunggah?',
      type: 'warning',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onConfirm: () => {
        uploadedImage = null;
        renderUploadGrid();
        showToast("Gambar produk berhasil dihapus.", "info", "Gambar Dihapus");
      }
    });
  } else {
    uploadedImage = null;
    renderUploadGrid();
    showToast("Gambar produk berhasil dihapus.", "info", "Gambar Dihapus");
  }
}

function showSlotOptions(event) {
  if (event) event.stopPropagation();
  const modal = document.getElementById('slotOptionsModal');
  if (modal) modal.classList.remove('hidden');
}

function closeSlotOptions() {
  const modal = document.getElementById('slotOptionsModal');
  if (modal) modal.classList.add('hidden');
}

function showUrlInput(event) {
  if (event) event.stopPropagation();
  closeSlotOptions();
  const modal = document.getElementById('urlInputModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('urlInput').focus();
  }
}

function showUrlInputFromOptions(event) {
  if (event) event.stopPropagation();
  closeSlotOptions();
  const modal = document.getElementById('urlInputModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('urlInput').focus();
  }
}

function closeUrlInput() {
  const modal = document.getElementById('urlInputModal');
  if (modal) {
    modal.classList.add('hidden');
    document.getElementById('urlInput').value = '';
  }
}

async function loadImageFromUrl() {
  const urlInput = document.getElementById('urlInput');
  const imageUrl = urlInput.value.trim();
  
  if (!imageUrl) {
    showToast("Masukkan URL gambar yang valid!", "warning", "URL Kosong");
    return;
  }
  
  try {
    new URL(imageUrl);
  } catch (e) {
    showToast("Format URL tidak valid! Contoh: https://example.com/gambar.jpg", "error", "URL Invalid");
    return;
  }
  
  uploadedImage = { type: 'url', value: imageUrl };
  renderUploadGrid();
  closeUrlInput();
  showToast("Gambar produk berhasil dimuat dari URL!", "success", "URL Dimuat");
}

async function generateAllMockups() {
  console.log('Generate button clicked');
  
  if (!uploadedImage) {
    if (window.showAlertModal) {
      showAlertModal({
        title: 'Belum Ada Gambar Produk',
        message: 'Silakan unggah 1 foto produk terlebih dahulu sebelum men-generate mockup AI.',
        type: 'warning',
        confirmText: 'Unggah Gambar Sekarang',
        onConfirm: () => triggerFileInput()
      });
    }
    showToast("Unggah 1 gambar produk terlebih dahulu!", "warning", "Perhatian");
    return;
  }

  const gender = document.querySelector('input[name="gender"]:checked').value;
  const studioStyle = document.getElementById('studioStyle').value;
  console.log('Gender:', gender, 'Style:', studioStyle);

  showToast("Memulai Generate Gambar", "info", "Memproses AI");
  setLoadingState(true);

  let tryOnImg = null;
  let captionText = null;

  //  STEP 1: Image Generation (Cloudflare Flux 2 Klein 4B)
  try {
    showToast("Step 1/3: Membuat gambar fashion AI (Flux)...", "info", "Generating Image");
    tryOnImg = await generateImageAi(uploadedImage, gender, studioStyle);

    if (tryOnImg) {
      document.getElementById('tryOnPlaceholder').classList.add('hidden');
      const imgEl = document.getElementById('imgTryOn');
      imgEl.src = tryOnImg;
      imgEl.classList.remove('hidden');
      const downloadBtn = document.getElementById('btnDownloadTryOn');
      if (downloadBtn) downloadBtn.href = tryOnImg;
      document.getElementById('overlayTryOn').classList.remove('hidden');
      showToast("Gambar berhasil dibuat!", "success", "Step 1 ");
    } else {
      throw new Error('Flux returned empty image');
    }
  } catch (imgErr) {
    console.error('Image Gen Failed:', imgErr);
    const imgErrMsg = extractErrorMessage(imgErr);
    const placeholder = document.getElementById('tryOnPlaceholder');
    placeholder.innerHTML = `
      <div class="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-3 text-rose-500">
        <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
      </div>
      <span class="text-xs font-semibold text-rose-500">Gagal membuat gambar AI (Flux).</span>
      <span class="text-[10px] text-slate-400 mt-1">${imgErrMsg}</span>
    `;
    placeholder.classList.remove('hidden');
    showToast(`Cloudflare Flux gagal: ${imgErrMsg}`, "error", "❌ Flux Image Gen", 5000);
  }

  //  STEP 2: Image Analysis (Cloudflare Llama 3.2 Vision)
  // Analisis gambar INPUT dari user (bukan generated image) agar lebih akurat
  let productJson = null;
  const imageForAnalysis = uploadedImage
    ? (uploadedImage.type === 'base64' ? uploadedImage.value : uploadedImage.value)
    : null;

  if (imageForAnalysis) {
    try {
      showToast("Step 2/3: Menganalisis produk (Llama Vision)...", "info", "Analyzing");
      productJson = await analyzeImageWithVision(imageForAnalysis, gender, studioStyle);
      productJson = enrichProductJson(productJson);
      console.log('Vision Analysis Result:', productJson);
      showToast("Analisis visual selesai!", "info", "Step 2 ✓");
    } catch (visionErr) {
      console.error('Vision Analysis Failed:', visionErr);
      const visionErrMsg = extractErrorMessage(visionErr);
      showToast(`Llama Vision gagal: ${visionErrMsg}. Caption tetap diproses...`, "warning", " Llama Vision", 5000);
    }
  }

  // STEP 3: Caption Generation (Groq)
  try {
    showToast("Step 3/3: Menyusun caption Instagram (Groq)...", "info", "Generating Caption");
    captionText = await generateCaptionAi(productJson, gender, studioStyle);

    if (captionText) {
      const capContainer = document.getElementById('captionContainer');
      const capText = document.getElementById('captionText');
      const capBtn = document.getElementById('btnCopyCaption');
      const badge = document.getElementById('captionStatusBadge');
      const instruction = document.getElementById('captionInstruction');

      capContainer.classList.remove('opacity-70');
      capText.disabled = false;
      capText.value = captionText;
      capText.className = "w-full bg-white p-4 rounded-xl border border-teal-100/80 shadow-inner text-xs sm:text-sm text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed resize-y";
      capBtn.disabled = false;
      capBtn.className = "text-xs font-bold text-teal-600 bg-white hover:bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer";
      badge.className = "text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1";
      badge.innerHTML = `<i class="fa-solid fa-lock-open text-[9px]"></i> Siap Diedit`;
      instruction.innerText = "Silakan edit teks di bawah ini jika ingin menyesuaikan harga, promo, atau pesan khusus:";
    } else {
      throw new Error('Groq returned empty caption');
    }
  } catch (capErr) {
    console.error('Caption Gen Failed:', capErr);
    const capErrMsg = extractErrorMessage(capErr);
    const capText = document.getElementById('captionText');
    if (capText) capText.value = `Gagal membuat caption AI.\n\nDetail: ${capErrMsg}`;
    showToast(`Groq gagal: ${capErrMsg}`, "error", " Groq Caption", 6000);
  }

  //  FINAL: Feedback 
  const bothDone = tryOnImg && captionText;
  const partialDone = tryOnImg || captionText;

  if (bothDone) {
    if (window.showAlertModal) {
      showAlertModal({
        title: 'Pipeline Selesai! ',
        message: 'Gambar fashion AI dan caption Instagram promosi telah berhasil dibuat.',
        type: 'success',
        confirmText: 'Lihat Hasil'
      });
    }
    showToast("Gambar & Caption berhasil dibuat!", "success", "Selesai ");
  } else if (partialDone) {
    showToast(tryOnImg ? "Gambar OK, caption gagal." : "Caption OK, gambar gagal.", "warning", "Parsial Selesai");
  } else {
    showToast("Semua proses AI gagal. Coba lagi.", "error", "Pipeline Gagal");
  }

  setLoadingState(false);
}

//  STEP 1: Cloudflare Flux 2 Klein 4B  Image Generation 
async function generateImageAi(image, gender, style) {
  const apiUrl = `/api/proxy?action=cloudflare-image`;

  const promptText = `You are a professional luxury fashion photographer and commercial product stylist.

The uploaded image is the ONLY product reference.

Your task is to generate a photorealistic commercial fashion image featuring an AI-generated human model naturally wearing, holding, or using the exact product from the reference image.

The product is the hero of the image.

========================================
PRODUCT PRESERVATION (HIGHEST PRIORITY)
========================================

Preserve the uploaded product as accurately as possible.

Do NOT change:
- Product type
- Shape
- Size
- Colors
- Logo
- Branding
- Graphics
- Print
- Pattern
- Fabric
- Stitching
- Materials
- Accessories attached to the product
- Surface texture
- Design details

Never redesign or replace the product.

The product must remain visually identical to the reference image.

========================================
COMPOSITION RULES
========================================

Automatically choose the camera framing based on the product category.

If the product is:

 T-Shirt
 Hoodie
 Jacket
 Sweater
 Polo
 Jersey
 Blazer
 Shirt
 Coat

 Generate an upper-body or half-body fashion portrait.

The clothing must be fully visible and become the primary focus.

The model's face may be visible but should never dominate the composition.

----------------------------------------

If the product is:

 Pants
 Jeans
 Shorts
 Skirt
 Leggings

 Generate a lower-body fashion shot.

Focus on the waist, hips, and legs.

The pants must be completely visible.

----------------------------------------

If the product is:

 Shoes
 Sneakers
 Sandals
 Boots
 High Heels

 Generate a close-up lifestyle shot focusing on the feet.

The footwear must occupy most of the frame.

Natural standing or walking poses.

----------------------------------------

If the product is:

 Hat
 Cap
 Beanie
 Helmet

 Generate a portrait focusing on the head and upper body.

The headwear must be the primary subject.

----------------------------------------

If the product is:

 Sunglasses
 Glasses

 Generate a portrait emphasizing the face and eyewear.

The glasses must remain clearly visible.

----------------------------------------

If the product is:

 Earrings
 Necklace
 Bracelet
 Watch
 Ring

 Generate a close-up lifestyle portrait emphasizing the accessory.

Keep the accessory as the visual focus.

----------------------------------------

If the product is:

 Backpack

 Generate a lifestyle shot showing the model naturally wearing the backpack.

Prefer rear three-quarter angle or side angle so the backpack is clearly visible.

----------------------------------------

If the product is:

 Handbag
 Shoulder Bag
 Tote Bag

 Generate a fashion pose naturally holding or wearing the bag.

Focus on the arm, shoulder, and bag.

----------------------------------------

If the product is:

 Sling Bag
 Waist Bag
 Belt Bag

 Generate a waist-up or full-body shot emphasizing the bag placement.

----------------------------------------

If the product category cannot be determined,

choose the camera composition that best highlights the uploaded product while keeping it as the primary focus.

========================================
MODEL
========================================

Generate a realistic human model.

Natural body proportions.

Natural pose.

Relaxed expression.

Professional fashion posture.

Modern commercial fashion photography.

Model gender: ${gender}.

========================================
PHOTOGRAPHY
========================================

Luxury fashion campaign.

Professional studio lighting.

Soft shadows.

Premium e-commerce quality.

Photorealistic.

High detail.

Natural skin texture.

Natural fabric folds.

Sharp focus.

Clean composition.

Luxury aesthetic.

Magazine-quality fashion photography.

Background setting: ${style}.

========================================
IMPORTANT
========================================

The generated person is only a model.

The uploaded product is the main subject.

Never crop important parts of the product.

Always ensure the entire product remains clearly visible.

The viewer should immediately recognize the uploaded product as the focus of the image.

Output a single ultra-realistic commercial fashion image.`;

  const payload = { prompt: promptText };

  if (image.type === 'base64') {
    const val = image.value;
    payload.image_b64 = val.includes(',') ? val.split(',')[1] : val;
  } else if (image.type === 'url') {
    payload.image_url = image.value;
  }

  return await fetchWithRetry(apiUrl, payload, (result) => {
    if (result && result.resultImage) return result.resultImage;
    if (result && result.result && result.result.image) return `data:image/png;base64,${result.result.image}`;
    return null;
  });
}

//  Enrichment Layer: JavaScript yang pintar menambah context dari data deterministik
function enrichProductJson(json) {
  if (!json || typeof json !== 'object') return json;

  const raw = (json.type || '').toLowerCase().trim();
  if (!raw) return json;

  // Normalisasi type ke nama standar
  const typeMap = {
    't-shirt': 'T-Shirt', 'tshirt': 'T-Shirt', 'kaos': 'T-Shirt',
    'hoodie': 'Hoodie',
    'jacket': 'Jacket', 'jaket': 'Jacket',
    'sweater': 'Sweater',
    'polo': 'Polo Shirt',
    'jersey': 'Jersey',
    'blazer': 'Blazer',
    'shirt': 'Shirt', 'kemeja': 'Shirt',
    'coat': 'Coat',
    'pants': 'Pants', 'celana panjang': 'Pants', 'trousers': 'Pants',
    'jeans': 'Jeans',
    'shorts': 'Shorts', 'celana pendek': 'Shorts',
    'skirt': 'Skirt', 'rok': 'Skirt',
    'leggings': 'Leggings',
    'dress': 'Dress', 'gaun': 'Dress',
    'jumpsuit': 'Jumpsuit',
    'shoes': 'Shoes', 'sepatu': 'Shoes',
    'sneakers': 'Sneakers',
    'sandals': 'Sandals', 'sandal': 'Sandals',
    'boots': 'Boots',
    'heels': 'Heels', 'high heels': 'Heels',
    'hat': 'Hat', 'topi': 'Hat',
    'cap': 'Cap',
    'beanie': 'Beanie',
    'sunglasses': 'Sunglasses', 'kacamata hitam': 'Sunglasses',
    'glasses': 'Glasses', 'kacamata': 'Glasses',
    'earrings': 'Earrings', 'anting': 'Earrings',
    'necklace': 'Necklace', 'kalung': 'Necklace',
    'bracelet': 'Bracelet', 'gelang': 'Bracelet',
    'watch': 'Watch', 'jam tangan': 'Watch',
    'ring': 'Ring', 'cincin': 'Ring',
    'backpack': 'Backpack', 'ransel': 'Backpack',
    'handbag': 'Handbag', 'tas tangan': 'Handbag',
    'tote bag': 'Tote Bag', 'totebag': 'Tote Bag',
    'sling bag': 'Sling Bag', 'tas selempang': 'Sling Bag',
    'waist bag': 'Waist Bag', 'belt bag': 'Waist Bag', 'tas pinggang': 'Waist Bag',
    'bag': 'Bag', 'tas': 'Bag',
  };

  // Cari match terpanjang dulu (untuk "sling bag" sebelum "bag")
  let normalizedType = json.type;
  let matched = '';
  for (const [key, val] of Object.entries(typeMap)) {
    if (raw.includes(key) && key.length > matched.length) {
      normalizedType = val;
      matched = key;
    }
  }
  json.type = normalizedType;

  // Mapping body_area per kategori  JavaScript yang menentukan, bukan AI
  const bodyAreaMap = {
    'T-Shirt': 'upper body', 'Hoodie': 'upper body', 'Jacket': 'upper body',
    'Sweater': 'upper body', 'Polo Shirt': 'upper body', 'Jersey': 'upper body',
    'Blazer': 'upper body', 'Shirt': 'upper body', 'Coat': 'upper body',
    'Pants': 'lower body', 'Jeans': 'lower body', 'Shorts': 'lower body',
    'Skirt': 'lower body', 'Leggings': 'lower body',
    'Dress': 'full body', 'Jumpsuit': 'full body',
    'Shoes': 'feet', 'Sneakers': 'feet', 'Sandals': 'feet',
    'Boots': 'feet', 'Heels': 'feet',
    'Hat': 'head', 'Cap': 'head', 'Beanie': 'head',
    'Sunglasses': 'face', 'Glasses': 'face',
    'Earrings': 'ears', 'Necklace': 'neck', 'Bracelet': 'wrist',
    'Watch': 'wrist', 'Ring': 'finger',
    'Backpack': 'back', 'Handbag': 'hand', 'Tote Bag': 'hand',
    'Sling Bag': 'shoulder', 'Waist Bag': 'waist', 'Bag': 'hand',
  };

  json.body_area = bodyAreaMap[json.type] || 'body';

  console.log('Enriched JSON:', json);
  return json;
}

//  STEP 2: Cloudflare Llama 3.2 11B Vision  Product Recognition 
// ── Helper: ekstrak JSON object pertama yang valid dari teks respons ──────────
function extractFirstValidJson(text) {
  if (!text) return null;
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          return JSON.parse(text.substring(start, i + 1));
        } catch (_) {
          start = -1; // JSON tidak valid, cari pembuka berikutnya
        }
      }
    }
  }
  return null;
}

// ── STEP 2: Cloudflare Llama 3.2 11B Vision — Two-call pipeline ──────────────
// Call 2a: Classifier — satu kata product type
// Call 2b: Extractor — atribut spesifik berdasarkan type yang sudah diketahui
async function analyzeImageWithVision(imageDataUrl, gender, style) {

  // Siapkan payload gambar (dipakai di kedua call)
  const imagePayload = {};
  if (imageDataUrl.startsWith('data:')) {
    imagePayload.image_b64 = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;
  } else {
    imagePayload.image_url = imageDataUrl;
  }

  // ── Call 2a: Classifier — identifikasi product type saja ─────────────────
  let productType = 'Other';
  try {
    const classifyResult = await fetchWithRetry(
      `/api/proxy?action=cloudflare-vision-classify`,
      imagePayload,
      (r) => {
        console.log("SERVER RESPONSE:", r);
        
        const allowed = [
          "T-Shirt","Hoodie","Jacket","Sweater","Polo","Blazer","Shirt",
          "Coat","Pants","Jeans","Shorts","Skirt","Leggings","Dress",
          "Jumpsuit","Shoes","Sneakers","Sandals","Boots","Heels",
          "Hat","Cap","Beanie","Sunglasses","Glasses","Earrings",
          "Necklace","Bracelet","Watch","Ring","Backpack",
          "Handbag","Tote Bag","Sling Bag","Waist Bag","Bag","Other"
        ];

        const raw = (r?.product_type || "").trim();

        console.log("RAW PRODUCT TYPE:", raw);

        const found = allowed.find(item =>
          raw.toLowerCase().includes(item.toLowerCase())
        );

        console.log("MATCHED PRODUCT TYPE:", found);

        return found || "Other";
      }
    );
    if (classifyResult) productType = classifyResult;
    console.log("Classifier Result:", productType);
  } catch (err) {
    console.warn('Classifier failed, using fallback "Other":', err.message);
  }

  // ── Call 2b: Extractor — atribut berdasarkan type yang sudah diketahui ───
  const extractPrompt = `You are a product recognition model.

The product in this image is: ${productType}

Analyze ONLY this ${productType} in the image.

There is exactly ONE product. Return EXACTLY ONE JSON object.
Do NOT return multiple JSON objects.
Do NOT return examples.
Do NOT return a list.
Do NOT describe the person or background.
If an attribute is not clearly visible, return null.

Return ONLY this single JSON object. No markdown. No explanation. No extra text.

{
  "type": "${productType}",
  "category": "",
  "primary_color": "",
  "secondary_colors": [],
  "material": "",
  "style": "",
  "key_features": [],
  "confidence": 0.0
}`;

  const extractPayload = { prompt: extractPrompt, ...imagePayload };

  const result = await fetchWithRetry(
    `/api/proxy?action=cloudflare-vision`,
    extractPayload,
    (r) => {
      const text = r?.analysis || '';
      if (!text) return null;
      const parsed = extractFirstValidJson(text);
      if (parsed) return parsed;
      return null;
    }
  );

  return result;
}

//  STEP 3: Groq  Caption Generation (menerima JSON bersih dari enrichment) 
async function generateCaptionAi(productJson, gender, style) {
  const apiUrl = `/api/proxy?action=groq-caption`;

  const productDescription = productJson
    ? (typeof productJson === 'object' ? JSON.stringify(productJson, null, 2) : String(productJson))
    : null;

  const promptText = `Kamu adalah copywriter Instagram fashion Indonesia yang menulis caption singkat, gaul, dan menjual.

INPUT JSON:
${productDescription || `Produk fashion untuk ${gender} dengan latar ${style}.`}

ATURAN:
- Gunakan HANYA informasi dari JSON di atas.
- Jangan mengarang warna, bahan, atau detail yang tidak ada di JSON.
- Jangan sebut kategori produk lain selain yang ada di JSON.
- Tulis dalam Bahasa Indonesia yang santai dan natural  seperti teman ngobrol, bukan sales pitch.
- Jangan gunakan kata klise: "berkualitas tinggi", "terbaik", "tak lekang waktu", "elevate your look".
- Maksimal 40 kata (tidak termasuk hashtag).
- Gunakan emoji yang natural.

FORMAT OUTPUT (tanpa label, langsung isinya):
Baris 1: Hook satu kalimat yang bikin scroll berhenti.
Baris 2: Cerita singkat gaya hidup, bukan spesifikasi.
Baris 4: CTA satu baris yang bikin mereka action.
Baris 5: Beri hashtag relevan dalam satu baris.

CONTOH untuk Kacamata Hitam:
Kacamata bukan sembarang kacamata. 
Clean, confident, dan cocok ke mana aja kamu pergi.
Gaskeun sebelum kehabisan, cek link bio!
#kacamata #sunglasses #ootd #streetstyleindo #fashionpria #stylecheck #accessoriesootd #outfitcheck

CONTOH untuk Sneakers:
Sepatu ini pas buat jalan sama buat flex.
Bold dan kece, pas buat anak yang gerak terus tapi tetep stylish.
DM sekarang buat info ukuran dan harga!
#sneakers #sepatugaul #streetwear #ootdindo #fashionpria #kicksoftheday #hypebeastindo #outfitgoals

OUTPUT HANYA caption-nya saja. Tidak perlu label, tidak perlu penjelasan.`;

 // Groq pakai format OpenAI-compatible messages[]
  const payload = {
    messages: [
      {
        role: 'user',
        content: promptText
      }
    ]
  };

  return await fetchWithRetry(apiUrl, payload, (result) => {
    return result?.choices?.[0]?.message?.content || null;
  }, 1);
}

// Helper: Ekstrak pesan error yang human-readable
function extractErrorMessage(err) {
  if (!err) return 'Terjadi kesalahan tidak dikenal.';
  const msg = err.message || String(err);

  // Tangkap status HTTP
  const statusMatch = msg.match(/HTTP Error status: (\d+)(.*)/);
  if (statusMatch) {
    const code = statusMatch[1];
    const detail = statusMatch[2] ? statusMatch[2].replace(/^\s*[-:]+\s*/, '') : '';
    const codeMap = {
      '400': 'Request tidak valid (400)',
      '401': 'Autentikasi gagal, periksa API token (401)',
      '403': 'Akses ditolak, periksa izin API token (403)',
      '404': 'Model tidak ditemukan (404)',
      '429': 'Kuota habis / Rate limit (429), coba lagi sebentar',
      '500': 'Server error internal (500)',
      '503': 'Server tidak tersedia sementara (503)'
    };
    const label = codeMap[code] || `Error ${code}`;
    return detail ? `${label}: ${detail}` : label;
  }

  // Truncate jika terlalu panjang
  return msg.length > 120 ? msg.slice(0, 120) + '...' : msg;
}

async function fetchWithRetry(url, payload, resultExtractor, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.status === 429) {
        let waitMs = 30000;
        try {
          const errData = await response.json();
          const retryDelaySec = errData?.error?.details
            ?.find(d => d.retryDelay)
            ?.retryDelay;
          if (retryDelaySec) {
            waitMs = parseFloat(retryDelaySec) * 1000;
          }
        } catch (_) {}
        
        console.warn(`Rate limited (429). Waiting ${Math.round(waitMs / 1000)}s...`);
        showToast(`Antrean server padat. Menunggu ${Math.round(waitMs / 1000)} detik...`, "warning", "Antrean Server");
        
        if (attempt === maxRetries) {
          throw new Error(`HTTP Error status: ${response.status} - quota exceeded`);
        }
        
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      if (!response.ok) {
        let serverMsg = '';
        try {
          const errData = await response.json();
          // Ekstrak pesan error dari berbagai format respons
          serverMsg = errData?.error?.message
            || errData?.error
            || errData?.message
            || JSON.stringify(errData);
        } catch (_) {
          serverMsg = await response.text();
        }
        // Potong jika terlalu panjang
        if (typeof serverMsg === 'string' && serverMsg.length > 200) {
          serverMsg = serverMsg.slice(0, 200) + '...';
        }
        console.error('API Error Response:', serverMsg);
        throw new Error(`HTTP Error status: ${response.status} - ${serverMsg}`);
      }

      const data = await response.json();
      const extracted = resultExtractor(data);
      if (extracted) return extracted;

    } catch (e) {
      if (attempt === maxRetries) {
        throw e;
      }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  return null;
}

function setLoadingState(isLoading) {
  const btn = document.getElementById('btnGenerate');
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.classList.add('opacity-70', 'cursor-not-allowed');
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i><span>Sedang Memproses AI...</span>`;

    const loaderHTML = `
      <div class="flex flex-col items-center text-teal-600 animate-pulse p-4">
        <i class="fa-solid fa-wand-magic-sparkles text-3xl mb-3 text-teal-500"></i>
        <span class="text-xs font-bold text-slate-700">Generating AI Mockup...</span>
        <span class="text-[10px] text-slate-400 mt-1">Estimasi 5-10 detik</span>
      </div>
    `;

    document.getElementById('tryOnPlaceholder').innerHTML = loaderHTML;
    document.getElementById('tryOnPlaceholder').classList.remove('hidden');

    document.getElementById('imgTryOn').classList.add('hidden');
    document.getElementById('overlayTryOn').classList.add('hidden');
    
    document.getElementById('captionText').value = "Menganalisis produk & menyusun copywriting AI...";

  } else {
    btn.disabled = false;
    btn.classList.remove('opacity-70', 'cursor-not-allowed');
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-amber-300"></i><span>Generate Mockup & Caption</span>`;
  }
}

function copyCaption() {
  const captionInput = document.getElementById('captionText');
  const text = captionInput ? captionInput.value : '';
  if (!text) {
    showToast("Kolom caption masih kosong!", "warning", "Caption Kosong");
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast("Caption tersalin ke clipboard!", "success", "Berhasil Disalin");
  }).catch(() => {
    showToast("Gagal menyalin. Silakan salin manual.", "error", "Gagal Salin");
  });
}