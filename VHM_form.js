/* ============================================================
   VHM_form.js  –  VHM Scholarship · Exam Registration Form
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  var form      = document.getElementById('regForm');
  var submitBtn = document.getElementById('submitBtn');
  var btnText   = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  var spinner   = submitBtn ? submitBtn.querySelector('.spinner')  : null;

  if (!form || !submitBtn) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    /* ── Basic validation ── */
    var required = form.querySelectorAll('[required]');
    var invalid  = false;
    required.forEach(function (el) {
      if (el.type === 'checkbox' && !el.checked) { invalid = true; el.closest('.check-item').style.outline = '2px solid #ff4d4d'; }
      else if (el.type === 'radio') {
        var group = form.querySelectorAll('input[name="' + el.name + '"]');
        var checked = Array.from(group).some(function (r) { return r.checked; });
        if (!checked) invalid = true;
      }
      else if (!el.value.trim()) { invalid = true; el.style.borderColor = '#ff4d4d'; }
    });

    if (invalid) {
      showToast('⚠️', 'Please fill all required fields', 'error');
      return;
    }

    /* ── UI: loading state ── */
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Submitting…';
    if (spinner) spinner.style.display = 'block';

    /* ── Collect all field values ── */
    var fd = new FormData(form);

    var gender = (form.querySelector('input[name="gender"]:checked') || {}).value || '';

    var candidateData = {
      /* Registration */
      regDate:       fd.get('reg_date')       || '',

      /* Personal */
      firstName:     fd.get('first_name')     || '',
      middleName:    fd.get('middle_name')    || '',
      lastName:      fd.get('last_name')      || '',
      gender:        gender,
      dob:           fd.get('dob')            || '',

      /* Location */
      country:       fd.get('country')        || '',
      state:         fd.get('state')          || '',
      lga:           fd.get('lga')            || '',
      address:       fd.get('address')        || '',

      /* Parent / Guardian */
      parentName:    fd.get('parent_name')    || '',
      parentPhone:   fd.get('parent_phone')   || '',
      altPhone:      fd.get('alt_phone')      || '',
      parentEmail:   fd.get('parent_email')   || '',

      /* Fellowship */
      hcf:           fd.get('hcf')            || '',

      /* School */
      currentClass:  fd.get('current_class')  || '',
      schoolName:    fd.get('school_name')    || '',
      schoolAddress: fd.get('school_address') || '',
      classTeacher:  fd.get('class_teacher')  || '',
      headTeacher:   fd.get('head_teacher')   || '',

      /* Meta */
      timestamp: new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    };

    var fullName = [candidateData.firstName, candidateData.middleName, candidateData.lastName]
      .filter(Boolean).join(' ') || 'Candidate';

    /* ── Web3Forms payload ── */
    var payload = {
      access_key: 'e520ef25-1ade-4cf1-8138-c63df3a50548',

      /* ✉️ This subject appears in your Gmail inbox notification */
      subject:   '📚 VHM Scholarship Exam – New Candidate Registration [Season 8]',
      from_name: 'VHM Scholarship Portal',
      email:     candidateData.parentEmail || 'noreply@vhmscholarship.org',

      message:
'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
+ '📚  VHM SCHOLARSHIP EXAM REGISTRATION\n'
+ '     Season 8 · April 2026\n'
+ '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'

+ '── CANDIDATE ────────────────────────────\n'
+ 'Full Name      : ' + fullName                        + '\n'
+ 'Gender         : ' + candidateData.gender            + '\n'
+ 'Date of Birth  : ' + candidateData.dob               + '\n'
+ 'Reg. Date      : ' + candidateData.regDate           + '\n\n'

+ '── LOCATION ─────────────────────────────\n'
+ 'Country        : ' + candidateData.country           + '\n'
+ 'State          : ' + candidateData.state             + '\n'
+ 'Local Govt.    : ' + candidateData.lga               + '\n'
+ 'Home Address   : ' + candidateData.address           + '\n\n'

+ '── PARENT / GUARDIAN ────────────────────\n'
+ 'Name           : ' + candidateData.parentName        + '\n'
+ 'Phone          : ' + candidateData.parentPhone       + '\n'
+ 'Alt. Phone     : ' + candidateData.altPhone          + '\n'
+ 'Email          : ' + candidateData.parentEmail       + '\n\n'

+ '── FELLOWSHIP ───────────────────────────\n'
+ 'HCF Centre     : ' + candidateData.hcf               + '\n\n'

+ '── SCHOOL ───────────────────────────────\n'
+ 'School Name    : ' + candidateData.schoolName        + '\n'
+ 'School Address : ' + candidateData.schoolAddress     + '\n'
+ 'Current Class  : ' + candidateData.currentClass      + '\n'
+ 'Class Teacher  : ' + candidateData.classTeacher      + '\n'
+ 'Head Teacher   : ' + candidateData.headTeacher       + '\n\n'

+ '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
+ 'Submitted      : ' + candidateData.timestamp         + '\n'
+ '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    };

    try {
      var response = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });

      var result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Submission failed');
      }

      /* ── Save to localStorage AFTER confirmed send ── */
      localStorage.setItem('candidateData', JSON.stringify(candidateData));

      /* ── Success UI ── */
      if (btnText) btnText.textContent = '✅ Submitted! Redirecting…';
      showToast('✅', 'Registration submitted!', 'success');

      setTimeout(function () {
        window.location.href = 'success.html';
      }, 1200);

    } catch (err) {
      console.error('Submission error:', err);
      showToast('❌', 'Submission failed. Try again.', 'error');
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Submit Registration';
      if (spinner) spinner.style.display = 'none';
    }
  });

  /* Clear red borders on input */
  form.querySelectorAll('input, textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      el.style.borderColor = '';
    });
  });

});


/* ── Toast helper ── */
function showToast(icon, msg, type) {
  var toast   = document.getElementById('toast');
  var iconEl  = document.getElementById('toastIcon');
  var msgEl   = document.getElementById('toastMsg');
  if (!toast) return;

  if (iconEl) iconEl.textContent = icon;
  if (msgEl)  msgEl.textContent  = msg;

  toast.className = 'show ' + (type || '');
  setTimeout(function () { toast.className = ''; }, 4000);
}

function goBack() { window.history.back(); }