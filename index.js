/*
  Kudos goes to https://github.com/o2dazone/ who is the original developer of the extension.

*/
(function() {
  var myInterval;
  var myInt;
  var Refresh_Page_Interval = 60000; //in milliseconds
  var Refresh_Interval_Active = false;
  var Auto_Kudos = false; // in milliseconds
  let kudosBtns = []
    , KUDOS_INTERVAL = 1000 // in milliseconds
    , KUDOS_LOCKOUT = 100 // https://github.com/o2dazone/StravaKudos/issues/13#issuecomment-356319221
    , btn
    , viewingAthleteId
    , els = '[data-testid=\'unfilled_kudos\']';

  const init =() => {
    const styles = document.createElement('style');
    styles.innerHTML = `
      #stravaKudos {
        display: flex;
        flex-direction: column;
        left: 5px;
        font-size: 20px;
        box-shadow: 0 2px 1px rgba(0, 0, 0, 0.2);
        z-index: 49;
        position: fixed;
        top: 61px
      }

      #stravaKudos div {
        margin: 0 auto
      }

      #stravaKudos p {
        margin: 0;
        font-size: 14px
      }

      #stravaKudos.hidden,
      #stravaKudos.lockout p {
        display: none !important;
        visibility: hidden !important
      }

      #stravaKudosCount {
        margin: 0 3px;
        font-weight: bold
      }
    `;
    document.head.prepend(styles);

    btn = document.createElement('button');
    btn.id = 'stravaKudos';
    btn.innerHTML = `
      <div>Give <span id="skCount"></span> Kudos</div>
      <p>Strava may throttle too<br/>many Kudos in one session</p>
    `;
    btn.className = 'btn btn-sm btn-primary hidden';

    btn.addEventListener('click', giveKudos);
    document.body.prepend(btn);
    updateCountNum();
    restore_options();
  };
  /* eslint-disable-next-line */
  const mockFillKudo = btn => {
    btn.setAttribute('fill','#FC5200');
    btn.dataset.testid = 'filled_kudos';
  };

  // give ALL the kudos
  const giveKudos = () => {
    setTimeout(() => {
      const kudoBtn = getEligibleKudoButtons()?.[0];
      if(kudoBtn) {
        // mockFillKudo(kudoBtn); /* for testing purposes only */
        kudoBtn.parentNode.click();
        giveKudos();
      } else {
        if(Refresh_Interval_Active)
        {
          console.log("Timeout Started:" + Date());
          var currentDateObj = new Date();
          var numberOfMlSeconds = currentDateObj.getTime();
          var refresh_Date = new Date(numberOfMlSeconds + Number(Refresh_Page_Interval));
          console.log("Refresh Time:" + refresh_Date);
          setTimeout(refreshPage, Refresh_Page_Interval);
        }
      }
    }, KUDOS_INTERVAL);
  };

  // toggle box styles
  const toggleKudosBox = () => {
    const num = kudosBtns.length;
    if (num) {
      btn.classList.remove('hidden');

      if (num < KUDOS_LOCKOUT) {
        btn.classList.add('lockout');
      } else {
        btn.classList.remove('lockout');
      }
    } else {
      btn.classList.add('hidden');
    }
  };

  const refreshPage = () => {
    console.log("Refresh page");
    window.location.reload();
    if(Auto_Kudos) {myInt = setTimeout(giveKudos, 1000);}
  };

  const restore_options = () => {
    // Use default values
    chrome.storage.sync.get({
      refreshInterval: 60,
      refreshIntervalActive: false,
      autoKudosActive: false
    }, function(items) {
      Refresh_Page_Interval = items.refreshInterval * 60000;
      Refresh_Interval_Active = items.refreshIntervalActive;
      Auto_Kudos = items.autoKudosActive;
    });
  };

  const getEligibleKudoButtons = () => {
    const activityAvatars = document.querySelectorAll('[data-testid="owner-avatar"]');
    const buttons = [];

    activityAvatars.forEach(avatar => {
      // activity card is not your own
      if (!avatar.href.includes(viewingAthleteId) && !avatar.baseURI.includes('my_activity')) {
        const activityCard = avatar.closest('[data-testid="web-feed-entry"]') /* solo activity */;

        if(!activityCard.innerHTML.includes(viewingAthleteId))
        {
          activityCard.querySelector(els) && buttons.push(activityCard.querySelector(els));
        }
      }
    });

    return buttons;
  };

  // publish number of kudos
  const updateCountNum = () => {
    const count = document.getElementById('skCount');
    viewingAthleteId = document.querySelector('.user-menu > a')?.href?.match(/\d+/)?.[0]; // store viewing athlete id

    if (count) {
      setInterval(() => {
        kudosBtns = getEligibleKudoButtons();
        count.innerHTML = kudosBtns.length;
        toggleKudosBox();
      }, KUDOS_INTERVAL);
    }
  };

  // read config at startup
  const startProcess = () => {
    console.log("AK:"+ Auto_Kudos + " RI:" + Refresh_Page_Interval +  " RIA:" + Refresh_Interval_Active);
    if(Auto_Kudos) {
      myInt = setTimeout(giveKudos, 1000);
    }
  };

  init();
  myInterval = setTimeout(startProcess,5000);
}());