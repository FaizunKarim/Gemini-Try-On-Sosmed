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
          <span class="text-xs text-slate-400 max-w-xs mb-3">Klik di sini untuk memilih file dari komputer atau memasukkan URL gambar</span>
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg">
              <i class="fa-solid fa-folder-open mr-1"></i> File Lokal
            </span>
            <span class="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
              <i class="fa-solid fa-link mr-1"></i> Link URL
            </span>
          </div>
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

  showToast("Memulai proses pembuatan mockup & caption AI...", "info", "Memproses AI");
  setLoadingState(true);

  try {
    console.log('Generating image...');
    const tryOnImg = await generateImageAi(uploadedImage, gender, studioStyle);
    
    showToast("Mockup gambar AI berhasil dibuat! Menyusun caption...", "info", "Langkah 1 Selesai");
    await new Promise(r => setTimeout(r, 12000)); // Delay to respect rate limits
    
    console.log('Generating caption...');
    const captionText = await generateCaptionAi(uploadedImage, gender, studioStyle);

    console.log('Generation complete:', { tryOnImg: !!tryOnImg, captionText: !!captionText });

    // Display Try-On Image & setup download link
    if (tryOnImg) {
      document.getElementById('tryOnPlaceholder').classList.add('hidden');
      const imgEl = document.getElementById('imgTryOn');
      imgEl.src = tryOnImg;
      imgEl.classList.remove('hidden');
      
      const downloadBtn = document.getElementById('btnDownloadTryOn');
      if (downloadBtn) downloadBtn.href = tryOnImg;
      
      document.getElementById('overlayTryOn').classList.remove('hidden');
    }

    // Display & Enable Caption Textarea
    if (captionText) {
      const capContainer = document.getElementById('captionContainer');
      const capText = document.getElementById('captionText');
      const capBtn = document.getElementById('btnCopyCaption');
      const badge = document.getElementById('captionStatusBadge');
      const instruction = document.getElementById('captionInstruction');

      // Unlock container & textarea
      capContainer.classList.remove('opacity-70');
      capText.disabled = false;
      capText.value = captionText;
      capText.className = "w-full bg-white p-4 rounded-xl border border-teal-100/80 shadow-inner text-xs sm:text-sm text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed resize-y";

      // Enable copy button
      capBtn.disabled = false;
      capBtn.className = "text-xs font-bold text-teal-600 bg-white hover:bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer";

      // Update badge & hint
      badge.className = "text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1";
      badge.innerHTML = `<i class="fa-solid fa-lock-open text-[9px]"></i> Siap Diedit`;

      instruction.innerText = "Silakan edit teks di bawah ini jika ingin menyesuaikan harga, promo, atau pesan khusus:";
    }

    if (window.showAlertModal) {
      showAlertModal({
        title: 'Mockup & Caption Berhasil Dibuat!',
        message: 'Hasil tampilan model try-on dan caption copywriting promosi AI siap digunakan.',
        type: 'success',
        confirmText: 'Lihat Hasil'
      });
    }
    showToast("Mockup & Caption berhasil dibuat oleh AI!", "success", "Selesai ✨");

  } catch (err) {
    console.error("Generate Error:", err);
    showToast("Terjadi kesalahan saat memproses AI. Silakan coba lagi.", "error", "Gagal Proses AI");
  } finally {
    setLoadingState(false);
  }
}

