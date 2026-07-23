/**
 * Modul Notifikasi (Toast & Alert Modal System)
 * Katalogin AI Try-On
 * Ditata agar maksimal hanya 1 Toast & 1 Alert Modal yang aktif (tidak menumpuk)
 */

(function () {
  let activeToastTimeout = null;

  // Ensure containers exist on DOM ready
  function initContainers() {
    if (!document.getElementById('toastContainer')) {
      const toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0';
      document.body.appendChild(toastContainer);
    }

    if (!document.getElementById('alertModalContainer')) {
      const modalContainer = document.createElement('div');
      modalContainer.id = 'alertModalContainer';
      modalContainer.className = 'hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300';
      document.body.appendChild(modalContainer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContainers);
  } else {
    initContainers();
  }

  /**
   * Menampilkan Toast notification (Maksimal 1 aktif, toast lama otomatis dihapus)
   * @param {string} message - Pesan toast
   * @param {'success'|'error'|'warning'|'info'} type - Tipe notifikasi
   * @param {string|null} title - Judul opsional
   * @param {number} duration - Durasi tampil dalam milidetik (default: 3500ms)
   */
  window.showToast = function (message, type = 'info', title = null, duration = 3500) {
    initContainers();
    const container = document.getElementById('toastContainer');

    // Hapus toast lama & batalkan timer sebelumnya agar tidak menumpuk
    if (activeToastTimeout) {
      clearTimeout(activeToastTimeout);
      activeToastTimeout = null;
    }
    container.innerHTML = '';

    const config = {
      success: {
        bg: 'bg-emerald-900/90 border-emerald-500/30 text-emerald-100',
        icon: 'fa-circle-check text-emerald-400',
        defaultTitle: 'Berhasil'
      },
      error: {
        bg: 'bg-rose-900/90 border-rose-500/30 text-rose-100',
        icon: 'fa-circle-xmark text-rose-400',
        defaultTitle: 'Terjadi Kesalahan'
      },
      warning: {
        bg: 'bg-amber-900/90 border-amber-500/30 text-amber-100',
        icon: 'fa-triangle-exclamation text-amber-400',
        defaultTitle: 'Peringatan'
      },
      info: {
        bg: 'bg-slate-900/90 border-teal-500/30 text-slate-100',
        icon: 'fa-circle-info text-teal-400',
        defaultTitle: 'Informasi'
      }
    };

    const style = config[type] || config.info;
    const toastTitle = title || style.defaultTitle;

    const toastEl = document.createElement('div');
    toastEl.className = `${style.bg} border backdrop-blur-md px-4 py-3.5 rounded-2xl shadow-2xl pointer-events-auto flex items-start gap-3 transition-all duration-300 transform translate-y-6 opacity-0 scale-95`;
    
    toastEl.innerHTML = `
      <div class="mt-0.5 text-lg flex-shrink-0">
        <i class="fa-solid ${style.icon}"></i>
      </div>
      <div class="flex-1 pr-2">
        <div class="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">${toastTitle}</div>
        <div class="text-xs sm:text-sm font-medium leading-snug">${message}</div>
      </div>
      <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white transition-colors text-xs p-1 cursor-pointer">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    container.appendChild(toastEl);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toastEl.classList.remove('translate-y-6', 'opacity-0', 'scale-95');
      toastEl.classList.add('translate-y-0', 'opacity-100', 'scale-100');
    });

    // Auto remove after duration
    activeToastTimeout = setTimeout(() => {
      toastEl.classList.remove('translate-y-0', 'opacity-100', 'scale-100');
      toastEl.classList.add('translate-y-4', 'opacity-0', 'scale-95');
      setTimeout(() => {
        if (toastEl.parentElement) toastEl.remove();
      }, 300);
    }, duration);
  };

  /**
   * Menampilkan Alert Modal Interaktif (Maksimal 1 aktif)
   * @param {Object} options
   * @param {string} options.title - Judul Alert Modal
   * @param {string} options.message - Deskripsi pesan
   * @param {'info'|'warning'|'error'|'success'} options.type - Tipe visual modal
   * @param {string} options.confirmText - Teks tombol konfirmasi (default: 'OK')
   * @param {string|null} options.cancelText - Teks tombol batal jika modal konfirmasi (default: null)
   * @param {Function|null} options.onConfirm - Callback jika menekan konfirmasi
   * @param {Function|null} options.onCancel - Callback jika menekan batal
   */
  window.showAlertModal = function ({
    title = 'Perhatian',
    message = '',
    type = 'info',
    confirmText = 'OK',
    cancelText = null,
    onConfirm = null,
    onCancel = null
  }) {
    initContainers();
    const container = document.getElementById('alertModalContainer');

    // Kosongkan modal yang sedang berjalan jika ada
    container.innerHTML = '';

    const icons = {
      info: 'fa-circle-info text-teal-600 bg-teal-100',
      warning: 'fa-triangle-exclamation text-amber-600 bg-amber-100',
      error: 'fa-circle-xmark text-rose-600 bg-rose-100',
      success: 'fa-circle-check text-emerald-600 bg-emerald-100'
    };

    const iconStyle = icons[type] || icons.info;
    const isConfirmModal = cancelText !== null;

    container.innerHTML = `
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 transform transition-all scale-95 opacity-0" id="alertModalContent">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl ${iconStyle} flex items-center justify-center text-xl flex-shrink-0">
            <i class="fa-solid ${iconStyle.split(' ')[0]}"></i>
          </div>
          <div class="flex-1">
            <h3 class="font-extrabold text-slate-900 text-base sm:text-lg mb-1">${title}</h3>
            <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">${message}</p>
          </div>
        </div>

        <div class="flex gap-2.5 pt-3">
          ${isConfirmModal ? `
            <button id="alertBtnCancel" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer">
              ${cancelText}
            </button>
          ` : ''}
          <button id="alertBtnConfirm" class="flex-1 ${type === 'error' || type === 'warning' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'} text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-colors shadow-md cursor-pointer">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    container.classList.remove('hidden');
    const content = document.getElementById('alertModalContent');
    requestAnimationFrame(() => {
      content.classList.remove('scale-95', 'opacity-0');
      content.classList.add('scale-100', 'opacity-100');
    });

    const closeModal = (callback) => {
      content.classList.remove('scale-100', 'opacity-100');
      content.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        container.classList.add('hidden');
        container.innerHTML = '';
        if (typeof callback === 'function') callback();
      }, 200);
    };

    document.getElementById('alertBtnConfirm').onclick = () => closeModal(onConfirm);
    
    if (isConfirmModal) {
      document.getElementById('alertBtnCancel').onclick = () => closeModal(onCancel);
    }
  };
})();
