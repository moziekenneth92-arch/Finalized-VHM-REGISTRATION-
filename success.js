/* ============================================================
   success.js  –  VHM Scholarship · Registration Success Page
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  var data = {};
  try {
    data = JSON.parse(localStorage.getItem('candidateData')) || {};
  } catch (e) {}

  var fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean).join(' ') || 'Guest';

  var nameEl  = document.getElementById('candidateName');
  var emailEl = document.getElementById('candidateEmail');
  if (nameEl)  nameEl.textContent  = fullName;
  if (emailEl) emailEl.textContent = data.parentEmail || 'No email provided';

  var btn = document.getElementById('savePdfBtn');
  if (btn) {
    btn.addEventListener('click', function () {

      /* ── Immediately show the downloading notification ── */
      showDownloadingNotification();

      /* ── Disable button while processing ── */
      btn.disabled = true;
      var origText = btn.textContent;
      btn.textContent = '⏳ Preparing PDF...';

      /* ── Load logo then generate PDF ── */
      loadImageAsBase64('VHM.png', function (logoBase64) {
        printRegistrationPDF(data, fullName, logoBase64, function () {
          /* Re-enable button after print dialog opens */
          btn.disabled    = false;
          btn.textContent = origText;
        });
      });
    });
  }
});


/* ============================================================
   showDownloadingNotification
   Shows a persistent "preparing your PDF" banner that stays
   visible until the print dialog opens, then fades out.
   ============================================================ */
function showDownloadingNotification() {

  /* Remove any existing one first */
  var old = document.getElementById('vhm-dl-toast');
  if (old) old.remove();

  var toast = document.createElement('div');
  toast.id  = 'vhm-dl-toast';

  toast.innerHTML =
    '<span style="font-size:20px;line-height:1;">📄</span>'
    + '<div style="display:flex;flex-direction:column;gap:2px;">'
    +   '<span style="font-weight:700;font-size:13px;">Preparing your PDF…</span>'
    +   '<span style="font-size:11px;opacity:0.85;">Your registration document is being generated</span>'
    + '</div>'
    + '<div id="vhm-dl-spinner" style="'
    +   'width:18px;height:18px;'
    +   'border:2px solid rgba(255,255,255,0.35);'
    +   'border-top-color:#fff;'
    +   'border-radius:50%;'
    +   'animation:vhm-spin 0.7s linear infinite;'
    +   'flex-shrink:0;'
    + '"></div>';

  toast.style.cssText = [
    'position:fixed',
    'bottom:28px',
    'left:50%',
    'transform:translateX(-50%) translateY(80px)',
    'display:flex',
    'align-items:center',
    'gap:14px',
    'background:linear-gradient(135deg,#0a1a2e 60%,#1a3a6e)',
    'color:#fff',
    'padding:14px 22px',
    'border-radius:12px',
    'box-shadow:0 8px 32px rgba(0,0,0,0.28)',
    'z-index:99999',
    'max-width:360px',
    'width:90vw',
    'transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
    'opacity:0'
  ].join(';');

  /* Keyframe for spinner */
  if (!document.getElementById('vhm-spin-style')) {
    var style = document.createElement('style');
    style.id  = 'vhm-spin-style';
    style.textContent = '@keyframes vhm-spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  /* Slide up into view */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity   = '1';
    });
  });

  /* Expose a dismiss function so the PDF callback can close it */
  toast._dismiss = function (success) {
    /* Swap content to success/error message */
    var icon    = success ? '✅' : '❌';
    var title   = success ? 'Print dialog is open!'       : 'Something went wrong';
    var sub     = success ? 'Choose "Save as PDF" to download' : 'Please try again';

    toast.innerHTML =
      '<span style="font-size:20px;line-height:1;">' + icon + '</span>'
      + '<div style="display:flex;flex-direction:column;gap:2px;">'
      +   '<span style="font-weight:700;font-size:13px;">' + title + '</span>'
      +   '<span style="font-size:11px;opacity:0.85;">'   + sub   + '</span>'
      + '</div>';

    /* Slide back down after 2.8 s */
    setTimeout(function () {
      toast.style.transform = 'translateX(-50%) translateY(80px)';
      toast.style.opacity   = '0';
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 420);
    }, 2800);
  };

  return toast;
}