async function generateImageAi(image, gender, style) {
  const apiUrl = `/api/proxy?model=gemini-3.1-flash-image`;

  const promptText = `A professional 1:1 square aspect ratio fashion lookbook photograph ideal for social media feed posts. An Indonesian ${gender.toLowerCase()} fashion model wearing the clothing item shown in the reference image. 
CRITICAL FRAMING INSTRUCTION: Analyze the provided clothing item and frame the shot accordingly:
- If ONLY shoes/footwear are provided, shoot a CLOSE-UP focusing strictly on the feet and lower legs.
- If ONLY a top/shirt/necklace is provided, shoot a HALF-BODY torso portrait.
- If ONLY pants/skirts/shorts are provided (without tops), shoot the LOWER BODY.
- If a full outfit (top + bottom, or a full dress) is provided, shoot a FULL-BODY or 3/4 body shot fitting comfortably within a 1:1 square frame.

Background setting: ${style}. Photorealistic, commercial fashion campaign quality, sharp focus on fabric details, realistic lighting.`;

  const parts = [{ text: promptText }];
  
  if (image.type === 'base64') {
    const mimeType = image.value.substring(image.value.indexOf(":") + 1, image.value.indexOf(";"));
    const base64Data = image.value.split(",")[1];
    parts.push({
      inlineData: {
        mimeType: mimeType || "image/png",
        data: base64Data
      }
    });
  } else if (image.type === 'url') {
    parts.push({
      fileData: {
        uri: image.value
      }
    });
  }

  const payload = {
    contents: [{ role: "user", parts: parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "1:1" }
    }
  };

  return await fetchWithRetry(apiUrl, payload, (result) => {
    const part = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part && part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  });
}

async function generateCaptionAi(image, gender, style) {
  const apiUrl = `/api/proxy?model=gemini-2.0-flash`;

  const promptText = `Bertindaklah sebagai Senior Fashion Copywriter & Performance Marketer kelas atas untuk brand lokal Indonesia.

TUGAS 1: PERIKSA & DETEKSI PRODUK
Analisis foto produk fashion yang dilampirkan secara teliti. Tentukan barang apa yang diunggah (misal: HANYA Sepatu Sneakers, HANYA Atasan/Kemeja, HANYA Celana/Bawahan, atau Setelan).

TUGAS 2: BUAT MARKETING COPYWRITING (AIDA FRAMEWORK)
Tuliskan 1 caption penawaran Instagram/TikTok Feed berkonversi tinggi dalam Bahasa Indonesia yang gaul, santai, namun sangat persuasif sesuai produk spesifik yang dideteksi.

Gunakan struktur AIDA:
1. ATTENTION (Hook Saja): Judul bombastis + emoji yang bikin netizen 'stop scrolling'. Jangan pakai kata 'Hook'. Sesuaikan judul dengan jenis barang.
2. INTEREST (Pain Point / Solusi): Bahas masalah nyata target pasar dan bagaimana produk ini jadi solusinya.
3. DESIRE (USP / Key Selling Point): Tonjolkan nilai tambah (kenyamanan bahan, detail jahitan rapi, fleksibel untuk OOTD harian/formal, visual aesthetic).
4. ACTION (Call to Action / CTA): Ajakan beli yang jelas dan mudah (contoh: "Klik link di bio / DM sekarang sebelum kehabisan slot promo!").
5. HASHTAGS: Berikan 6-8 hashtag niche & viral lokal yang sangat relevan.

Target Gender Model: ${gender}
Gaya Latar Foto: ${style}`;

  const parts = [{ text: promptText }];
  
  if (image.type === 'base64') {
    const mimeType = image.value.substring(image.value.indexOf(":") + 1, image.value.indexOf(";"));
    const base64Data = image.value.split(",")[1];
    parts.push({
      inlineData: {
        mimeType: mimeType || "image/png",
        data: base64Data
      }
    });
  } else if (image.type === 'url') {
    parts.push({
      fileData: {
        uri: image.value
      }
    });
  }

  const payload = {
    contents: [{ parts: parts }]
  };

  return await fetchWithRetry(apiUrl, payload, (result) => {
    return result?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  });
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
        let errorDetail = '';
        try {
          const errData = await response.json();
          errorDetail = JSON.stringify(errData);
        } catch (_) {
          errorDetail = await response.text();
        }
        console.error('API Error Response:', errorDetail);
        throw new Error(`HTTP Error status: ${response.status}`);
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

  captionInput.select();
  captionInput.setSelectionRange(0, 99999);

  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  showToast("Caption tersalin ke clipboard!", "success", "Berhasil Disalin");
}