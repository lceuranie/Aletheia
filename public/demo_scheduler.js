document.addEventListener("DOMContentLoaded", function() {
  const modalHTML = `
    <div id="demo-modal" class="ds-modal-overlay">
      <div class="ds-modal-container">
        <div class="ds-header">
          <h2>Request a Demo</h2>
          <button class="ds-close-btn" aria-label="Close modal">&times;</button>
        </div>
        <div class="ds-body">
          
          <!-- Step 1: Calendar -->
          <div id="ds-step-1" class="ds-view ds-active">
            <div class="ds-month-nav">
              <button id="ds-prev-month" aria-label="Previous month">←</button>
              <div id="ds-month-label" class="ds-month-label"></div>
              <button id="ds-next-month" aria-label="Next month">→</button>
            </div>
            <div class="ds-weekdays">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div id="ds-days" class="ds-days"></div>
          </div>

          <!-- Step 2: Time Slots -->
          <div id="ds-step-2" class="ds-view">
            <button id="ds-back-to-cal" class="ds-back-btn">← Back to calendar</button>
            <div id="ds-date-display" class="ds-date-display"></div>
            <div id="ds-slots-grid" class="ds-slots-grid">
              <!-- Slots populated by JS -->
            </div>
          </div>

          <!-- Step 3: Details Form -->
          <div id="ds-step-3" class="ds-view">
            <button id="ds-back-to-slots" class="ds-back-btn">← Back to times</button>
            <div id="ds-slot-display" class="ds-date-display" style="font-size:1.1rem; margin-bottom: 16px;"></div>
            <form id="ds-form">
              <div class="ds-form-group">
                <label for="ds-name">Name *</label>
                <input type="text" id="ds-name" class="ds-input" required>
              </div>
              <div class="ds-form-group">
                <label for="ds-email">Email *</label>
                <input type="email" id="ds-email" class="ds-input" required>
              </div>
              <div class="ds-form-group">
                <label for="ds-comments">Comments (Optional)</label>
                <textarea id="ds-comments" class="ds-input" placeholder="Anything you want to share in advance?"></textarea>
              </div>
              <button type="submit" class="ds-submit-btn">Schedule on Google Calendar</button>
              <div class="ds-helper-text">This will open Google Calendar to add the event to your calendar and invite us automatically.</div>
            </form>
          </div>

        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('demo-modal');
  const closeBtn = modal.querySelector('.ds-close-btn');
  const step1 = document.getElementById('ds-step-1');
  const step2 = document.getElementById('ds-step-2');
  const step3 = document.getElementById('ds-step-3');

  // State
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Rule: At least 1 week in advance
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 7);

  // Rule: Up to 2 months from minDate
  const maxDate = new Date(minDate);
  maxDate.setMonth(maxDate.getMonth() + 2);

  let currentRenderMonth = new Date(minDate);
  currentRenderMonth.setDate(1);

  let selectedDate = null;
  let selectedTimeStr = null;

  function renderCalendar() {
    const monthLabel = document.getElementById('ds-month-label');
    const daysGrid = document.getElementById('ds-days');
    const prevBtn = document.getElementById('ds-prev-month');
    const nextBtn = document.getElementById('ds-next-month');

    const year = currentRenderMonth.getFullYear();
    const month = currentRenderMonth.getMonth();

    monthLabel.textContent = currentRenderMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Enable/disable prev
    const prevMonthDate = new Date(year, month - 1, 1);
    prevBtn.disabled = (prevMonthDate.getFullYear() === minDate.getFullYear() && prevMonthDate.getMonth() < minDate.getMonth()) || prevMonthDate.getFullYear() < minDate.getFullYear();

    // Enable/disable next
    const nextMonthDate = new Date(year, month + 1, 1);
    nextBtn.disabled = (nextMonthDate.getFullYear() === maxDate.getFullYear() && nextMonthDate.getMonth() > maxDate.getMonth()) || nextMonthDate.getFullYear() > maxDate.getFullYear();

    daysGrid.innerHTML = '';
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Pad empty days
    for (let i = 0; i < firstDay; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'ds-day ds-empty';
      daysGrid.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayEl = document.createElement('div');
      dayEl.className = 'ds-day';
      dayEl.textContent = i;

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPastOrSoon = date < minDate;
      const isTooFar = date > maxDate;

      if (isWeekend || isPastOrSoon || isTooFar) {
        dayEl.classList.add('ds-disabled');
      } else {
        dayEl.addEventListener('click', () => {
          selectedDate = date;
          showStep2();
        });
      }

      daysGrid.appendChild(dayEl);
    }
  }

  function showStep1() {
    step1.classList.add('ds-active');
    step2.classList.remove('ds-active');
    step3.classList.remove('ds-active');
  }

  function showStep2() {
    step1.classList.remove('ds-active');
    step3.classList.remove('ds-active');
    step2.classList.add('ds-active');

    const dateDisplay = document.getElementById('ds-date-display');
    dateDisplay.textContent = selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' });

    const slotsGrid = document.getElementById('ds-slots-grid');
    slotsGrid.innerHTML = '';

    // Mon-Fri 9am-6pm, minus 12pm-2pm
    const availableHours = [9, 10, 11, 14, 15, 16, 17];
    
    availableHours.forEach(hour => {
      const btn = document.createElement('button');
      btn.className = 'ds-slot-btn';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      btn.textContent = `${displayHour}:00 ${ampm} - ${displayHour + 1 === 13 ? 1 : displayHour + 1}:00 ${hour + 1 >= 12 ? 'PM' : 'AM'}`;
      
      btn.addEventListener('click', () => {
        selectedTimeStr = { label: btn.textContent, hour };
        showStep3();
      });
      slotsGrid.appendChild(btn);
    });
  }

  function showStep3() {
    step1.classList.remove('ds-active');
    step2.classList.remove('ds-active');
    step3.classList.add('ds-active');

    const slotDisplay = document.getElementById('ds-slot-display');
    slotDisplay.textContent = `${selectedDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })} at ${selectedTimeStr.label}`;
  }

  // Bind events
  document.getElementById('ds-prev-month').addEventListener('click', () => {
    currentRenderMonth.setMonth(currentRenderMonth.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('ds-next-month').addEventListener('click', () => {
    currentRenderMonth.setMonth(currentRenderMonth.getMonth() + 1);
    renderCalendar();
  });

  document.getElementById('ds-back-to-cal').addEventListener('click', showStep1);
  document.getElementById('ds-back-to-slots').addEventListener('click', showStep2);

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('ds-active');
    setTimeout(showStep1, 300); // reset after hidden
  });

  document.getElementById('ds-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ds-name').value;
    const email = document.getElementById('ds-email').value;
    const comments = document.getElementById('ds-comments').value;

    // Build ISO strings for Calendar link (UTC timezone assumption for ease, but typically local to the user)
    // To make it easy, we will format it as a local timezone string without the Z for Google Calendar, 
    // so it imports into the user's local timezone.
    const startObj = new Date(selectedDate);
    startObj.setHours(selectedTimeStr.hour, 0, 0, 0);
    
    const endObj = new Date(startObj);
    endObj.setHours(startObj.getHours() + 1);

    const formatGCalDate = (d) => {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, ''); // creates YYYYMMDDTHHmmssZ
    };

    const gcalUrl = new URL('https://calendar.google.com/calendar/render');
    gcalUrl.searchParams.append('action', 'TEMPLATE');
    gcalUrl.searchParams.append('text', `Aletheia Demo - ${name}`);
    gcalUrl.searchParams.append('dates', `${formatGCalDate(startObj)}/${formatGCalDate(endObj)}`);
    gcalUrl.searchParams.append('details', `Name: ${name}\\nEmail: ${email}\\n\\nComments:\\n${comments}`);
    gcalUrl.searchParams.append('add', 'prazo983@gmail.com');

    window.open(gcalUrl.toString(), '_blank');
    
    // Close modal
    modal.classList.remove('ds-active');
    setTimeout(showStep1, 300);
  });

  // Attach to Request Demo buttons
  document.querySelectorAll('a[href="#demo"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('ds-active');
      renderCalendar();
    });
  });
});