/* ============================================================
   loadImageAsBase64
   ============================================================ */
function loadImageAsBase64(src, callback) {
  var img    = new Image();
  var canvas = document.createElement('canvas');

  img.onload = function () {
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    try   { callback(canvas.toDataURL('image/png')); }
    catch (e) { callback(null); }
  };
  img.onerror = function () { callback(null); };

  img.crossOrigin = 'anonymous';
  img.src = src + '?_=' + Date.now();
}


/* ============================================================
   printRegistrationPDF
   ============================================================ */
function printRegistrationPDF(data, fullName, logoBase64, onReady) {

  function esc(v) {
    if (v == null || v === '') return null;
    return String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function row(label, value) {
    var v = esc(value);
    if (!v) return '';
    return '<tr><td class="lbl">' + label + '</td><td class="val">' + v + '</td></tr>';
  }

  function section(title, rows) {
    if (!rows) return '';
    var t = rows.replace(/^\s+|\s+$/g, '');
    if (!t) return '';
    return '<div class="section">'
      + '<div class="sec-head">' + title + '</div>'
      + '<table>' + t + '</table>'
      + '</div>';
  }

  var today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  var summaryRows =
    row('Full Name',         fullName) +
    row('Email Address',     data.parentEmail) +
    row('Registration Date', data.regDate || today) +
    row('Submission Time',   data.timestamp);

  var personalRows =
    row('First Name',    data.firstName)  +
    row('Middle Name',   data.middleName) +
    row('Last Name',     data.lastName)   +
    row('Gender',        data.gender)     +
    row('Date of Birth', data.dob);

  var locationRows =
    row('Country',             data.country)  +
    row('State',               data.state)    +
    row('Local Government',    data.lga)      +
    row('Residential Address', data.address);

  var guardianRows =
    row('Full Name',       data.parentName)   +
    row('Relationship',    data.relationship) +
    row('Phone Number',    data.parentPhone)  +
    row('Alternate Phone', data.altPhone)     +
    row('Email Address',   data.parentEmail);

  var schoolRows =
    row('School Name',              data.schoolName)    +
    row('School Address',           data.schoolAddress) +
    row('School Type',              data.schoolType)    +
    row('Current Class',            data.currentClass)  +
    row('Class Teacher',            data.classTeacher)  +
    row('Head Teacher / Principal', data.headTeacher);

  var fellowshipRows =
    row('HCF Centre',      data.hcf)    +
    row('Zone / Branch',   data.branch) +
    row('Pastor / Leader', data.pastor);

  var extraRows =
    row('Disability / Special Needs', data.disability) +
    row('How Did You Hear About Us',  data.heardAbout) +
    row('Additional Notes',           data.notes);

  var logoHTML = logoBase64
    ? '<img src="' + logoBase64 + '" alt="VHM Logo" style="'
      + 'width:70px;height:70px;object-fit:contain;border-radius:50%;'
      + 'border:2px solid #e0e8ff;margin:0 auto 8px auto;display:block;"/>'
    : '';

  var html = '<!DOCTYPE html><html lang="en"><head>'
    + '<meta charset="UTF-8"/>'
    + '<title>VHM Registration – ' + (esc(fullName) || 'Candidate') + '</title>'
    + '<style>'
    + '@page { size:A4 portrait; margin:14mm 13mm 14mm 13mm; }'
    + '* { box-sizing:border-box; margin:0; padding:0; }'
    + 'body { font-family:"Segoe UI",Arial,sans-serif; font-size:11px; color:#1a1a2e; background:#fff; line-height:1.5; }'
    + '.letterhead { text-align:center; padding-bottom:14px; border-bottom:3px solid #1a6fff; margin-bottom:14px; }'
    + '.letterhead h1 { font-size:17px; font-weight:800; color:#0a1a2e; letter-spacing:1.4px; text-transform:uppercase; margin:6px 0 3px 0; }'
    + '.letterhead .org  { font-size:11px; color:#444; margin:2px 0; }'
    + '.letterhead .seas { font-size:11px; color:#1a6fff; font-weight:700; margin:2px 0; }'
    + '.badge-wrap { text-align:center; margin-bottom:14px; }'
    + '.badge { display:inline-block; background:#2ecc71; color:#fff; font-size:11px; font-weight:700; padding:6px 22px; border-radius:5px; letter-spacing:0.5px; }'
    + '.section { margin-bottom:11px; page-break-inside:avoid; }'
    + '.sec-head { background:#0a1a2e; color:#fff; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:1.4px; padding:6px 10px; border-radius:4px 4px 0 0; }'
    + 'table { width:100%; border-collapse:collapse; border:1px solid #dde2ec; border-top:none; }'
    + 'tr { border-bottom:1px solid #eef0f4; }'
    + 'tr:last-child { border-bottom:none; }'
    + 'tr:nth-child(even) { background:#f7f9ff; }'
    + 'td { padding:6px 10px; vertical-align:top; }'
    + 'td.lbl { width:40%; font-size:9.5px; font-weight:700; color:#1a6fff; text-transform:uppercase; letter-spacing:0.7px; white-space:nowrap; }'
    + 'td.val { font-size:11px; color:#0a1a2e; }'
    + '.notice { background:#eef5ff; border:1px solid #b8d4ff; border-radius:5px; padding:9px 14px; margin-bottom:13px; font-size:10.5px; color:#0a1a2e; text-align:center; line-height:1.6; page-break-inside:avoid; }'
    + '.footer { border-top:2px solid #e0e4ee; padding-top:10px; text-align:center; color:#666; font-size:10px; line-height:1.8; page-break-inside:avoid; }'
    + '.footer strong { color:#0a1a2e; font-size:11px; }'
    + '.tagline { opacity:0.5; font-size:9.5px; margin-top:6px; }'
    + '</style></head><body>'

    + '<div class="letterhead">'
    +   logoHTML
    +   '<h1>Registration Confirmation</h1>'
    +   '<p class="org">Victory Holyghost Mission Scholarship Scheme</p>'
    +   '<p class="seas">Season 8 &nbsp;&middot;&nbsp; April 2026</p>'
    + '</div>'

    + '<div class="badge-wrap"><span class="badge">&#10003; Registration Successful</span></div>'

    + section('Candidate Summary',      summaryRows)
    + section('Personal Information',   personalRows)
    + section('Location',               locationRows)
    + section('Parent / Guardian',      guardianRows)
    + section('School Information',     schoolRows)
    + section('Fellowship Details',     fellowshipRows)
    + section('Additional Information', extraRows)

    + '<div class="notice">'
    +   '<strong>Note:</strong> God bless you, we will get back to you. '
    +   'Please Bring Form To Church Address'
    + '</div>'

    + '<div class="footer">'
    +   '<strong>Victory Holyghost Mission Scholarship Scheme</strong><br>'
    +   '15/17 Abimbola Street, Isolo, Lagos, Nigeria<br>'
    +   'Phone: (+234) 08161888886, 08186516869<br>'
    +   'Email: vhmscholar@gmail.com'
    +   '<p class="tagline">Impacting Lives &nbsp;&middot;&nbsp; Driving Excellence</p>'
    + '</div>'

    + '</body></html>';

  /* ── iframe ── */
  var iframe = document.createElement('iframe');
  iframe.style.cssText = [
    'position:fixed','top:0','left:-9999px',
    'width:794px','height:1123px',
    'border:none','visibility:hidden'
  ].join(';');
  document.body.appendChild(iframe);

  var doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = function () {
    setTimeout(function () {
      var toast = document.getElementById('vhm-dl-toast');
      var success = false;
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        success = true;
      } catch (e) {
        console.error('Print failed:', e);
      }

      /* Update the notification */
      if (toast && toast._dismiss) toast._dismiss(success);

      /* Re-enable button */
      if (typeof onReady === 'function') onReady();

      /* Clean up iframe */
      setTimeout(function () {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 4000);
    }, 700);
  };
}

