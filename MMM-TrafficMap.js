
/*********************************

  Magic Mirror Module:
  MMM-MyCommute
  By Jeff Clarke

  Fork of mrx-work-traffic
  By Dominic Marx
  https://github.com/domsen123/mrx-work-traffic

  MIT Licensed

*********************************/

Module.register('MMM-TrafficMap', {

  defaults: {
    startTime: '00:00',
    endTime: '23:59',
    hideDays: [],
    pollFrequency: 1 * 60 * 1000, //every ten minutes, in milliseconds
  },


  start: function() {

    Log.info('Starting module: ' + this.name);

    this.loading = true;
    this.inWindow = true;
    this.isHidden = false;
    this.isForcedShow = false;

    //start data poll
    this.getData();
    var self = this;
    setInterval(function() {
      self.getData();
    }, this.config.pollFrequency);

  },

  /*
    function isInWindow()

    @param start
      STRING display start time in 24 hour format e.g.: 06:00

    @param end
      STRING display end time in 24 hour format e.g.: 10:00

    @param hideDays
      ARRAY of numbers representing days of the week during which
      this tested item shall not be displayed.  Sun = 0, Sat = 6
      e.g.: [3,4] to hide the module on Wed & Thurs

    returns TRUE if current time is within start and end AND
    today is not in the list of days to hide.

  */
  isInWindow: function(start, end, hideDays) {
      var now = new Date();
      var startTimeSplit = start.split(":");
      var endTimeSplit = end.split(":");
      var startTime = new Date();
      startTime.setHours(startTimeSplit[0], startTimeSplit[1]);
      var endTime = new Date();
      endTime.setHours(endTimeSplit[0], endTimeSplit[1]);
      if ( (now < startTime) || (now > endTime) ) {
      //  Log.log("now < start or now > end");
        return false;
      } else if ( hideDays.indexOf( now.getDay() ) != -1) {
      //  Log.log("day hidden");
        return false;
      }

    return true;
  },

  getData: function() {
    //only poll if in window

    if ( this.isInWindow( this.config.startTime, this.config.endTime, this.config.hideDays ) ) {
      //build URLs

      this.inWindow = true;

      if (this.loading) {
        this.loading = false;
        if (this.isHidden) {
          this.updateDom();
          this.show(1000, {lockString: this.identifier});
        } else {
          this.updateDom(1000);
        }
      } else {
        this.updateDom();
        this.show(1000, {lockString: this.identifier});
      }
      this.isHidden = false;

    } else if (!this.isForcedShow) {
      this.hide(1000, {lockString: this.identifier});
      this.inWindow = false;
      this.isHidden = true;
    }

  },



  getDom: function() {

    var wrapper = document.createElement("div");

    if (this.loading) {
      var loading = document.createElement("div");
        loading.innerHTML = this.translate("LOADING");
        loading.className = "dimmed light small";
        wrapper.appendChild(loading);
      return wrapper
    }



    var img = document.createElement("img");
//    var url = "https://dev.virtualearth.net/REST/v1/Imagery/Map/CanvasDark/50.615,3.015/12?mapSize=750,550&mapLayer=TrafficFlow&key=AmtRjou5sBxXMlURH-9E_c6oRfgAt26E65nIGxuQx4XbAfvXwjov_eTcZIs5Mkq3&pp=50.562189,2.893253;;HO&pp=50.655314,2.8946148;;SO&pp=50.606589,3.0996378;;AD&rand=";
    var url = "https://dev.virtualearth.net/REST/v1/Imagery/Map/CanvasDark/50.60,3.015/12?mapSize=750,550&mapLayer=TrafficFlow&key=AmtRjou5sBxXMlURH-9E_c6oRfgAt26E65nIGxuQx4XbAfvXwjov_eTcZIs5Mkq3&pp=50.562189,2.893253;;HO&pp=50.6042442,3.1308552;;LE&pp=50.606589,3.0996378;;AD&rand=";
    var rand = Math.floor(Math.random() * 1000) + 1;
    url = url + rand;
    img.src = url;

    img.style.maxWidth = "600px"
    wrapper.appendChild(img);



    return wrapper;
  },


  notificationReceived: function(notification, payload, sender) {

    if ( notification === 'DOM_OBJECTS_CREATED' && !this.inWindow) {
      this.hide(0, {lockString: this.identifier});
      this.isHidden = true;
    } else if ( notification === 'HIDE_TRAFFICMAP') {
       Log.log("HIDE received");
      this.hide(0, {lockString: this.identifier});
      this.isForcedShow = false;
      this.isHidden = true;
    } else if ( notification === 'SHOW_TRAFFICMAP') {
      Log.log("SHOW received");
      if (this.isHidden) {
        this.isForcedShow = true;
        this.loading=false;
        this.updateDom();
        this.show(1000, {lockString: this.identifier});
      }
      this.isHidden = false;
    }
  }

});
